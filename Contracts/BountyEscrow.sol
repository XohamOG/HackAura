// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BountyEscrow is Ownable, ReentrancyGuard {
    struct Bounty {
        uint256 amount;
        bool paid;
        address org;
    }

    mapping(uint256 => mapping(uint256 => Bounty)) public bounties;
    mapping(uint256 => uint256) public projectPools;
    mapping(uint256 => mapping(uint256 => uint256)) public bountyFundedTime;

    uint256 public reclaimPeriod = 30 days;

    // EVENTS
    event ProjectDonated(uint256 repoId, uint256 amount, address donor);
    event BountyFunded(uint256 repoId, uint256 issueId, uint256 amount, address org);
    event BountyReleased(uint256 repoId, uint256 issueId, address solver, uint256 amount);

    constructor(address _initialOwner) Ownable(_initialOwner) {}

    // Donate MATIC to project pool
    function donateToProject(uint256 _repoId) external payable {
        require(msg.value > 0, "Must send MATIC");
        projectPools[_repoId] += msg.value;
        emit ProjectDonated(_repoId, msg.value, msg.sender);
    }

    // Fund bounty from pool (onlyOwner)
    function fundBountyFromPool(uint256 _repoId, uint256 _issueId, uint256 _amount, address _org)
        external
        onlyOwner
        nonReentrant
    {
        require(_org != address(0), "Invalid org address");
        require(projectPools[_repoId] >= _amount, "Insufficient pool");

        Bounty storage b = bounties[_repoId][_issueId];
        require(!b.paid, "Bounty already paid");
        require(b.amount == 0, "Bounty already funded");

        b.amount = _amount;
        b.org = _org;
        bountyFundedTime[_repoId][_issueId] = block.timestamp;
        projectPools[_repoId] -= _amount;

        emit BountyFunded(_repoId, _issueId, _amount, _org);
    }

    // Release bounty to solver
    function releaseBounty(uint256 _repoId, uint256 _issueId, address _solver)
        external
        nonReentrant
    {
        require(_solver != address(0), "Invalid solver");

        Bounty storage b = bounties[_repoId][_issueId];
        require(!b.paid, "Already released");
        require(b.amount > 0, "No bounty");

        uint256 amountToPay = b.amount;
        b.paid = true;
        b.amount = 0;

        (bool sent, ) = payable(_solver).call{value: amountToPay}("");
        require(sent, "Failed to send MATIC");

        emit BountyReleased(_repoId, _issueId, _solver, amountToPay);
    }

    // Reclaim bounty if unclaimed
    function reclaimBounty(uint256 _repoId, uint256 _issueId) external nonReentrant {
        Bounty storage b = bounties[_repoId][_issueId];
        require(b.org == msg.sender, "Only funding org");
        require(!b.paid, "Already paid");
        require(block.timestamp >= bountyFundedTime[_repoId][_issueId] + reclaimPeriod, "Too early");
        require(b.amount > 0, "No funds");

        uint256 amountToReturn = b.amount;
        b.amount = 0;

        (bool sent, ) = payable(msg.sender).call{value: amountToReturn}("");
        require(sent, "Failed to send MATIC");
    }

    // View bounty
    function getBounty(uint256 _repoId, uint256 _issueId)
        external
        view
        returns (uint256 amount, bool paid, address org)
    {
        Bounty storage b = bounties[_repoId][_issueId];
        return (b.amount, b.paid, b.org);
    }

    function getProjectPool(uint256 _repoId) external view returns (uint256) {
        return projectPools[_repoId];
    }

    function hasSufficientFunds(uint256 _repoId, uint256 _amount) external view returns (bool) {
        return projectPools[_repoId] >= _amount;
    }

    function setReclaimPeriod(uint256 _period) external onlyOwner {
        reclaimPeriod = _period;
    }

    receive() external payable {
        revert("Use donateToProject");
    }

    fallback() external payable {
        revert("Use donateToProject");
    }
}
