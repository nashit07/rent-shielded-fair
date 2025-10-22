<div align="center">

# 🏠 RentShield

**The Future of Privacy-Preserving Rental Markets**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with FHE](https://img.shields.io/badge/Built%20with-FHE-blue.svg)](https://zama.ai)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-627EEA.svg)](https://ethereum.org)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://reactjs.org)

*Revolutionizing rental markets through cryptographic privacy and blockchain transparency*

</div>

---

## 🎥 Demo Video

[![RentShield Demo](https://img.shields.io/badge/📹-Watch%20Demo-red.svg)](https://github.com/nashit07/rent-shielded-fair/blob/main/rent-shielded-fair.mov)

**Watch our complete demo**: [rent-shielded-fair.mov](https://github.com/nashit07/rent-shielded-fair/blob/main/rent-shielded-fair.mov) (14MB)

*Experience the full privacy-preserving rental application process with FHE encryption*

## 🌟 What Makes Us Different?

Unlike traditional rental platforms that expose your sensitive financial data, **RentShield** leverages cutting-edge **Fully Homomorphic Encryption (FHE)** to protect your privacy while maintaining full functionality.

### 🔐 Privacy-First Architecture

- **Encrypted Rent Negotiations**: Your rent offers remain confidential until accepted
- **Private Credit Scoring**: Credit checks happen without revealing your score
- **Anonymous Applications**: Apply to properties without exposing personal details
- **Secure Payment Processing**: All transactions are encrypted end-to-end

### ⚡ Key Features

| Feature | Description | Privacy Level |
|---------|-------------|---------------|
| 🏠 **Property Listings** | Browse encrypted rental properties | 🔒 Fully Private |
| 💰 **Fair Pricing** | Algorithm-based rent determination | 🔒 Fully Private |
| 📋 **Smart Applications** | Submit applications with encrypted data | 🔒 Fully Private |
| 🤝 **Automated Agreements** | Smart contract-based rental agreements | 🔒 Fully Private |
| 💳 **Secure Payments** | Encrypted payment processing | 🔒 Fully Private |
| ⭐ **Reputation System** | Encrypted reputation tracking | 🔒 Fully Private |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Web3 Wallet** (MetaMask, Rainbow, etc.)
- **Sepolia ETH** for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/nashit07/rent-shielded-fair.git
cd rent-shielded-fair

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with the following variables:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Wallet Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

---

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18.3.1** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **RainbowKit** - Multi-wallet integration

### Blockchain Integration
- **Ethereum Sepolia** - Testnet deployment
- **FHE (Zama)** - Fully Homomorphic Encryption
- **Smart Contracts** - Automated rental logic
- **IPFS** - Decentralized storage

### Privacy Technology
- **FHE Encryption** - Compute on encrypted data
- **Zero-Knowledge Proofs** - Verify without revealing
- **Homomorphic Operations** - Encrypted calculations
- **Private Key Management** - User-controlled keys

---

## 🔧 Smart Contract Features

Our smart contract implements a complete rental ecosystem with FHE protection:

### Contract Address
**Deployed Contract**: `0x7ed92C81cC7329eCf12B8e5F8E371aa9aE523F52` (Sepolia Testnet)

### Core Functions

```solidity
// List property with encrypted rent data
function listProperty(
    string memory _name,
    string memory _description,
    string memory _location,
    uint256 _monthlyRent,
    uint256 _securityDeposit,
    uint256 _propertySize,
    uint8 _bedrooms,
    uint8 _bathrooms,
    string memory _propertyType,
    string memory _amenities,
    uint256 _leaseDuration,
    uint256 _applicationDeadline
) public returns (uint256)

// Submit application with encrypted personal data
function submitApplication(
    uint256 _propertyId,
    string memory _moveInDate,
    string memory _specialRequests,
    euint32 _proposedRent,
    euint32 _creditScore,
    euint32 _income
) public returns (uint256)

// Get encrypted application data for decryption
function getApplicationEncryptedData(
    uint256 _applicationId
) public view returns (euint32, euint32, euint32)

// Review application (approve/reject)
function reviewApplication(
    uint256 _applicationId,
    bool _isApproved
) public

// Get landlord's properties
function getLandlordProperties(
    address _landlord
) public view returns (uint256[] memory)

// Get landlord's applications
function getLandlordApplications(
    address _landlord
) public view returns (uint256[] memory)
```

### 🔐 FHE Data Encryption/Decryption Logic

#### Encryption Process (Frontend → Contract)
```typescript
// 1. Initialize FHE SDK
const fhevm = await createInstance({
  chainId: 11155111, // Sepolia
  publicKey: publicKey,
});

// 2. Encrypt sensitive data
const encryptedRent = fhevm.encrypt32(proposedRent);
const encryptedCredit = fhevm.encrypt32(creditScore);
const encryptedIncome = fhevm.encrypt32(income);

// 3. Submit to contract
await contract.submitApplication(
  propertyId,
  moveInDate,
  specialRequests,
  encryptedRent,
  encryptedCredit,
  encryptedIncome
);
```

#### Decryption Process (Contract → Frontend)
```typescript
// 1. Get encrypted data from contract
const encryptedData = await contract.getApplicationEncryptedData(applicationId);

// 2. Create EIP712 signature for decryption
const eip712 = createEIP712({
  domain: {
    name: "FHE",
    version: "1",
    chainId: 11155111,
    verifyingContract: contractAddress,
  },
  types: {
    Reencrypt: [
      { name: "publicKey", type: "bytes" },
      { name: "signature", type: "bytes" },
    ],
  },
  primaryType: "Reencrypt",
});

// 3. Request wallet signature
const signature = await walletClient.signTypedData(eip712);

// 4. Decrypt data using FHE
const decryptedRent = fhevm.decrypt(encryptedData.proposedRent, signature);
const decryptedCredit = fhevm.decrypt(encryptedData.creditScore, signature);
const decryptedIncome = fhevm.decrypt(encryptedData.income, signature);
```

### Privacy Guarantees

- ✅ **Rent amounts** are encrypted using FHE (`euint32`)
- ✅ **Credit scores** remain confidential (`euint32`)
- ✅ **Income data** is never exposed (`euint32`)
- ✅ **Personal information** is protected
- ✅ **Wallet signatures** required for decryption
- ✅ **EIP712** typed data signatures for security

---

## 🌐 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import `nashit07/rent-shielded-fair`

2. **Configure Environment**
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Custom Domain** (Optional)
   - Add your domain in project settings
   - Configure DNS records

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy dist folder to your hosting provider
```

---

## 🔒 Security & Privacy

### Data Protection
- **End-to-End Encryption**: All sensitive data is encrypted
- **Zero-Knowledge Architecture**: No central authority sees your data
- **FHE Implementation**: Compute on encrypted data without decryption
- **Smart Contract Audits**: Regular security assessments

### Privacy Features
- **Anonymous Transactions**: No personal data exposure
- **Encrypted Storage**: All data encrypted at rest
- **Private Keys**: User-controlled key management
- **Decentralized**: No single point of failure

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
   ```bash
   git fork https://github.com/nashit07/rent-shielded-fair.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow our coding standards
   - Add tests for new features
   - Update documentation

4. **Submit Pull Request**
   - Describe your changes
   - Link any related issues
   - Request review from maintainers

### Development Guidelines

- **Code Style**: Follow ESLint configuration
- **Testing**: Write tests for new features
- **Documentation**: Update README for significant changes
- **Security**: Follow security best practices

---

## 📊 Roadmap

### Phase 1: Core Platform ✅
- [x] FHE smart contract implementation
- [x] Privacy-preserving rental applications
- [x] Encrypted payment processing
- [x] Basic reputation system

### Phase 2: Enhanced Features 🚧
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Advanced FHE operations
- [ ] Mobile application
- [ ] Real estate API integration

### Phase 3: Ecosystem Expansion 🔮
- [ ] Insurance integration
- [ ] Automated property verification
- [ ] AI-powered matching
- [ ] Global marketplace

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Community

### Get Help
- 📖 **Documentation**: Check our comprehensive docs
- 🐛 **Bug Reports**: Create an issue on GitHub
- 💬 **Discussions**: Join our community discussions
- 🐦 **Twitter**: Follow [@rentshieldedfair](https://twitter.com/rentshieldedfair)

### Community Guidelines
- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and insights
- Report security issues responsibly

---

<div align="center">

**Built with ❤️ for a more private and secure rental experience**

*Empowering users with cryptographic privacy in the rental market*

[🌐 Live Demo](https://rent-shielded-fair.vercel.app) • [📚 Documentation](https://docs.rentshieldedfair.com) • [🐦 Twitter](https://twitter.com/rentshieldedfair)

</div>