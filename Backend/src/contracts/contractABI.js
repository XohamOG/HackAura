// Contract ABIs for BountyEscrow and RepoRegistry

const bountyEscrowABI = [
  {
    "inputs": [{"internalType": "address", "name": "_initialOwner", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "org", "type": "address"}
    ],
    "name": "BountyFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "solver", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "BountyReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "donor", "type": "address"}
    ],
    "name": "ProjectDonated",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_repoId", "type": "uint256"}],
    "name": "donateToProject",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "_issueId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"},
      {"internalType": "address", "name": "_org", "type": "address"}
    ],
    "name": "fundBountyFromPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "_issueId", "type": "uint256"}
    ],
    "name": "getBounty",
    "outputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "bool", "name": "paid", "type": "bool"},
      {"internalType": "address", "name": "org", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_repoId", "type": "uint256"}],
    "name": "getProjectPool",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "hasSufficientFunds",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "_issueId", "type": "uint256"}
    ],
    "name": "reclaimBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "_issueId", "type": "uint256"},
      {"internalType": "address", "name": "_solver", "type": "address"}
    ],
    "name": "releaseBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_period", "type": "uint256"}],
    "name": "setReclaimPeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const repoRegistryABI = [
  {
    "inputs": [{"internalType": "address", "name": "_bountyEscrow", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bounty", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "creator", "type": "address"}
    ],
    "name": "BountyCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "cid", "type": "string"},
      {"indexed": false, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "isPublic", "type": "bool"}
    ],
    "name": "RepoRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "_issueId", "type": "uint256"},
      {"internalType": "uint256", "name": "_bounty", "type": "uint256"}
    ],
    "name": "assignBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_issueId", "type": "uint256"}],
    "name": "getIssueBounty",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_repoId", "type": "uint256"}],
    "name": "getRepo",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "address", "name": "", "type": "address"},
      {"internalType": "bool", "name": "", "type": "bool"},
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_cid", "type": "string"},
      {"internalType": "bool", "name": "_isPublic", "type": "bool"},
      {"internalType": "uint256[]", "name": "_issueIds", "type": "uint256[]"}
    ],
    "name": "registerRepo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakeForOrg",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minStake",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "repoCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

module.exports = {
  bountyEscrowABI,
  repoRegistryABI
};