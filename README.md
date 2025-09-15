# Rent Shielded Fair

A privacy-preserving rental platform built with FHE (Fully Homomorphic Encryption) technology, enabling secure and confidential rental transactions on the blockchain.

## 🏠 Features

- **Privacy-First**: All sensitive rental data is encrypted using FHE technology
- **Decentralized**: Built on blockchain for transparency and security
- **Fair Pricing**: Algorithm-based rent determination
- **Secure Payments**: Encrypted payment processing
- **Reputation System**: Encrypted reputation tracking for tenants and landlords
- **Smart Contracts**: Automated rental agreements and payments

## 🔐 Privacy Features

- **Encrypted Rent Amounts**: Monthly rent and security deposits are encrypted
- **Private Credit Scores**: Credit information remains confidential
- **Secure Income Verification**: Income data is encrypted and verified
- **Anonymous Applications**: Rental applications maintain privacy
- **Encrypted Reputation**: User reputation scores are encrypted

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Ethereum Sepolia Testnet
- **Encryption**: FHE (Fully Homomorphic Encryption) via Zama
- **Wallet**: RainbowKit with multiple wallet support
- **Smart Contracts**: Solidity with FHE integration
- **UI Components**: shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A Web3 wallet (MetaMask, Rainbow, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nashit07/rent-shielded-fair.git
cd rent-shielded-fair
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📋 Environment Variables

Create a `.env` file with the following variables:

```env
# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Wallet Connect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

## 🏗️ Smart Contract

The platform uses a smart contract with FHE integration for:

- Property listing with encrypted rent amounts
- Rental applications with encrypted personal data
- Secure payment processing
- Reputation management
- Automated rental agreements

### Contract Functions

- `listProperty()`: List a property with encrypted rent data
- `submitApplication()`: Submit rental application with encrypted personal info
- `createAgreement()`: Create rental agreement with encrypted terms
- `makePayment()`: Process encrypted rental payments
- `updateReputation()`: Update encrypted user reputation scores

## 🔒 Security

- All sensitive data is encrypted using FHE
- Smart contracts are audited and tested
- Private keys are managed by user wallets
- No central authority controls user data

## 🌐 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our community Discord
- Follow us on Twitter

## 🔮 Roadmap

- [ ] Multi-chain support
- [ ] Mobile app
- [ ] Advanced FHE features
- [ ] Integration with real estate APIs
- [ ] Automated property verification
- [ ] Insurance integration

---

Built with ❤️ using FHE technology for a more private and secure rental experience.