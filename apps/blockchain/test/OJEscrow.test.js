const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OJEscrow", function () {
  let escrow;
  let owner, spvManager, bankPartner, investor1, investor2, beneficiary;

  const PROJECT_1 = {
    id: "solar-farm-001",
    targetAmount: ethers.parseEther("1000000")
  };

  const PROJECT_2 = {
    id: "wind-farm-002",
    targetAmount: ethers.parseEther("2000000")
  };

  beforeEach(async function () {
    [owner, spvManager, bankPartner, investor1, investor2, beneficiary] = await ethers.getSigners();

    const OJEscrow = await ethers.getContractFactory("OJEscrow");
    escrow = await OJEscrow.deploy();
    await escrow.waitForDeployment();

    // Setup roles
    await escrow.addSpvManager(spvManager.address);
    await escrow.addBankPartner(bankPartner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero request count", async function () {
      expect(await escrow.requestCount()).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should allow owner to add SPV manager", async function () {
      const newManager = investor1.address;
      await escrow.addSpvManager(newManager);
      expect(await escrow.isSpvManager(newManager)).to.be.true;
    });

    it("Should allow owner to remove SPV manager", async function () {
      await escrow.removeSpvManager(spvManager.address);
      expect(await escrow.isSpvManager(spvManager.address)).to.be.false;
    });

    it("Should allow owner to add bank partner", async function () {
      const newBank = investor1.address;
      await escrow.addBankPartner(newBank);
      expect(await escrow.isBankPartner(newBank)).to.be.true;
    });

    it("Should allow owner to remove bank partner", async function () {
      await escrow.removeBankPartner(bankPartner.address);
      expect(await escrow.isBankPartner(bankPartner.address)).to.be.false;
    });

    it("Should reject role operations from non-owners", async function () {
      await expect(
        escrow.connect(investor1).addSpvManager(investor2.address)
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("Escrow Account Creation", function () {
    it("Should allow owner to create escrow account", async function () {
      await expect(escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount))
        .to.emit(escrow, "EscrowCreated")
        .withArgs(PROJECT_1.id, PROJECT_1.targetAmount);

      const account = await escrow.getEscrowAccount(PROJECT_1.id);
      expect(account.balance).to.equal(0);
      expect(account.targetAmount).to.equal(PROJECT_1.targetAmount);
      expect(account.isActive).to.be.true;
    });

    it("Should reject duplicate escrow accounts", async function () {
      await escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount);

      await expect(
        escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount)
      ).to.be.revertedWith("Escrow already exists");
    });

    it("Should reject creation from non-owner", async function () {
      await expect(
        escrow.connect(investor1).createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount)
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("Fund Deposits", function () {
    beforeEach(async function () {
      await escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount);
    });

    it("Should accept fund deposits", async function () {
      const depositAmount = ethers.parseEther("50000");

      await expect(escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: depositAmount }))
        .to.emit(escrow, "FundsDeposited")
        .withArgs(PROJECT_1.id, depositAmount);

      const account = await escrow.getEscrowAccount(PROJECT_1.id);
      expect(account.balance).to.equal(depositAmount);
    });

    it("Should accumulate multiple deposits", async function () {
      const deposit1 = ethers.parseEther("30000");
      const deposit2 = ethers.parseEther("20000");

      await escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: deposit1 });
      await escrow.connect(investor2).depositFunds(PROJECT_1.id, { value: deposit2 });

      const account = await escrow.getEscrowAccount(PROJECT_1.id);
      expect(account.balance).to.equal(deposit1 + deposit2);
    });

    it("Should reject zero deposits", async function () {
      await expect(
        escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: 0 })
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should reject deposits to inactive escrow", async function () {
      await expect(
        escrow.connect(investor1).depositFunds(PROJECT_2.id, { value: ethers.parseEther("1000") })
      ).to.be.revertedWith("Escrow not active");
    });
  });

  describe("Release Requests", function () {
    beforeEach(async function () {
      await escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount);
      await escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: ethers.parseEther("100000") });
    });

    it("Should allow SPV manager to request release", async function () {
      const releaseAmount = ethers.parseEther("30000");
      const reason = "Milestone 1 payment";

      await expect(
        escrow.connect(spvManager).requestRelease(
          PROJECT_1.id,
          releaseAmount,
          beneficiary.address,
          reason
        )
      ).to.emit(escrow, "ReleaseRequested")
        .withArgs(0, PROJECT_1.id, releaseAmount);

      const requestDetails = await escrow.getRequestDetails(0);
      expect(requestDetails.projectId).to.equal(PROJECT_1.id);
      expect(requestDetails.amount).to.equal(releaseAmount);
      expect(requestDetails.beneficiary).to.equal(beneficiary.address);
      expect(requestDetails.reason).to.equal(reason);
      expect(requestDetails.approved).to.be.false;
      expect(requestDetails.processed).to.be.false;
    });

    it("Should increment request count", async function () {
      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("10000"),
        beneficiary.address,
        "Payment 1"
      );

      expect(await escrow.requestCount()).to.equal(1);

      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("20000"),
        beneficiary.address,
        "Payment 2"
      );

      expect(await escrow.requestCount()).to.equal(2);
    });

    it("Should track project requests", async function () {
      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("10000"),
        beneficiary.address,
        "Payment 1"
      );

      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("20000"),
        beneficiary.address,
        "Payment 2"
      );

      const projectRequests = await escrow.getProjectRequests(PROJECT_1.id);
      expect(projectRequests.length).to.equal(2);
      expect(projectRequests[0]).to.equal(0);
      expect(projectRequests[1]).to.equal(1);
    });

    it("Should reject request from non-SPV manager", async function () {
      await expect(
        escrow.connect(investor1).requestRelease(
          PROJECT_1.id,
          ethers.parseEther("10000"),
          beneficiary.address,
          "Payment"
        )
      ).to.be.revertedWith("Not an SPV manager");
    });

    it("Should reject request with zero amount", async function () {
      await expect(
        escrow.connect(spvManager).requestRelease(
          PROJECT_1.id,
          0,
          beneficiary.address,
          "Payment"
        )
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should reject request exceeding balance", async function () {
      await expect(
        escrow.connect(spvManager).requestRelease(
          PROJECT_1.id,
          ethers.parseEther("200000"), // More than deposited
          beneficiary.address,
          "Payment"
        )
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should reject request with invalid beneficiary", async function () {
      await expect(
        escrow.connect(spvManager).requestRelease(
          PROJECT_1.id,
          ethers.parseEther("10000"),
          ethers.ZeroAddress,
          "Payment"
        )
      ).to.be.revertedWith("Invalid beneficiary");
    });

    it("Should reject request for inactive escrow", async function () {
      await expect(
        escrow.connect(spvManager).requestRelease(
          PROJECT_2.id,
          ethers.parseEther("10000"),
          beneficiary.address,
          "Payment"
        )
      ).to.be.revertedWith("Escrow not active");
    });
  });

  describe("Release Approval", function () {
    let requestId;

    beforeEach(async function () {
      await escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount);
      await escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: ethers.parseEther("100000") });

      requestId = await escrow.connect(spvManager).requestRelease.staticCall(
        PROJECT_1.id,
        ethers.parseEther("30000"),
        beneficiary.address,
        "Milestone 1 payment"
      );

      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("30000"),
        beneficiary.address,
        "Milestone 1 payment"
      );
    });

    it("Should allow bank partner to approve release", async function () {
      await expect(escrow.connect(bankPartner).approveRelease(requestId))
        .to.emit(escrow, "ReleaseApproved")
        .withArgs(requestId, bankPartner.address);

      const requestDetails = await escrow.getRequestDetails(requestId);
      expect(requestDetails.approved).to.be.true;
      expect(requestDetails.processed).to.be.true;
    });

    it("Should automatically release funds after approval", async function () {
      const beneficiaryBalanceBefore = await ethers.provider.getBalance(beneficiary.address);

      await escrow.connect(bankPartner).approveRelease(requestId);

      const beneficiaryBalanceAfter = await ethers.provider.getBalance(beneficiary.address);
      expect(beneficiaryBalanceAfter).to.equal(beneficiaryBalanceBefore + ethers.parseEther("30000"));
    });

    it("Should update escrow account after release", async function () {
      await escrow.connect(bankPartner).approveRelease(requestId);

      const account = await escrow.getEscrowAccount(PROJECT_1.id);
      expect(account.balance).to.equal(ethers.parseEther("70000")); // 100k - 30k
      expect(account.released).to.equal(ethers.parseEther("30000"));
    });

    it("Should emit FundsReleased event", async function () {
      await expect(escrow.connect(bankPartner).approveRelease(requestId))
        .to.emit(escrow, "FundsReleased")
        .withArgs(requestId, beneficiary.address, ethers.parseEther("30000"));
    });

    it("Should reject approval from non-bank partner", async function () {
      await expect(
        escrow.connect(investor1).approveRelease(requestId)
      ).to.be.revertedWith("Not a bank partner");
    });

    it("Should reject double approval", async function () {
      await escrow.connect(bankPartner).approveRelease(requestId);

      await expect(
        escrow.connect(bankPartner).approveRelease(requestId)
      ).to.be.revertedWith("Already processed");
    });
  });

  describe("Release Rejection", function () {
    let requestId;

    beforeEach(async function () {
      await escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount);
      await escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: ethers.parseEther("100000") });

      requestId = await escrow.connect(spvManager).requestRelease.staticCall(
        PROJECT_1.id,
        ethers.parseEther("30000"),
        beneficiary.address,
        "Milestone 1 payment"
      );

      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("30000"),
        beneficiary.address,
        "Milestone 1 payment"
      );
    });

    it("Should allow bank partner to reject release", async function () {
      const rejectionReason = "Documentation incomplete";

      await expect(escrow.connect(bankPartner).rejectRelease(requestId, rejectionReason))
        .to.emit(escrow, "ReleaseRejected")
        .withArgs(requestId, bankPartner.address, rejectionReason);

      const requestDetails = await escrow.getRequestDetails(requestId);
      expect(requestDetails.approved).to.be.false;
      expect(requestDetails.processed).to.be.true;
    });

    it("Should not transfer funds after rejection", async function () {
      const beneficiaryBalanceBefore = await ethers.provider.getBalance(beneficiary.address);

      await escrow.connect(bankPartner).rejectRelease(requestId, "Rejected");

      const beneficiaryBalanceAfter = await ethers.provider.getBalance(beneficiary.address);
      expect(beneficiaryBalanceAfter).to.equal(beneficiaryBalanceBefore);
    });

    it("Should keep escrow balance unchanged after rejection", async function () {
      await escrow.connect(bankPartner).rejectRelease(requestId, "Rejected");

      const account = await escrow.getEscrowAccount(PROJECT_1.id);
      expect(account.balance).to.equal(ethers.parseEther("100000"));
      expect(account.released).to.equal(0);
    });

    it("Should reject rejection from non-bank partner", async function () {
      await expect(
        escrow.connect(investor1).rejectRelease(requestId, "Rejected")
      ).to.be.revertedWith("Not a bank partner");
    });

    it("Should reject double rejection", async function () {
      await escrow.connect(bankPartner).rejectRelease(requestId, "Rejected");

      await expect(
        escrow.connect(bankPartner).rejectRelease(requestId, "Rejected again")
      ).to.be.revertedWith("Already processed");
    });
  });

  describe("Multiple Projects", function () {
    beforeEach(async function () {
      await escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount);
      await escrow.createEscrowAccount(PROJECT_2.id, PROJECT_2.targetAmount);

      await escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: ethers.parseEther("100000") });
      await escrow.connect(investor2).depositFunds(PROJECT_2.id, { value: ethers.parseEther("200000") });
    });

    it("Should keep project accounts separate", async function () {
      const account1 = await escrow.getEscrowAccount(PROJECT_1.id);
      const account2 = await escrow.getEscrowAccount(PROJECT_2.id);

      expect(account1.balance).to.equal(ethers.parseEther("100000"));
      expect(account2.balance).to.equal(ethers.parseEther("200000"));
    });

    it("Should track requests per project", async function () {
      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("10000"),
        beneficiary.address,
        "P1 Payment"
      );

      await escrow.connect(spvManager).requestRelease(
        PROJECT_2.id,
        ethers.parseEther("20000"),
        beneficiary.address,
        "P2 Payment"
      );

      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("15000"),
        beneficiary.address,
        "P1 Payment 2"
      );

      const project1Requests = await escrow.getProjectRequests(PROJECT_1.id);
      const project2Requests = await escrow.getProjectRequests(PROJECT_2.id);

      expect(project1Requests.length).to.equal(2);
      expect(project2Requests.length).to.equal(1);
    });
  });

  describe("Complex Scenarios", function () {
    beforeEach(async function () {
      await escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount);
      await escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: ethers.parseEther("100000") });
    });

    it("Should handle multiple sequential releases", async function () {
      // Request 1
      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("20000"),
        beneficiary.address,
        "Payment 1"
      );
      await escrow.connect(bankPartner).approveRelease(0);

      // Request 2
      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("30000"),
        beneficiary.address,
        "Payment 2"
      );
      await escrow.connect(bankPartner).approveRelease(1);

      const account = await escrow.getEscrowAccount(PROJECT_1.id);
      expect(account.balance).to.equal(ethers.parseEther("50000")); // 100k - 20k - 30k
      expect(account.released).to.equal(ethers.parseEther("50000"));
    });

    it("Should handle mix of approved and rejected releases", async function () {
      // Request 1 - Approved
      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("20000"),
        beneficiary.address,
        "Payment 1"
      );
      await escrow.connect(bankPartner).approveRelease(0);

      // Request 2 - Rejected
      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("30000"),
        beneficiary.address,
        "Payment 2"
      );
      await escrow.connect(bankPartner).rejectRelease(1, "Incomplete docs");

      // Request 3 - Approved
      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("15000"),
        beneficiary.address,
        "Payment 3"
      );
      await escrow.connect(bankPartner).approveRelease(2);

      const account = await escrow.getEscrowAccount(PROJECT_1.id);
      expect(account.balance).to.equal(ethers.parseEther("65000")); // 100k - 20k - 15k
      expect(account.released).to.equal(ethers.parseEther("35000")); // 20k + 15k
    });
  });

  describe("Receive Fallback", function () {
    it("Should accept ETH via receive", async function () {
      await expect(
        investor1.sendTransaction({
          to: await escrow.getAddress(),
          value: ethers.parseEther("1")
        })
      ).to.not.be.reverted;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await escrow.createEscrowAccount(PROJECT_1.id, PROJECT_1.targetAmount);
      await escrow.connect(investor1).depositFunds(PROJECT_1.id, { value: ethers.parseEther("100000") });

      await escrow.connect(spvManager).requestRelease(
        PROJECT_1.id,
        ethers.parseEther("30000"),
        beneficiary.address,
        "Payment"
      );
    });

    it("Should return correct escrow account details", async function () {
      const account = await escrow.getEscrowAccount(PROJECT_1.id);

      expect(account.balance).to.equal(ethers.parseEther("100000"));
      expect(account.released).to.equal(0);
      expect(account.targetAmount).to.equal(PROJECT_1.targetAmount);
      expect(account.isActive).to.be.true;
    });

    it("Should return correct request details", async function () {
      const details = await escrow.getRequestDetails(0);

      expect(details.projectId).to.equal(PROJECT_1.id);
      expect(details.amount).to.equal(ethers.parseEther("30000"));
      expect(details.beneficiary).to.equal(beneficiary.address);
      expect(details.reason).to.equal("Payment");
      expect(details.approved).to.be.false;
      expect(details.processed).to.be.false;
    });

    it("Should return correct project requests", async function () {
      const requests = await escrow.getProjectRequests(PROJECT_1.id);
      expect(requests.length).to.equal(1);
      expect(requests[0]).to.equal(0);
    });
  });
});
