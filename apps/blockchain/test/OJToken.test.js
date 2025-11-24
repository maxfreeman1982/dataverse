const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("OJToken", function () {
  let ojToken;
  let owner, investor1, investor2, investor3;

  const PROJECT_ID = "solar-farm-001";
  const PROJECT_NAME = "Solar Farm Alpha";
  const SYMBOL = "OJSFA";
  const FUNDING_GOAL = ethers.parseEther("1000000"); // 1M EUR
  const EXPECTED_RETURN = 850; // 8.5%
  const PROJECT_DURATION = 24; // 24 months
  const MINIMUM_INVESTMENT = ethers.parseEther("1000"); // 1000 EUR

  beforeEach(async function () {
    [owner, investor1, investor2, investor3] = await ethers.getSigners();

    const fundingDeadline = (await time.latest()) + (90 * 24 * 60 * 60); // 90 days from now

    const OJToken = await ethers.getContractFactory("OJToken");
    ojToken = await OJToken.deploy(
      PROJECT_ID,
      PROJECT_NAME,
      SYMBOL,
      FUNDING_GOAL,
      EXPECTED_RETURN,
      PROJECT_DURATION,
      MINIMUM_INVESTMENT,
      fundingDeadline
    );
    await ojToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ojToken.owner()).to.equal(owner.address);
    });

    it("Should set the correct project details", async function () {
      expect(await ojToken.projectId()).to.equal(PROJECT_ID);
      expect(await ojToken.name()).to.equal(PROJECT_NAME);
      expect(await ojToken.symbol()).to.equal(SYMBOL);
      expect(await ojToken.fundingGoal()).to.equal(FUNDING_GOAL);
      expect(await ojToken.expectedReturn()).to.equal(EXPECTED_RETURN);
      expect(await ojToken.projectDuration()).to.equal(PROJECT_DURATION);
      expect(await ojToken.minimumInvestment()).to.equal(MINIMUM_INVESTMENT);
    });

    it("Should initialize with FUNDRAISING status", async function () {
      expect(await ojToken.status()).to.equal(0); // ProjectStatus.FUNDRAISING
    });

    it("Should initialize with zero raised amount", async function () {
      expect(await ojToken.totalRaised()).to.equal(0);
    });
  });

  describe("Investments", function () {
    it("Should accept valid investments", async function () {
      const investmentAmount = ethers.parseEther("5000");

      await expect(ojToken.connect(investor1).invest({ value: investmentAmount }))
        .to.emit(ojToken, "Investment")
        .withArgs(investor1.address, investmentAmount, investmentAmount);

      expect(await ojToken.balanceOf(investor1.address)).to.equal(investmentAmount);
      expect(await ojToken.totalRaised()).to.equal(investmentAmount);
      expect(await ojToken.totalInvestors()).to.equal(1);
    });

    it("Should reject investments below minimum", async function () {
      const lowAmount = ethers.parseEther("500"); // Below 1000 EUR minimum

      await expect(
        ojToken.connect(investor1).invest({ value: lowAmount })
      ).to.be.revertedWith("Below minimum investment");
    });

    it("Should reject investments when paused", async function () {
      await ojToken.pause();

      const investmentAmount = ethers.parseEther("5000");
      await expect(
        ojToken.connect(investor1).invest({ value: investmentAmount })
      ).to.be.revertedWithCustomError(ojToken, "EnforcedPause");
    });

    it("Should reject investments after funding deadline", async function () {
      // Fast forward past the deadline
      await time.increase(91 * 24 * 60 * 60); // 91 days

      const investmentAmount = ethers.parseEther("5000");
      await expect(
        ojToken.connect(investor1).invest({ value: investmentAmount })
      ).to.be.revertedWith("Funding period ended");
    });

    it("Should handle multiple investors correctly", async function () {
      const amount1 = ethers.parseEther("10000");
      const amount2 = ethers.parseEther("20000");
      const amount3 = ethers.parseEther("15000");

      await ojToken.connect(investor1).invest({ value: amount1 });
      await ojToken.connect(investor2).invest({ value: amount2 });
      await ojToken.connect(investor3).invest({ value: amount3 });

      expect(await ojToken.totalInvestors()).to.equal(3);
      expect(await ojToken.totalRaised()).to.equal(amount1 + amount2 + amount3);
      expect(await ojToken.balanceOf(investor1.address)).to.equal(amount1);
      expect(await ojToken.balanceOf(investor2.address)).to.equal(amount2);
      expect(await ojToken.balanceOf(investor3.address)).to.equal(amount3);
    });

    it("Should track same investor investing multiple times", async function () {
      const amount1 = ethers.parseEther("5000");
      const amount2 = ethers.parseEther("3000");

      await ojToken.connect(investor1).invest({ value: amount1 });
      await ojToken.connect(investor1).invest({ value: amount2 });

      // Should still count as 1 investor
      expect(await ojToken.totalInvestors()).to.equal(1);
      expect(await ojToken.balanceOf(investor1.address)).to.equal(amount1 + amount2);
    });
  });

  describe("Status Management", function () {
    it("Should allow owner to update status", async function () {
      await ojToken.updateStatus(1); // ProjectStatus.FUNDED
      expect(await ojToken.status()).to.equal(1);
    });

    it("Should reject status updates from non-owners", async function () {
      await expect(
        ojToken.connect(investor1).updateStatus(1)
      ).to.be.revertedWithCustomError(ojToken, "OwnableUnauthorizedAccount");
    });

    it("Should reject investments when not in FUNDRAISING", async function () {
      await ojToken.updateStatus(1); // FUNDED

      const investmentAmount = ethers.parseEther("5000");
      await expect(
        ojToken.connect(investor1).invest({ value: investmentAmount })
      ).to.be.revertedWith("Project not in fundraising");
    });
  });

  describe("Returns Distribution", function () {
    beforeEach(async function () {
      // Setup: 3 investors with different amounts
      await ojToken.connect(investor1).invest({ value: ethers.parseEther("100000") }); // 10%
      await ojToken.connect(investor2).invest({ value: ethers.parseEther("200000") }); // 20%
      await ojToken.connect(investor3).invest({ value: ethers.parseEther("700000") }); // 70%

      // Change status to ACTIVE
      await ojToken.updateStatus(2); // ProjectStatus.ACTIVE
    });

    it("Should distribute returns proportionally", async function () {
      const returnAmount = ethers.parseEther("50000"); // 50K EUR in returns

      const investor1BalanceBefore = await ethers.provider.getBalance(investor1.address);
      const investor2BalanceBefore = await ethers.provider.getBalance(investor2.address);
      const investor3BalanceBefore = await ethers.provider.getBalance(investor3.address);

      await ojToken.distributeReturns({ value: returnAmount });

      // Check that returns were added to claimable amounts
      expect(await ojToken.getClaimableReturns(investor1.address)).to.equal(ethers.parseEther("5000")); // 10%
      expect(await ojToken.getClaimableReturns(investor2.address)).to.equal(ethers.parseEther("10000")); // 20%
      expect(await ojToken.getClaimableReturns(investor3.address)).to.equal(ethers.parseEther("35000")); // 70%
    });

    it("Should allow investors to claim their returns", async function () {
      const returnAmount = ethers.parseEther("50000");
      await ojToken.distributeReturns({ value: returnAmount });

      const investor1BalanceBefore = await ethers.provider.getBalance(investor1.address);

      // Claim returns
      const tx = await ojToken.connect(investor1).claimReturns();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const investor1BalanceAfter = await ethers.provider.getBalance(investor1.address);
      const expectedReturn = ethers.parseEther("5000");

      // Balance should increase by returns minus gas
      expect(investor1BalanceAfter).to.equal(investor1BalanceBefore + expectedReturn - gasUsed);

      // Claimable should be zero after claim
      expect(await ojToken.getClaimableReturns(investor1.address)).to.equal(0);
    });

    it("Should emit ReturnsClaimed event", async function () {
      const returnAmount = ethers.parseEther("50000");
      await ojToken.distributeReturns({ value: returnAmount });

      const expectedReturn = ethers.parseEther("5000");
      await expect(ojToken.connect(investor1).claimReturns())
        .to.emit(ojToken, "ReturnsClaimed")
        .withArgs(investor1.address, expectedReturn);
    });

    it("Should reject claims when no returns available", async function () {
      await expect(
        ojToken.connect(investor1).claimReturns()
      ).to.be.revertedWith("No returns to claim");
    });

    it("Should track total returns distributed", async function () {
      const returnAmount1 = ethers.parseEther("30000");
      const returnAmount2 = ethers.parseEther("20000");

      await ojToken.distributeReturns({ value: returnAmount1 });
      await ojToken.distributeReturns({ value: returnAmount2 });

      expect(await ojToken.totalReturns()).to.equal(returnAmount1 + returnAmount2);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await ojToken.pause();
      expect(await ojToken.paused()).to.be.true;

      await ojToken.unpause();
      expect(await ojToken.paused()).to.be.false;
    });

    it("Should block investments when paused", async function () {
      await ojToken.pause();

      await expect(
        ojToken.connect(investor1).invest({ value: ethers.parseEther("5000") })
      ).to.be.revertedWithCustomError(ojToken, "EnforcedPause");
    });

    it("Should block return distributions when paused", async function () {
      await ojToken.connect(investor1).invest({ value: ethers.parseEther("100000") });
      await ojToken.updateStatus(2); // ACTIVE
      await ojToken.pause();

      await expect(
        ojToken.distributeReturns({ value: ethers.parseEther("10000") })
      ).to.be.revertedWithCustomError(ojToken, "EnforcedPause");
    });
  });

  describe("Investor Information", function () {
    beforeEach(async function () {
      await ojToken.connect(investor1).invest({ value: ethers.parseEther("50000") });
      await ojToken.connect(investor2).invest({ value: ethers.parseEther("100000") });
    });

    it("Should return correct investor info", async function () {
      const info = await ojToken.getInvestorInfo(investor1.address);

      expect(info.tokenBalance).to.equal(ethers.parseEther("50000"));
      expect(info.totalInvested).to.equal(ethers.parseEther("50000"));
      expect(info.claimableReturns).to.equal(0);
      expect(info.totalClaimed).to.equal(0);
    });

    it("Should update investor info after distributions", async function () {
      await ojToken.updateStatus(2); // ACTIVE
      await ojToken.distributeReturns({ value: ethers.parseEther("30000") });

      const info = await ojToken.getInvestorInfo(investor1.address);

      // investor1 has 50K out of 150K total = 33.33%
      expect(info.claimableReturns).to.equal(ethers.parseEther("10000")); // 33.33% of 30K
    });
  });

  describe("Project Statistics", function () {
    it("Should return correct project stats", async function () {
      await ojToken.connect(investor1).invest({ value: ethers.parseEther("300000") });
      await ojToken.connect(investor2).invest({ value: ethers.parseEther("500000") });

      const stats = await ojToken.getProjectStats();

      expect(stats.raised).to.equal(ethers.parseEther("800000"));
      expect(stats.goal).to.equal(FUNDING_GOAL);
      expect(stats.investors).to.equal(2);
      expect(stats.distributedReturns).to.equal(0);
      expect(stats.currentStatus).to.equal(0); // FUNDRAISING
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero token balance correctly", async function () {
      const info = await ojToken.getInvestorInfo(investor1.address);
      expect(info.tokenBalance).to.equal(0);
    });

    it("Should not mint tokens on receive fallback", async function () {
      // Send ETH directly to contract
      await owner.sendTransaction({
        to: await ojToken.getAddress(),
        value: ethers.parseEther("1")
      });

      // Should not mint tokens
      expect(await ojToken.balanceOf(owner.address)).to.equal(0);
    });
  });
});
