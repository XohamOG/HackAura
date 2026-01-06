// Contract ABIs for BountyEscrow and RepoRegistry on Lisk Sepolia

const bountyEscrowABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "org", "type": "address"}
    ],
    "name": "BountyFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "BountyReclaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "solver", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "BountyReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "donor", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "DonationReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "newPeriod", "type": "uint256"}
    ],
    "name": "ReclaimPeriodUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"}
    ],
    "name": "donateToProject",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "address", "name": "org", "type": "address"}
    ],
    "name": "fundBountyFromPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "issueId", "type": "uint256"}
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
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"}
    ],
    "name": "getProjectPool",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "hasSufficientFunds",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "issueId", "type": "uint256"}
    ],
    "name": "reclaimBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "reclaimPeriod",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"internalType": "address", "name": "solver", "type": "address"}
    ],
    "name": "releaseBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "periodInSeconds", "type": "uint256"}
    ],
    "name": "setReclaimPeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

const repoRegistryABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_bountyEscrow", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "BountyAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "org", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "OrgStaked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "RepoRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"},
      {"internalType": "uint256", "name": "issueId", "type": "uint256"},
      {"internalType": "uint256", "name": "bountyAmount", "type": "uint256"}
    ],
    "name": "assignBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bountyEscrow",
    "outputs": [
      {"internalType": "contract IBountyEscrow", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "repoId", "type": "uint256"}
    ],
    "name": "getRepo",
    "outputs": [
      {"internalType": "string", "name": "cid", "type": "string"},
      {"internalType": "address", "name": "owner_", "type": "address"},
      {"internalType": "bool", "name": "isPublic", "type": "bool"},
      {"internalType": "uint256[]", "name": "issueIds", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minStake",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "orgStakes",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "cid", "type": "string"},
      {"internalType": "bool", "name": "isPublic", "type": "bool"},
      {"internalType": "uint256[]", "name": "issueIds", "type": "uint256[]"}
    ],
    "name": "registerRepo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "repoCount",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
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
    "stateMutability": "payable",
    "type": "receive"
  }
];

module.exports = {
  bountyEscrowABI,
  repoRegistryABI
};
