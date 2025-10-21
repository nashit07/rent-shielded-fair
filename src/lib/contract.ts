// Contract ABI for RentShieldedFair
export const RentShieldedFairABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserApplications",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "applicationId", "type": "uint256"}],
    "name": "getDetailedApplicationInfo",
    "outputs": [
      {"internalType": "bool", "name": "isApproved", "type": "bool"},
      {"internalType": "bool", "name": "isRejected", "type": "bool"},
      {"internalType": "string", "name": "applicationHash", "type": "string"},
      {"internalType": "string", "name": "moveInDate", "type": "string"},
      {"internalType": "string", "name": "specialRequests", "type": "string"},
      {"internalType": "address", "name": "applicant", "type": "address"},
      {"internalType": "address", "name": "propertyOwner", "type": "address"},
      {"internalType": "uint256", "name": "submittedAt", "type": "uint256"},
      {"internalType": "uint256", "name": "reviewedAt", "type": "uint256"},
      {"internalType": "uint256", "name": "priorityScore", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
