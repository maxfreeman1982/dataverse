const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("OJInvestmentManager", function () {
  let investmentManager;
  let owner, admin, investor1, investor2, bankPartner;

  const PROJECT_1 = {
    id: "solar-farm-001",
    name: "Solar Farm Alpha",
    symbol: "OJSFA",
    fundingGoal: ethers.parseEther("1000000"),
    expectedReturn: 850,
    duration: 24,
    minimumInvestment: ethers.parseEther("1000")
  };

  const PROJECT_2 = {
    id: "wind-farm-002",
    name: "Wind Farm Beta",
    symbol: "OJWFB",
    fundingGoal: ethers.parseEther("2000000"),
    expectedReturn: 920,
    duration: 36,
    minimumInvestment: ethers.parseEther("5000")
  };

  beforeEach(async function () {
    [owner, admin, investor1, investor2, bankPartner] = await ethers.getSigners();

    const OJInvestmentManager = await ethers.getContractFactory("OJInvestmentManager");
    investmentManager = await OJInvestmentManager.deploy();
    await investmentManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await investmentManager.owner()).to.equal(owner.address);
    });

    it("Should set deployer as admin", async function () {
      expect(await investmentManager.isAdmin(owner.address)).to.be.true;
    });

    it("Should initialize with zero projects", async function () {
      expect(await investmentManager.totalProjects()).to.equal(0);
      expect(await investmentManager.totalFundsRaised()).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should allow owner to add admin", async function () {
      await expect(investmentManager.addAdmin(admin.address))
        .to.emit(investmentManager, "AdminAdded")
        .withArgs(admin.address);

      expect(await investmentManager.isAdmin(admin.address)).to.be.true;
    });

    it("Should allow owner to remove admin", async function () {
      await investmentManager.addAdmin(admin.address);

      await expect(investmentManager.removeAdmin(admin.address))
        .to.emit(investmentManager, "AdminRemoved")
        .withArgs(admin.address);

      expect(await investmentManager.isAdmin(admin.address)).to.be.false;
    });

    it("Should allow owner to add bank partner", async function () {
      await expect(investmentManager.addBankPartner(bankPartner.address))
        .to.emit(investmentManager, "BankPartnerAdded")
        .withArgs(bankPartner.address);

      expect(await investmentManager.isBankPartner(bankPartner.address)).to.be.true;
    });

    it("Should reject role operations from non-owners", async function () {
      await expect(
        investmentManager.connect(investor1).addAdmin(admin.address)
      ).to.be.revertedWithCustomError(investmentManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Project Creation", function () {
    it("Should allow admin to create project", async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      await expect(
        investmentManager.createProject(
          PROJECT_1.id,
          PROJECT_1.name,
          PROJECT_1.symbol,
          PROJECT_1.fundingGoal,
          PROJECT_1.expectedReturn,
          PROJECT_1.duration,
          PROJECT_1.minimumInvestment,
          fundingDeadline
        )
      ).to.emit(investmentManager, "ProjectCreated");

      expect(await investmentManager.totalProjects()).to.equal(1);
    });

    it("Should return correct token address", async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      const tx = await investmentManager.createProject(
        PROJECT_1.id,
        PROJECT_1.name,
        PROJECT_1.symbol,
        PROJECT_1.fundingGoal,
        PROJECT_1.expectedReturn,
        PROJECT_1.duration,
        PROJECT_1.minimumInvestment,
        fundingDeadline
      );

      const tokenAddress = await investmentManager.getProjectToken(PROJECT_1.id);
      expect(tokenAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should reject duplicate project IDs", async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      await investmentManager.createProject(
        PROJECT_1.id,
        PROJECT_1.name,
        PROJECT_1.symbol,
        PROJECT_1.fundingGoal,
        PROJECT_1.expectedReturn,
        PROJECT_1.duration,
        PROJECT_1.minimumInvestment,
        fundingDeadline
      );

      await expect(
        investmentManager.createProject(
          PROJECT_1.id,
          "Different Name",
          "DIFF",
          ethers.parseEther("500000"),
          800,
          12,
          ethers.parseEther("1000"),
          fundingDeadline
        )
      ).to.be.revertedWith("Project already exists");
    });

    it("Should reject project creation from non-admin", async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      await expect(
        investmentManager.connect(investor1).createProject(
          PROJECT_1.id,
          PROJECT_1.name,
          PROJECT_1.symbol,
          PROJECT_1.fundingGoal,
          PROJECT_1.expectedReturn,
          PROJECT_1.duration,
          PROJECT_1.minimumInvestment,
          fundingDeadline
        )
      ).to.be.revertedWith("Not an admin");
    });

    it("Should track multiple projects", async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      await investmentManager.createProject(
        PROJECT_1.id,
        PROJECT_1.name,
        PROJECT_1.symbol,
        PROJECT_1.fundingGoal,
        PROJECT_1.expectedReturn,
        PROJECT_1.duration,
        PROJECT_1.minimumInvestment,
        fundingDeadline
      );

      await investmentManager.createProject(
        PROJECT_2.id,
        PROJECT_2.name,
        PROJECT_2.symbol,
        PROJECT_2.fundingGoal,
        PROJECT_2.expectedReturn,
        PROJECT_2.duration,
        PROJECT_2.minimumInvestment,
        fundingDeadline
      );

      expect(await investmentManager.totalProjects()).to.equal(2);

      const allProjects = await investmentManager.getAllProjects();
      expect(allProjects.length).to.equal(2);
      expect(allProjects[0]).to.equal(PROJECT_1.id);
      expect(allProjects[1]).to.equal(PROJECT_2.id);
    });
  });

  describe("Investments", function () {
    let tokenAddress;

    beforeEach(async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      await investmentManager.createProject(
        PROJECT_1.id,
        PROJECT_1.name,
        PROJECT_1.symbol,
        PROJECT_1.fundingGoal,
        PROJECT_1.expectedReturn,
        PROJECT_1.duration,
        PROJECT_1.minimumInvestment,
        fundingDeadline
      );

      tokenAddress = await investmentManager.getProjectToken(PROJECT_1.id);
    });

    it("Should allow investment in existing project", async function () {
      const investmentAmount = ethers.parseEther("10000");

      await expect(
        investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: investmentAmount })
      ).to.emit(investmentManager, "InvestmentMade")
        .withArgs(PROJECT_1.id, investor1.address, investmentAmount);

      expect(await investmentManager.totalFundsRaised()).to.equal(investmentAmount);
    });

    it("Should route funds to token contract", async function () {
      const investmentAmount = ethers.parseEther("10000");

      await investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: investmentAmount });

      // Check token balance
      const OJToken = await ethers.getContractFactory("OJToken");
      const token = OJToken.attach(tokenAddress);

      expect(await token.balanceOf(investor1.address)).to.equal(investmentAmount);
    });

    it("Should track investor projects", async function () {
      const investmentAmount = ethers.parseEther("10000");

      await investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: investmentAmount });

      const investorProjects = await investmentManager.getInvestorProjects(investor1.address);
      expect(investorProjects.length).to.equal(1);
      expect(investorProjects[0]).to.equal(PROJECT_1.id);
    });

    it("Should not duplicate investor project list", async function () {
      const investmentAmount = ethers.parseEther("10000");

      // Invest twice in same project
      await investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: investmentAmount });
      await investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: investmentAmount });

      const investorProjects = await investmentManager.getInvestorProjects(investor1.address);
      expect(investorProjects.length).to.equal(1);
    });

    it("Should reject investment in non-existent project", async function () {
      const investmentAmount = ethers.parseEther("10000");

      await expect(
        investmentManager.connect(investor1).investInProject("non-existent", { value: investmentAmount })
      ).to.be.revertedWith("Project does not exist");
    });

    it("Should handle multiple investors", async function () {
      const amount1 = ethers.parseEther("20000");
      const amount2 = ethers.parseEther("30000");

      await investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: amount1 });
      await investmentManager.connect(investor2).investInProject(PROJECT_1.id, { value: amount2 });

      expect(await investmentManager.totalFundsRaised()).to.equal(amount1 + amount2);

      const OJToken = await ethers.getContractFactory("OJToken");
      const token = OJToken.attach(tokenAddress);

      expect(await token.balanceOf(investor1.address)).to.equal(amount1);
      expect(await token.balanceOf(investor2.address)).to.equal(amount2);
    });
  });

  describe("Returns Distribution", function () {
    let tokenAddress;

    beforeEach(async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      await investmentManager.createProject(
        PROJECT_1.id,
        PROJECT_1.name,
        PROJECT_1.symbol,
        PROJECT_1.fundingGoal,
        PROJECT_1.expectedReturn,
        PROJECT_1.duration,
        PROJECT_1.minimumInvestment,
        fundingDeadline
      );

      tokenAddress = await investmentManager.getProjectToken(PROJECT_1.id);

      // Setup: investors
      await investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: ethers.parseEther("100000") });
      await investmentManager.connect(investor2).investInProject(PROJECT_1.id, { value: ethers.parseEther("200000") });

      // Update status to ACTIVE
      await investmentManager.updateProjectStatus(PROJECT_1.id, 2); // ProjectStatus.ACTIVE
    });

    it("Should allow admin to distribute returns", async function () {
      const returnAmount = ethers.parseEther("30000");

      await expect(
        investmentManager.distributeReturns(PROJECT_1.id, { value: returnAmount })
      ).to.emit(investmentManager, "ReturnsDistributed")
        .withArgs(PROJECT_1.id, returnAmount);
    });

    it("Should route returns to token contract", async function () {
      const returnAmount = ethers.parseEther("30000");

      await investmentManager.distributeReturns(PROJECT_1.id, { value: returnAmount });

      const OJToken = await ethers.getContractFactory("OJToken");
      const token = OJToken.attach(tokenAddress);

      expect(await token.totalReturns()).to.equal(returnAmount);
    });

    it("Should reject distribution from non-admin", async function () {
      const returnAmount = ethers.parseEther("30000");

      await expect(
        investmentManager.connect(investor1).distributeReturns(PROJECT_1.id, { value: returnAmount })
      ).to.be.revertedWith("Not an admin");
    });

    it("Should reject distribution to non-existent project", async function () {
      const returnAmount = ethers.parseEther("30000");

      await expect(
        investmentManager.distributeReturns("non-existent", { value: returnAmount })
      ).to.be.revertedWith("Project does not exist");
    });
  });

  describe("Project Status Updates", function () {
    beforeEach(async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      await investmentManager.createProject(
        PROJECT_1.id,
        PROJECT_1.name,
        PROJECT_1.symbol,
        PROJECT_1.fundingGoal,
        PROJECT_1.expectedReturn,
        PROJECT_1.duration,
        PROJECT_1.minimumInvestment,
        fundingDeadline
      );
    });

    it("Should allow admin to update project status", async function () {
      await investmentManager.updateProjectStatus(PROJECT_1.id, 1); // ProjectStatus.FUNDED

      const tokenAddress = await investmentManager.getProjectToken(PROJECT_1.id);
      const OJToken = await ethers.getContractFactory("OJToken");
      const token = OJToken.attach(tokenAddress);

      expect(await token.status()).to.equal(1);
    });

    it("Should reject status update from non-admin", async function () {
      await expect(
        investmentManager.connect(investor1).updateProjectStatus(PROJECT_1.id, 1)
      ).to.be.revertedWith("Not an admin");
    });

    it("Should reject status update for non-existent project", async function () {
      await expect(
        investmentManager.updateProjectStatus("non-existent", 1)
      ).to.be.revertedWith("Project does not exist");
    });
  });

  describe("Global Statistics", function () {
    it("Should track global stats correctly", async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      // Create 2 projects
      await investmentManager.createProject(
        PROJECT_1.id,
        PROJECT_1.name,
        PROJECT_1.symbol,
        PROJECT_1.fundingGoal,
        PROJECT_1.expectedReturn,
        PROJECT_1.duration,
        PROJECT_1.minimumInvestment,
        fundingDeadline
      );

      await investmentManager.createProject(
        PROJECT_2.id,
        PROJECT_2.name,
        PROJECT_2.symbol,
        PROJECT_2.fundingGoal,
        PROJECT_2.expectedReturn,
        PROJECT_2.duration,
        PROJECT_2.minimumInvestment,
        fundingDeadline
      );

      // Make investments
      await investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: ethers.parseEther("50000") });
      await investmentManager.connect(investor2).investInProject(PROJECT_2.id, { value: ethers.parseEther("100000") });

      const stats = await investmentManager.getGlobalStats();

      expect(stats.projects).to.equal(2);
      expect(stats.fundsRaised).to.equal(ethers.parseEther("150000"));
    });
  });

  describe("Emergency Withdraw", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // Send some ETH to contract
      await investor1.sendTransaction({
        to: await investmentManager.getAddress(),
        value: ethers.parseEther("10")
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await investmentManager.getAddress());

      const tx = await investmentManager.emergencyWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + contractBalance - gasUsed);
    });

    it("Should reject emergency withdraw from non-owner", async function () {
      await expect(
        investmentManager.connect(investor1).emergencyWithdraw()
      ).to.be.revertedWithCustomError(investmentManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Receive Fallback", function () {
    it("Should accept ETH via receive", async function () {
      await expect(
        investor1.sendTransaction({
          to: await investmentManager.getAddress(),
          value: ethers.parseEther("1")
        })
      ).to.not.be.reverted;
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete investment flow", async function () {
      const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60);

      // 1. Create project
      await investmentManager.createProject(
        PROJECT_1.id,
        PROJECT_1.name,
        PROJECT_1.symbol,
        PROJECT_1.fundingGoal,
        PROJECT_1.expectedReturn,
        PROJECT_1.duration,
        PROJECT_1.minimumInvestment,
        fundingDeadline
      );

      const tokenAddress = await investmentManager.getProjectToken(PROJECT_1.id);
      const OJToken = await ethers.getContractFactory("OJToken");
      const token = OJToken.attach(tokenAddress);

      // 2. Multiple investors invest
      await investmentManager.connect(investor1).investInProject(PROJECT_1.id, { value: ethers.parseEther("300000") });
      await investmentManager.connect(investor2).investInProject(PROJECT_1.id, { value: ethers.parseEther("700000") });

      // 3. Update status to ACTIVE
      await investmentManager.updateProjectStatus(PROJECT_1.id, 2);

      // 4. Distribute returns
      const returnAmount = ethers.parseEther("100000");
      await investmentManager.distributeReturns(PROJECT_1.id, { value: returnAmount });

      // 5. Verify distribution
      expect(await token.getClaimableReturns(investor1.address)).to.equal(ethers.parseEther("30000")); // 30%
      expect(await token.getClaimableReturns(investor2.address)).to.equal(ethers.parseEther("70000")); // 70%

      // 6. Verify global stats
      const stats = await investmentManager.getGlobalStats();
      expect(stats.projects).to.equal(1);
      expect(stats.fundsRaised).to.equal(ethers.parseEther("1000000"));
    });
  });
});
