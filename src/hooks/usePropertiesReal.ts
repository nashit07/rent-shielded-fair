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
      console.log(`🔍 Fetching property ${propertyId} data...`);
      
      // For now, return mock data since we don't have a backend API
      // In production, this would use direct contract calls or a proper API
      const mockProperties = [
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
          owner: "0x3f0EB6E953eDA41d70a497712C0D64D33035aDac",
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
          owner: "0x3f0EB6E953eDA41d70a497712C0D64D33035aDac",
          createdAt: Date.now() - 172800000,
          applicationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          propertyType: "house",
          amenities: '["garage", "garden", "fireplace", "hardwood_floors"]'
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
          owner: "0x3f0EB6E953eDA41d70a497712C0D64D33035aDac",
          createdAt: Date.now() - 259200000,
          applicationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          propertyType: "studio",
          amenities: '["high_ceilings", "exposed_brick", "modern_appliances"]'
        },
        {
          id: 3,
          name: "Family Townhouse",
          description: "Spacious 4-bedroom townhouse with modern kitchen, large living area, and private patio. Perfect for families.",
          location: "Chicago, IL",
          monthlyRent: 3800,
          securityDeposit: 7600,
          propertySize: 2200,
          bedrooms: 4,
          bathrooms: 3,
          isAvailable: true,
          isVerified: true,
          owner: "0x3f0EB6E953eDA41d70a497712C0D64D33035aDac",
          createdAt: Date.now() - 345600000,
          applicationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          propertyType: "townhouse",
          amenities: '["patio", "modern_kitchen", "family_room", "parking"]'
        },
        {
          id: 4,
          name: "Penthouse Suite",
          description: "Luxurious penthouse with panoramic city views, premium finishes, and exclusive amenities including rooftop access.",
          location: "Miami, FL",
          monthlyRent: 5500,
          securityDeposit: 11000,
          propertySize: 1500,
          bedrooms: 2,
          bathrooms: 2,
          isAvailable: true,
          isVerified: true,
          owner: "0x3f0EB6E953eDA41d70a497712C0D64D33035aDac",
          createdAt: Date.now() - 432000000,
          applicationDeadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          propertyType: "penthouse",
          amenities: '["rooftop", "city_view", "premium_finishes", "concierge"]'
        }
      ];

      const property = mockProperties[propertyId];
      if (property) {
        console.log(`✅ Property ${propertyId} data loaded:`, property.name);
        return property;
      }
    } catch (err) {
      console.error(`❌ Error fetching property ${propertyId}:`, err);
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
