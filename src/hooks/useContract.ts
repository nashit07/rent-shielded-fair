import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { fheManager } from '../lib/fhe-utils';
import { ErrorHandler } from '../utils/errorHandler';

// Contract ABI for RentShieldedFair
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_monthlyRent",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_securityDeposit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_propertySize",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_bedrooms",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "_bathrooms",
        "type": "uint8"
      }
    ],
    "name": "listProperty",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "propertyId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "proposedRent",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "creditScore",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "income",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "applicationHash",
        "type": "string"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "submitApplication",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "applicationId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isApproved",
        "type": "bool"
      }
    ],
    "name": "reviewApplication",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "applicationId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "monthlyRent",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "securityDeposit",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "leaseDuration",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "agreementHash",
        "type": "string"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "createAgreement",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "agreementId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "amount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "month",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "year",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "paymentHash",
        "type": "string"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "makePayment",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export const useContract = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const listProperty = async (propertyData: {
    name: string;
    description: string;
    location: string;
    monthlyRent: number;
    securityDeposit: number;
    propertySize: number;
    bedrooms: number;
    bathrooms: number;
  }) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    setIsSubmitting(true);

    try {
      await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'listProperty',
        args: [
          propertyData.name,
          propertyData.description,
          propertyData.location,
          BigInt(propertyData.monthlyRent),
          BigInt(propertyData.securityDeposit),
          BigInt(propertyData.propertySize),
          propertyData.bedrooms,
          propertyData.bathrooms
        ],
      });
    } catch (err) {
      console.error('Error listing property:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitApplication = async (applicationData: {
    propertyId: number;
    proposedRent: number;
    creditScore: number;
    income: number;
    message: string;
    moveInDate: string;
  }) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    setIsSubmitting(true);

    try {
      // Initialize FHE manager
      await fheManager.initialize();
      
      // Encrypt application data
      const { handles, inputProof } = await fheManager.encryptApplicationData(
        import.meta.env.VITE_CONTRACT_ADDRESS as string,
        address,
        {
          proposedRent: applicationData.proposedRent,
          creditScore: applicationData.creditScore,
          income: applicationData.income
        }
      );

      // Create application hash
      const applicationHash = btoa(JSON.stringify({
        message: applicationData.message,
        moveInDate: applicationData.moveInDate,
        applicant: address,
        timestamp: Date.now()
      }));

      await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'submitApplication',
        args: [
          BigInt(applicationData.propertyId),
          handles[0], // proposedRent
          handles[1], // creditScore
          handles[2], // income
          applicationHash,
          inputProof
        ],
        value: parseEther('0.01'), // Small fee for the transaction
      });
    } catch (err) {
      console.error('Error submitting application:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewApplication = async (applicationId: number, isApproved: boolean) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    setIsSubmitting(true);

    try {
      await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'reviewApplication',
        args: [BigInt(applicationId), isApproved],
      });
    } catch (err) {
      console.error('Error reviewing application:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const createAgreement = async (agreementData: {
    applicationId: number;
    monthlyRent: number;
    securityDeposit: number;
    leaseDuration: number;
    agreementHash: string;
  }) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    setIsSubmitting(true);

    try {
      // Initialize FHE manager
      await fheManager.initialize();
      
      // Encrypt agreement data
      const { handles, inputProof } = await fheManager.encryptAgreementData(
        import.meta.env.VITE_CONTRACT_ADDRESS as string,
        address,
        {
          monthlyRent: agreementData.monthlyRent,
          securityDeposit: agreementData.securityDeposit,
          leaseDuration: agreementData.leaseDuration
        }
      );

      await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createAgreement',
        args: [
          BigInt(agreementData.applicationId),
          handles[0], // monthlyRent
          handles[1], // securityDeposit
          handles[2], // leaseDuration
          agreementData.agreementHash,
          inputProof
        ],
      });
    } catch (err) {
      console.error('Error creating agreement:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const makePayment = async (paymentData: {
    agreementId: number;
    amount: number;
    month: number;
    year: number;
    paymentHash: string;
  }) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    setIsSubmitting(true);

    try {
      // Initialize FHE manager
      await fheManager.initialize();
      
      // Encrypt payment data
      const { handles, inputProof } = await fheManager.encryptPaymentData(
        import.meta.env.VITE_CONTRACT_ADDRESS as string,
        address,
        {
          amount: paymentData.amount,
          month: paymentData.month,
          year: paymentData.year
        }
      );

      await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'makePayment',
        args: [
          BigInt(paymentData.agreementId),
          handles[0], // amount
          handles[1], // month
          handles[2], // year
          paymentData.paymentHash,
          inputProof
        ],
        value: parseEther('0.01'), // Small fee for the transaction
      });
    } catch (err) {
      console.error('Error making payment:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEncryptedBid = async (bidData: {
    propertyId: number;
    bidAmount: number;
    creditScore: number;
    income: number;
    message: string;
    moveInDate: string;
  }) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    console.log('🚀 Starting encrypted bid submission process...');
    console.log('📊 Bid data:', bidData);
    console.log('👤 User address:', address);
    console.log('🔗 Contract address:', import.meta.env.VITE_CONTRACT_ADDRESS);

    setIsSubmitting(true);

    try {
      console.log('🔄 Step 1: Initializing FHE manager...');
      await fheManager.initialize();
      console.log('✅ FHE manager initialized');
      
      console.log('🔄 Step 2: Encrypting application data...');
      const { handles, inputProof } = await fheManager.encryptApplicationData(
        import.meta.env.VITE_CONTRACT_ADDRESS as string,
        address,
        {
          proposedRent: bidData.bidAmount,
          creditScore: bidData.creditScore,
          income: bidData.income
        }
      );
      console.log('✅ Application data encrypted successfully');

      console.log('🔄 Step 3: Preparing contract call...');
      // Create application hash from message and moveInDate
      const applicationData = `${bidData.message}|${bidData.moveInDate}`;
      const applicationHash = btoa(applicationData); // Simple encoding for demo
      
      const contractArgs = [
        BigInt(bidData.propertyId),
        handles[0], // proposedRent
        handles[1], // creditScore
        handles[2], // income
        applicationHash, // Combined message and moveInDate
        inputProof
      ];
      console.log('📋 Contract arguments:', contractArgs);
      console.log('📋 Argument count:', contractArgs.length);
      console.log('📋 Expected count: 6');
      console.log('📋 Application hash:', applicationHash);

      console.log('🔄 Step 4: Calling contract...');
      console.log('📋 Contract call details:', {
        address: import.meta.env.VITE_CONTRACT_ADDRESS,
        functionName: 'submitApplication',
        args: contractArgs
      });
      
      const result = await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'submitApplication',
        args: contractArgs,
      });
      
      console.log('✅ Contract call submitted successfully');
      console.log('📋 Transaction hash:', result);
      
      // Wait for transaction confirmation
      console.log('🔄 Waiting for transaction confirmation...');
      // The useWaitForTransactionReceipt hook will handle this automatically
    } catch (err) {
      ErrorHandler.logError('Encrypted Bid Submission', err, {
        bidData,
        userAddress: address,
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    listProperty,
    submitApplication,
    submitEncryptedBid,
    reviewApplication,
    createAgreement,
    makePayment,
    isSubmitting: isSubmitting || isPending || isConfirming,
    isSuccess,
    error,
    hash,
    isConnected,
    address
  };
};
