import { useState, useEffect } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';

// Contract ABI for reading property data
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "propertyId", "type": "uint256"}],
    "name": "getPropertyInfo",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "location", "type": "string"},
      {"internalType": "uint256", "name": "monthlyRent", "type": "uint256"},
      {"internalType": "uint256", "name": "securityDeposit", "type": "uint256"},
      {"internalType": "uint256", "name": "propertySize", "type": "uint256"},
      {"internalType": "uint8", "name": "bedrooms", "type": "uint8"},
      {"internalType": "uint8", "name": "bathrooms", "type": "uint8"},
      {"internalType": "bool", "name": "isAvailable", "type": "bool"},
      {"internalType": "bool", "name": "isVerified", "type": "bool"},
      {"internalType": "address", "name": "propertyOwner", "type": "address"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "propertyCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface Property {
  id: number;
  name: string;
  description: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  propertySize: number;
  bedrooms: number;
  bathrooms: number;
  isAvailable: boolean;
  isVerified: boolean;
  owner: string;
  createdAt: number;
  applicationDeadline?: number;
  propertyType?: string;
  amenities?: string;
}

export const usePropertiesReal = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get property count
  const { data: propertyCount, isLoading: countLoading } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'propertyCounter',
  });

  // Get all property IDs
  const propertyIds = propertyCount ? Array.from({ length: Number(propertyCount) }, (_, i) => i) : [];

  // Get info for all properties
  const propertyCalls = propertyIds.map(id => ({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPropertyInfo',
    args: [id],
  }));

  const { data: propertiesData, isLoading: propertiesLoading } = useReadContracts({
    contracts: propertyCalls,
    query: {
      enabled: propertyIds.length > 0,
    },
  });

  // Process properties data
  useEffect(() => {
    if (propertiesData && propertyIds.length > 0) {
      console.log('📊 Processing properties data...');
      
      const processedProperties: Property[] = [];
      
      propertiesData.forEach((result, index) => {
        if (result.status === 'success' && result.result) {
          const data = result.result as any[];
          
          console.log(`📊 Processing property ${index} data:`, data);
          
          processedProperties.push({
            id: index,
            name: data[0],
            description: data[1],
            location: data[2],
            monthlyRent: Number(data[3]), // Convert to number instead of using formatEther
            securityDeposit: Number(data[4]), // Convert to number instead of using formatEther
            propertySize: Number(data[5]),
            bedrooms: Number(data[6]),
            bathrooms: Number(data[7]),
            isAvailable: data[8],
            isVerified: data[9],
            owner: data[10],
            createdAt: Number(data[11]),
            applicationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // Default deadline
            propertyType: "apartment", // Default type
            amenities: '[]' // Default amenities
          });
        }
      });
      
      console.log(`✅ Found ${processedProperties.length} properties from contract`);
      setProperties(processedProperties);
      setLoading(false);
    }
  }, [propertiesData, propertyIds.length]);

  return {
    properties,
    loading: loading || countLoading || propertiesLoading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger refetch logic here
    }
  };
};
