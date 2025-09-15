# Vercel Deployment Guide for Rent Shielded Fair

This guide provides step-by-step instructions for deploying the Rent Shielded Fair application to Vercel.

## Prerequisites

- Vercel account (free tier available)
- GitHub repository access
- Environment variables ready

## Step-by-Step Deployment

### Step 1: Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project" on the dashboard

### Step 2: Import GitHub Repository

1. In the "Import Git Repository" section, find `nashit07/rent-shielded-fair`
2. Click "Import" next to the repository
3. Vercel will automatically detect it's a Vite project

### Step 3: Configure Project Settings

1. **Project Name**: `rent-shielded-fair` (or your preferred name)
2. **Framework Preset**: Vite (should be auto-detected)
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `dist` (default)
6. **Install Command**: `npm install` (default)

### Step 4: Set Environment Variables

Click "Environment Variables" and add the following:

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID
NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_API_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

**Important**: Replace `NEXT_PUBLIC_CONTRACT_ADDRESS` with your actual deployed contract address.

### Step 5: Deploy

1. Click "Deploy" button
2. Wait for the build process to complete (usually 2-3 minutes)
3. Vercel will provide you with a deployment URL

### Step 6: Custom Domain (Optional)

1. Go to your project dashboard
2. Click "Settings" tab
3. Click "Domains" in the sidebar
4. Add your custom domain
5. Follow DNS configuration instructions

## Post-Deployment Configuration

### 1. Update Contract Address

After deploying your smart contract:

1. Go to Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` with your deployed contract address
4. Redeploy the project

### 2. Verify Deployment

1. Visit your deployment URL
2. Test wallet connection
3. Verify all features work correctly
4. Check console for any errors

## Environment Variables Reference

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_CHAIN_ID` | Ethereum chain ID | `11155111` (Sepolia) |
| `NEXT_PUBLIC_RPC_URL` | RPC endpoint URL | `https://sepolia.infura.io/v3/...` |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID | `YOUR_WALLET_CONNECT_PROJECT_ID` |
| `NEXT_PUBLIC_INFURA_API_KEY` | Infura API key | `YOUR_INFURA_API_KEY` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | `0x...` |

## Troubleshooting

### Build Failures

1. **Dependency Issues**: Check `package.json` for correct dependencies
2. **TypeScript Errors**: Fix any TypeScript compilation errors
3. **Environment Variables**: Ensure all required variables are set

### Runtime Issues

1. **Wallet Connection**: Verify WalletConnect project ID is correct
2. **Network Issues**: Check RPC URL and chain ID
3. **Contract Issues**: Ensure contract address is correct and deployed

### Performance Optimization

1. **Bundle Size**: Use Vite's build analysis to optimize bundle size
2. **Image Optimization**: Optimize images in `src/assets/`
3. **Code Splitting**: Implement lazy loading for better performance

## Automatic Deployments

Vercel automatically deploys when you push to the main branch:

1. Push changes to GitHub
2. Vercel detects the push
3. Automatic deployment starts
4. New version goes live after successful build

## Monitoring and Analytics

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Monitor deployment logs
3. **Performance**: Use Vercel's performance insights

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to repository
2. **API Keys**: Use Vercel's environment variables for API keys
3. **HTTPS**: Vercel provides HTTPS by default
4. **CORS**: Configure CORS settings if needed

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- Project Issues: Create issues in the GitHub repository

---

**Note**: This deployment guide assumes you have already deployed your smart contract to the Sepolia testnet. Make sure to update the contract address in environment variables after deployment.
