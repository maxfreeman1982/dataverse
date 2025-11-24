// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title OJToken
 * @dev Token ERC20 représentant les parts d'investissement dans les projets OJ
 * Chaque projet a son propre token avec un symbole unique
 */
contract OJToken is ERC20, Ownable, Pausable {
    // Métadonnées du projet
    string public projectId;
    string public projectName;
    uint256 public expectedReturn; // En pourcentage (ex: 850 = 8.5%)
    uint256 public projectDuration; // En mois
    uint256 public minimumInvestment;

    // Statistiques
    uint256 public totalInvestors;
    uint256 public fundingGoal;
    uint256 public fundingDeadline;

    // Statut du projet
    enum ProjectStatus { FUNDRAISING, FUNDED, ACTIVE, COMPLETED, CANCELLED }
    ProjectStatus public status;

    // Mapping des investisseurs
    mapping(address => uint256) public investmentAmount;
    mapping(address => uint256) public investmentDate;
    address[] public investors;

    // Events
    event Investment(address indexed investor, uint256 amount, uint256 tokens);
    event ReturnDistributed(address indexed investor, uint256 amount);
    event StatusChanged(ProjectStatus oldStatus, ProjectStatus newStatus);
    event FundingGoalReached(uint256 totalRaised);

    constructor(
        string memory _projectId,
        string memory _projectName,
        string memory _symbol,
        uint256 _fundingGoal,
        uint256 _expectedReturn,
        uint256 _projectDuration,
        uint256 _minimumInvestment,
        uint256 _fundingDeadline
    ) ERC20(_projectName, _symbol) Ownable(msg.sender) {
        projectId = _projectId;
        projectName = _projectName;
        fundingGoal = _fundingGoal;
        expectedReturn = _expectedReturn;
        projectDuration = _projectDuration;
        minimumInvestment = _minimumInvestment;
        fundingDeadline = _fundingDeadline;
        status = ProjectStatus.FUNDRAISING;
    }

    /**
     * @dev Permet à un investisseur d'acheter des tokens
     * 1 token = 1 EUR d'investissement
     */
    function invest() external payable whenNotPaused {
        require(status == ProjectStatus.FUNDRAISING, "Project not in fundraising");
        require(block.timestamp < fundingDeadline, "Funding deadline passed");
        require(msg.value >= minimumInvestment, "Below minimum investment");

        uint256 tokens = msg.value; // 1 wei = 1 token (simplified)

        // Si c'est un nouvel investisseur
        if (investmentAmount[msg.sender] == 0) {
            investors.push(msg.sender);
            totalInvestors++;
        }

        investmentAmount[msg.sender] += msg.value;
        investmentDate[msg.sender] = block.timestamp;

        _mint(msg.sender, tokens);

        emit Investment(msg.sender, msg.value, tokens);

        // Vérifier si l'objectif est atteint
        if (totalSupply() >= fundingGoal) {
            _updateStatus(ProjectStatus.FUNDED);
            emit FundingGoalReached(totalSupply());
        }
    }

    /**
     * @dev Distribue les rendements aux investisseurs proportionnellement
     */
    function distributeReturns() external payable onlyOwner {
        require(status == ProjectStatus.ACTIVE || status == ProjectStatus.COMPLETED, "Invalid status");
        require(msg.value > 0, "No returns to distribute");

        uint256 totalTokens = totalSupply();

        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 investorTokens = balanceOf(investor);

            if (investorTokens > 0) {
                uint256 investorShare = (msg.value * investorTokens) / totalTokens;
                payable(investor).transfer(investorShare);
                emit ReturnDistributed(investor, investorShare);
            }
        }
    }

    /**
     * @dev Met à jour le statut du projet
     */
    function updateStatus(ProjectStatus newStatus) external onlyOwner {
        _updateStatus(newStatus);
    }

    function _updateStatus(ProjectStatus newStatus) internal {
        ProjectStatus oldStatus = status;
        status = newStatus;
        emit StatusChanged(oldStatus, newStatus);
    }

    /**
     * @dev Pause les investissements
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Reprend les investissements
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Retourne la liste de tous les investisseurs
     */
    function getInvestors() external view returns (address[] memory) {
        return investors;
    }

    /**
     * @dev Retourne les détails d'un investisseur
     */
    function getInvestorDetails(address investor) external view returns (
        uint256 tokens,
        uint256 amount,
        uint256 date,
        uint256 percentage
    ) {
        tokens = balanceOf(investor);
        amount = investmentAmount[investor];
        date = investmentDate[investor];
        percentage = totalSupply() > 0 ? (tokens * 10000) / totalSupply() : 0; // En basis points
    }

    /**
     * @dev Retourne les statistiques du projet
     */
    function getProjectStats() external view returns (
        uint256 currentFunding,
        uint256 progress,
        uint256 investorCount,
        ProjectStatus currentStatus
    ) {
        currentFunding = totalSupply();
        progress = fundingGoal > 0 ? (currentFunding * 100) / fundingGoal : 0;
        investorCount = totalInvestors;
        currentStatus = status;
    }
}
