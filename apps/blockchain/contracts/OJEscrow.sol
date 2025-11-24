// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OJEscrow
 * @dev Contrat de séquestre pour gérer les fonds des projets
 * Les fonds sont bloqués jusqu'à validation par la banque partenaire
 */
contract OJEscrow is Ownable, ReentrancyGuard {
    struct EscrowAccount {
        string projectId;
        uint256 balance;
        uint256 released;
        uint256 targetAmount;
        bool isActive;
    }

    struct ReleaseRequest {
        string projectId;
        uint256 amount;
        address beneficiary;
        string reason;
        bool approved;
        bool processed;
        uint256 requestedAt;
        uint256 processedAt;
    }

    // Mapping des comptes séquestre par projet
    mapping(string => EscrowAccount) public escrowAccounts;

    // Requests de libération
    mapping(uint256 => ReleaseRequest) public releaseRequests;
    uint256 public requestCount;

    // Mapping des requests par projet
    mapping(string => uint256[]) public projectRequests;

    // Rôles
    mapping(address => bool) public isBankPartner;
    mapping(address => bool) public isSpvManager;

    // Events
    event EscrowCreated(string indexed projectId, uint256 targetAmount);
    event FundsDeposited(string indexed projectId, uint256 amount);
    event ReleaseRequested(uint256 indexed requestId, string projectId, uint256 amount);
    event ReleaseApproved(uint256 indexed requestId, address approvedBy);
    event ReleaseRejected(uint256 indexed requestId, address rejectedBy, string reason);
    event FundsReleased(uint256 indexed requestId, address beneficiary, uint256 amount);

    constructor() Ownable(msg.sender) {}

    modifier onlyBankPartner() {
        require(isBankPartner[msg.sender], "Not a bank partner");
        _;
    }

    modifier onlySpvManager() {
        require(isSpvManager[msg.sender], "Not an SPV manager");
        _;
    }

    /**
     * @dev Crée un compte séquestre pour un projet
     */
    function createEscrowAccount(
        string memory projectId,
        uint256 targetAmount
    ) external onlyOwner {
        require(!escrowAccounts[projectId].isActive, "Escrow already exists");

        escrowAccounts[projectId] = EscrowAccount({
            projectId: projectId,
            balance: 0,
            released: 0,
            targetAmount: targetAmount,
            isActive: true
        });

        emit EscrowCreated(projectId, targetAmount);
    }

    /**
     * @dev Dépose des fonds dans le séquestre
     */
    function depositFunds(string memory projectId) external payable {
        require(escrowAccounts[projectId].isActive, "Escrow not active");
        require(msg.value > 0, "Amount must be > 0");

        escrowAccounts[projectId].balance += msg.value;

        emit FundsDeposited(projectId, msg.value);
    }

    /**
     * @dev Demande de libération de fonds (par SPV manager)
     */
    function requestRelease(
        string memory projectId,
        uint256 amount,
        address beneficiary,
        string memory reason
    ) external onlySpvManager returns (uint256) {
        require(escrowAccounts[projectId].isActive, "Escrow not active");
        require(amount > 0, "Amount must be > 0");
        require(escrowAccounts[projectId].balance >= amount, "Insufficient balance");
        require(beneficiary != address(0), "Invalid beneficiary");

        uint256 requestId = requestCount++;

        releaseRequests[requestId] = ReleaseRequest({
            projectId: projectId,
            amount: amount,
            beneficiary: beneficiary,
            reason: reason,
            approved: false,
            processed: false,
            requestedAt: block.timestamp,
            processedAt: 0
        });

        projectRequests[projectId].push(requestId);

        emit ReleaseRequested(requestId, projectId, amount);

        return requestId;
    }

    /**
     * @dev Approuve une demande de libération (par la banque)
     */
    function approveRelease(uint256 requestId) external onlyBankPartner nonReentrant {
        ReleaseRequest storage request = releaseRequests[requestId];
        require(!request.processed, "Already processed");
        require(!request.approved, "Already approved");

        request.approved = true;
        request.processedAt = block.timestamp;

        emit ReleaseApproved(requestId, msg.sender);

        // Libérer les fonds automatiquement
        _releaseF

unds(requestId);
    }

    /**
     * @dev Rejette une demande de libération (par la banque)
     */
    function rejectRelease(uint256 requestId, string memory rejectionReason) external onlyBankPartner {
        ReleaseRequest storage request = releaseRequests[requestId];
        require(!request.processed, "Already processed");

        request.processed = true;
        request.processedAt = block.timestamp;

        emit ReleaseRejected(requestId, msg.sender, rejectionReason);
    }

    /**
     * @dev Libère les fonds approuvés
     */
    function _releaseFunds(uint256 requestId) internal {
        ReleaseRequest storage request = releaseRequests[requestId];
        require(request.approved, "Not approved");
        require(!request.processed, "Already processed");

        EscrowAccount storage account = escrowAccounts[request.projectId];
        require(account.balance >= request.amount, "Insufficient balance");

        account.balance -= request.amount;
        account.released += request.amount;
        request.processed = true;

        payable(request.beneficiary).transfer(request.amount);

        emit FundsReleased(requestId, request.beneficiary, request.amount);
    }

    /**
     * @dev Ajoute un partenaire bancaire
     */
    function addBankPartner(address bank) external onlyOwner {
        isBankPartner[bank] = true;
    }

    /**
     * @dev Retire un partenaire bancaire
     */
    function removeBankPartner(address bank) external onlyOwner {
        isBankPartner[bank] = false;
    }

    /**
     * @dev Ajoute un SPV manager
     */
    function addSpvManager(address manager) external onlyOwner {
        isSpvManager[manager] = true;
    }

    /**
     * @dev Retire un SPV manager
     */
    function removeSpvManager(address manager) external onlyOwner {
        isSpvManager[manager] = false;
    }

    /**
     * @dev Retourne les détails d'un compte séquestre
     */
    function getEscrowAccount(string memory projectId) external view returns (
        uint256 balance,
        uint256 released,
        uint256 targetAmount,
        bool isActive
    ) {
        EscrowAccount memory account = escrowAccounts[projectId];
        return (account.balance, account.released, account.targetAmount, account.isActive);
    }

    /**
     * @dev Retourne la liste des requests pour un projet
     */
    function getProjectRequests(string memory projectId) external view returns (uint256[] memory) {
        return projectRequests[projectId];
    }

    /**
     * @dev Retourne les détails d'une request
     */
    function getRequestDetails(uint256 requestId) external view returns (
        string memory projectId,
        uint256 amount,
        address beneficiary,
        string memory reason,
        bool approved,
        bool processed,
        uint256 requestedAt,
        uint256 processedAt
    ) {
        ReleaseRequest memory request = releaseRequests[requestId];
        return (
            request.projectId,
            request.amount,
            request.beneficiary,
            request.reason,
            request.approved,
            request.processed,
            request.requestedAt,
            request.processedAt
        );
    }

    // Fallback pour recevoir des ETH
    receive() external payable {}
}
