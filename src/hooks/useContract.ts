import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Contract ABI for RentShieldedFair
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "propertyId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "encryptedBidAmount",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "encryptedCreditScore",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "encryptedIncome",
        "type": "bytes"
      },
      {
        "internalType": "string",
        "name": "applicationHash",
        "type": "string"
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
        "internalType": "uint256",
        "name": "_bedrooms",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_bathrooms",
        "type": "uint256"
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
  }
] as const;

// Mock FHE encryption function (in real implementation, this would use Zama's FHE library)
const encryptData = async (data: number): Promise<string> => {
  // This is a mock implementation
  // In a real FHE implementation, you would use Zama's encryption functions
  const encrypted = btoa(JSON.stringify({ value: data, timestamp: Date.now() }));
  return encrypted;
};

export const useContract = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      // Encrypt sensitive data using FHE
      const encryptedBidAmount = await encryptData(bidData.bidAmount);
      const encryptedCreditScore = await encryptData(bidData.creditScore);
      const encryptedIncome = await encryptData(bidData.income);

      // Create application hash (in real implementation, this would be IPFS hash)
      const applicationData = {
        message: bidData.message,
        moveInDate: bidData.moveInDate,
        applicant: address,
        timestamp: Date.now()
      };
      const applicationHash = btoa(JSON.stringify(applicationData));

      // Call the smart contract
      await writeContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'submitApplication',
        args: [
          BigInt(bidData.propertyId),
          encryptedBidAmount,
          encryptedCreditScore,
          encryptedIncome,
          applicationHash
        ],
        value: parseEther('0.01'), // Small fee for the transaction
      });

    } catch (err) {
      console.error('Error submitting encrypted bid:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

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
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'listProperty',
        args: [
          propertyData.name,
          propertyData.description,
          propertyData.location,
          BigInt(propertyData.monthlyRent),
          BigInt(propertyData.securityDeposit),
          BigInt(propertyData.propertySize),
          BigInt(propertyData.bedrooms),
          BigInt(propertyData.bathrooms)
        ],
      });
    } catch (err) {
      console.error('Error listing property:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitEncryptedBid,
    listProperty,
    isSubmitting: isSubmitting || isPending || isConfirming,
    isSuccess,
    error,
    hash,
    isConnected,
    address
  };
};
