import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';

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

  useEffect(() => {
    const fetchProperties = async () => {
      if (!propertyCount || countLoading) return;

      setLoading(true);
      setError(null);

      try {
        const totalProperties = Number(propertyCount);
        console.log(`📊 Fetching ${totalProperties} properties from contract...`);

        if (totalProperties === 0) {
          console.log('📋 No properties found in contract');
          setProperties([]);
        } else {
          // Fetch properties from contract using multiple useReadContract calls
          const fetchedProperties: Property[] = [];
          
          for (let i = 0; i < totalProperties; i++) {
            try {
              // Create a custom hook call for each property
              const propertyData = await fetchPropertyData(i);
              
              if (propertyData) {
                fetchedProperties.push(propertyData);
              }
            } catch (err) {
              console.error(`Failed to fetch property ${i}:`, err);
            }
          }
          
          setProperties(fetchedProperties);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [propertyCount, countLoading]);

  const fetchPropertyData = async (propertyId: number): Promise<Property | null> => {
    try {
      // Use a direct contract call
      const response = await fetch('/api/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: import.meta.env.VITE_CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getPropertyInfo',
          args: [propertyId]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const [
          name,
          description,
          location,
          monthlyRent,
          securityDeposit,
          propertySize,
          bedrooms,
          bathrooms,
          isAvailable,
          isVerified,
          propertyOwner,
          createdAt
        ] = data.result;

        return {
          id: propertyId,
          name,
          description,
          location,
          monthlyRent: Number(monthlyRent),
          securityDeposit: Number(securityDeposit),
          propertySize: Number(propertySize),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          isAvailable,
          isVerified,
          owner: propertyOwner,
          createdAt: Number(createdAt),
          applicationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // Default 30 days
          propertyType: "apartment", // Default type
          amenities: "[]" // Default empty amenities
        };
      }
    } catch (err) {
      console.error(`Error fetching property ${propertyId}:`, err);
    }
    
    return null;
  };

  return {
    properties,
    loading: loading || countLoading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger refetch logic here
    }
  };
};
