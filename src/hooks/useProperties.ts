import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { useContract } from './useContract';

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

export const useProperties = () => {
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
          // Use mock data if no properties in contract
          console.log('📋 No properties found in contract, using mock data');
          const mockProperties: Property[] = [
            {
              id: 0,
              name: "Luxury Downtown Apartment",
              description: "Modern 2-bedroom apartment in the heart of downtown with stunning city views, hardwood floors, and premium amenities.",
              location: "New York, NY",
              monthlyRent: 3500,
              securityDeposit: 7000,
              propertySize: 1200,
              bedrooms: 2,
              bathrooms: 2,
              isAvailable: true,
              isVerified: true,
              owner: "0x55a5233414043d10cc7b93875b34afc93e017a63",
              createdAt: Date.now() - 86400000,
              applicationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
              propertyType: "apartment",
              amenities: '["gym", "pool", "concierge", "parking", "balcony"]'
            },
            {
              id: 1,
              name: "Cozy Suburban House",
              description: "Charming 3-bedroom house in a quiet suburban neighborhood with a large backyard and garage.",
              location: "San Francisco, CA",
              monthlyRent: 4200,
              securityDeposit: 8400,
              propertySize: 1800,
              bedrooms: 3,
              bathrooms: 2,
              isAvailable: true,
              isVerified: true,
              owner: "0x55a5233414043d10cc7b93875b34afc93e017a63",
              createdAt: Date.now() - 172800000
            },
            {
              id: 2,
              name: "Modern Studio Loft",
              description: "Contemporary studio loft with high ceilings, exposed brick walls, and open floor plan perfect for young professionals.",
              location: "Los Angeles, CA",
              monthlyRent: 2800,
              securityDeposit: 5600,
              propertySize: 800,
              bedrooms: 1,
              bathrooms: 1,
              isAvailable: true,
              isVerified: true,
              owner: "0x55a5233414043d10cc7b93875b34afc93e017a63",
              createdAt: Date.now() - 259200000
            }
          ];
          setProperties(mockProperties);
        } else {
          // For now, use mock data until we implement proper contract reading
          console.log('📋 Using mock data for development');
          const mockProperties: Property[] = [
            {
              id: 0,
              name: "Luxury Downtown Apartment",
              description: "Modern 2-bedroom apartment in the heart of downtown with stunning city views, hardwood floors, and premium amenities.",
              location: "New York, NY",
              monthlyRent: 3500,
              securityDeposit: 7000,
              propertySize: 1200,
              bedrooms: 2,
              bathrooms: 2,
              isAvailable: true,
              isVerified: true,
              owner: "0x55a5233414043d10cc7b93875b34afc93e017a63",
              createdAt: Date.now() - 86400000,
              applicationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
              propertyType: "apartment",
              amenities: '["gym", "pool", "concierge", "parking", "balcony"]'
            },
            {
              id: 1,
              name: "Cozy Suburban House",
              description: "Charming 3-bedroom house in a quiet suburban neighborhood with a large backyard and garage.",
              location: "San Francisco, CA",
              monthlyRent: 4200,
              securityDeposit: 8400,
              propertySize: 1800,
              bedrooms: 3,
              bathrooms: 2,
              isAvailable: true,
              isVerified: true,
              owner: "0x55a5233414043d10cc7b93875b34afc93e017a63",
              createdAt: Date.now() - 172800000
            },
            {
              id: 2,
              name: "Modern Studio Loft",
              description: "Contemporary studio loft with high ceilings, exposed brick walls, and open floor plan perfect for young professionals.",
              location: "Los Angeles, CA",
              monthlyRent: 2800,
              securityDeposit: 5600,
              propertySize: 800,
              bedrooms: 1,
              bathrooms: 1,
              isAvailable: true,
              isVerified: true,
              owner: "0x55a5233414043d10cc7b93875b34afc93e017a63",
              createdAt: Date.now() - 259200000
            }
          ];
          setProperties(mockProperties);
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
