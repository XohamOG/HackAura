// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BountyEscrow.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RepoRegistry is Ownable, ReentrancyGuard {
    BountyEscrow public immutable bountyEscrow;
    uint256 private _nonce;

    struct Repo {
        string cid;
        address owner;
        bool isPublic;
        uint256[] issueIds;
        bool verified;
    }

    mapping(uint256 => Repo) private repos;
    mapping(uint256 => bool) private repoExists;
    mapping(bytes32 => bool) private verifiedCIDs;

    event RepoRegistered(uint256 indexed repoId, address indexed owner, string cid, bool isPublic);
    event RepoVerified(uint256 indexed repoId, bytes32 indexed cidHash, address verifier);
    event RepoUnverified(uint256 indexed repoId, bytes32 indexed cidHash, address verifier);
    event BountyAssigned(uint256 indexed repoId, uint256 indexed issueId, uint256 bounty);

    constructor(address payable _bountyEscrow, address _initialOwner) Ownable(_initialOwner) {
        require(_bountyEscrow != address(0), "Invalid escrow");
        require(_initialOwner != address(0), "Invalid owner");
        bountyEscrow = BountyEscrow(_bountyEscrow);
    }

    function registerRepo(
        string memory _cid,
        bool _isPublic,
        uint256[] memory _issueIds
    ) external nonReentrant returns (uint256 repoId) {
        require(_isValidCID(_cid), "Invalid CID");
        require(_issueIds.length <= 50, "Too many issues");
        _checkDuplicateIssues(_issueIds);

        _nonce++;
        repoId = uint256(keccak256(abi.encode(msg.sender, block.prevrandao, _nonce)));
        repoExists[repoId] = true;

        bytes32 cidHash = keccak256(abi.encode(_cid));
        repos[repoId] = Repo({
            cid: _cid,
            owner: msg.sender,
            isPublic: _isPublic,
            issueIds: _issueIds,
            verified: verifiedCIDs[cidHash]
        });

        emit RepoRegistered(repoId, msg.sender, _cid, _isPublic);
    }

    function assignBounty(
        uint256 _repoId,
        uint256 _issueId,
        uint256 _amount
    ) external nonReentrant {
        require(repoExists[_repoId], "Repo does not exist");
        Repo storage repo = repos[_repoId];
        require(msg.sender == repo.owner, "Not repo owner");
        require(_amount > 0, "Bounty must be > 0");

        bountyEscrow.fundBountyFromPool(_repoId, _issueId, _amount, msg.sender);
        emit BountyAssigned(_repoId, _issueId, _amount);
    }

    function verifyCID(uint256 _repoId) external onlyOwner {
        require(repoExists[_repoId], "Repo does not exist");
        Repo storage repo = repos[_repoId];
        bytes32 hash = keccak256(abi.encode(repo.cid));
        verifiedCIDs[hash] = true;
        repo.verified = true;
        emit RepoVerified(_repoId, hash, msg.sender);
    }

    function unverifyCID(uint256 _repoId) external onlyOwner {
        require(repoExists[_repoId], "Repo does not exist");
        Repo storage repo = repos[_repoId];
        bytes32 hash = keccak256(abi.encode(repo.cid));
        verifiedCIDs[hash] = false;
        repo.verified = false;
        emit RepoUnverified(_repoId, hash, msg.sender);
    }

    function getRepo(uint256 _repoId)
        external
        view
        returns (
            string memory cid,
            address owner,
            bool isPublic,
            uint256[] memory issueIds,
            bool verified
        )
    {
        require(repoExists[_repoId], "Repo does not exist");
        Repo storage r = repos[_repoId];
        return (r.cid, r.owner, r.isPublic, r.issueIds, r.verified);
    }

    // Internal helpers
    function _isValidCID(string memory _cid) internal pure returns (bool) {
        bytes memory b = bytes(_cid);
        if (b.length < 46 || b.length > 59) return false;
        if (b[0] == 'Q' && b[1] == 'm') return true; // CIDv0
        if (b[0] == 'b') return true; // CIDv1 base32
        return false;
    }

    function _checkDuplicateIssues(uint256[] memory _issueIds) internal pure {
        for (uint256 i = 0; i < _issueIds.length; i++) {
            for (uint256 j = i + 1; j < _issueIds.length; j++) {
                require(_issueIds[i] != _issueIds[j], "Duplicate issueId");
            }
        }
    }
}
