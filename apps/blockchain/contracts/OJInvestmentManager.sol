// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./OJToken.sol";

/**
 * @title OJInvestmentManager
 * @dev Contrat principal pour gérer tous les investissements OJ
 * Crée et gère les tokens de projet, les investissements et les distributions
 */
contract OJInvestmentManager is Ownable, ReentrancyGuard {
    // Mapping des projets
    mapping(string => address) public projectTokens;
    string[] public projectIds;

    // Mapping des investisseurs vers leurs projets
    mapping(address => string[]) public investorProjects;

    // Statistiques globales
    uint256 public totalProjects;
    uint256 public totalInvestors;
    uint256 public totalFundsRaised;

    // Rôles
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isBankPartner;

    // Events
    event ProjectCreated(string indexed projectId, address tokenAddress, string name);
    event InvestmentMade(string indexed projectId, address indexed investor, uint256 amount);
    event ReturnsDistributed(string indexed projectId, uint256 totalAmount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event BankPartnerAdded(address indexed bank);

    constructor() Ownable(msg.sender) {
        isAdmin[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not an admin");
        _;
    }

    modifier onlyBankPartner() {
        require(isBankPartner[msg.sender], "Not a bank partner");
        _;
    }

    /**
     * @dev Crée un nouveau projet d'investissement
     */
    function createProject(
        string memory projectId,
        string memory projectName,
        string memory symbol,
        uint256 fundingGoal,
        uint256 expectedReturn,
        uint256 projectDuration,
        uint256 minimumInvestment,
        uint256 fundingDeadline
    ) external onlyAdmin returns (address) {
        require(projectTokens[projectId] == address(0), "Project already exists");

        OJToken token = new OJToken(
            projectId,
            projectName,
            symbol,
            fundingGoal,
            expectedReturn,
            projectDuration,
            minimumInvestment,
            fundingDeadline
        );

        address tokenAddress = address(token);
        projectTokens[projectId] = tokenAddress;
        projectIds.push(projectId);
        totalProjects++;

        emit ProjectCreated(projectId, tokenAddress, projectName);

        return tokenAddress;
    }

    /**
     * @dev Permet à un investisseur d'investir dans un projet
     */
    function investInProject(string memory projectId) external payable nonReentrant {
        address tokenAddress = projectTokens[projectId];
        require(tokenAddress != address(0), "Project does not exist");

        OJToken token = OJToken(tokenAddress);

        // Enregistrer l'investisseur dans ce projet s'il est nouveau
        bool isNewInvestor = true;
        string[] memory projects = investorProjects[msg.sender];
        for (uint i = 0; i < projects.length; i++) {
            if (keccak256(bytes(projects[i])) == keccak256(bytes(projectId))) {
                isNewInvestor = false;
                break;
            }
        }

        if (isNewInvestor) {
            investorProjects[msg.sender].push(projectId);
        }

        // Transférer les fonds au contrat token et investir
        (bool success, ) = tokenAddress.call{value: msg.value}(
            abi.encodeWithSignature("invest()")
        );
        require(success, "Investment failed");

        totalFundsRaised += msg.value;

        emit InvestmentMade(projectId, msg.sender, msg.value);
    }

    /**
     * @dev Distribue les rendements pour un projet
     */
    function distributeReturns(string memory projectId) external payable onlyAdmin {
        address tokenAddress = projectTokens[projectId];
        require(tokenAddress != address(0), "Project does not exist");

        OJToken token = OJToken(tokenAddress);

        (bool success, ) = tokenAddress.call{value: msg.value}(
            abi.encodeWithSignature("distributeReturns()")
        );
        require(success, "Distribution failed");

        emit ReturnsDistributed(projectId, msg.value);
    }

    /**
     * @dev Met à jour le statut d'un projet
     */
    function updateProjectStatus(
        string memory projectId,
        OJToken.ProjectStatus newStatus
    ) external onlyAdmin {
        address tokenAddress = projectTokens[projectId];
        require(tokenAddress != address(0), "Project does not exist");

        OJToken token = OJToken(tokenAddress);
        token.updateStatus(newStatus);
    }

    /**
     * @dev Ajoute un admin
     */
    function addAdmin(address admin) external onlyOwner {
        isAdmin[admin] = true;
        emit AdminAdded(admin);
    }

    /**
     * @dev Retire un admin
     */
    function removeAdmin(address admin) external onlyOwner {
        isAdmin[admin] = false;
        emit AdminRemoved(admin);
    }

    /**
     * @dev Ajoute une banque partenaire
     */
    function addBankPartner(address bank) external onlyOwner {
        isBankPartner[bank] = true;
        emit BankPartnerAdded(bank);
    }

    /**
     * @dev Retourne la liste des projets d'un investisseur
     */
    function getInvestorProjects(address investor) external view returns (string[] memory) {
        return investorProjects[investor];
    }

    /**
     * @dev Retourne la liste de tous les projets
     */
    function getAllProjects() external view returns (string[] memory) {
        return projectIds;
    }

    /**
     * @dev Retourne l'adresse du token d'un projet
     */
    function getProjectToken(string memory projectId) external view returns (address) {
        return projectTokens[projectId];
    }

    /**
     * @dev Retourne les statistiques globales
     */
    function getGlobalStats() external view returns (
        uint256 projects,
        uint256 fundsRaised
    ) {
        projects = totalProjects;
        fundsRaised = totalFundsRaised;
    }

    /**
     * @dev Permet de retirer les fonds en cas d'urgence (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Fallback pour recevoir des ETH
    receive() external payable {}
}
