import { useState, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, useWalletClient } from 'wagmi';
import { useReadContract, useReadContracts } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, DollarSign, Users, Clock, CheckCircle, XCircle, Plus, User, Eye, Shield, Loader2 } from "lucide-react";
import { formatEther } from 'viem';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { RentShieldedFairABI } from '../lib/contract';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Use public assets for Vercel deployment compatibility
const apartment1 = "/apartment-1.jpg";
const apartment2 = "/apartment-2.jpg";
const apartment3 = "/apartment-3.jpg";

// Contract ABI for reading property and application data
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "propertyCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
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
    "inputs": [{"internalType": "uint256", "name": "propertyId", "type": "uint256"}],
    "name": "getPropertyApplications",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "landlord", "type": "address"}],
    "name": "getLandlordProperties",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "landlord", "type": "address"}],
    "name": "getLandlordApplications",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllApplications",
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
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "applicationId", "type": "uint256"},
      {"internalType": "bool", "name": "isApproved", "type": "bool"}
    ],
    "name": "reviewApplication",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "string", "name": "_location", "type": "string"},
      {"internalType": "uint256", "name": "_monthlyRent", "type": "uint256"},
      {"internalType": "uint256", "name": "_securityDeposit", "type": "uint256"},
      {"internalType": "uint256", "name": "_propertySize", "type": "uint256"},
      {"internalType": "uint8", "name": "_bedrooms", "type": "uint8"},
      {"internalType": "uint8", "name": "_bathrooms", "type": "uint8"},
      {"internalType": "string", "name": "_propertyType", "type": "string"},
      {"internalType": "string", "name": "_amenities", "type": "string"},
      {"internalType": "uint256", "name": "_leaseDuration", "type": "uint256"},
      {"internalType": "uint256", "name": "_applicationDeadline", "type": "uint256"}
    ],
    "name": "listProperty",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

interface PropertyInfo {
  id: number;
  name: string;
  description: string;
  location: string;
  monthlyRent: string;
  securityDeposit: string;
  propertySize: number;
  bedrooms: number;
  bathrooms: number;
  isAvailable: boolean;
  isVerified: boolean;
  owner: string;
  createdAt: number;
  applications: ApplicationInfo[];
}

interface ApplicationInfo {
  id: number;
  applicant: string;
  moveInDate: string;
  specialRequests: string;
  status: number;
  priorityScore: number;
  submittedAt: number;
  reviewedAt: number;
  propertyOwner: string;
}

const LandlordDashboard = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { writeContract } = useWriteContract();
  const { instance, isLoading: fheLoading, error: fheError, isInitialized } = useZamaInstance();
  const [properties, setProperties] = useState<PropertyInfo[]>([]);
  const [applications, setApplications] = useState<ApplicationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState<Record<number, boolean>>({});
  const [decryptedData, setDecryptedData] = useState<Record<number, any>>({});
  const [isDecrypting, setIsDecrypting] = useState<Record<number, boolean>>({});
  const [decryptError, setDecryptError] = useState<Record<number, string>>({});
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [isAddingProperty, setIsAddingProperty] = useState(false);

  // Get total property count
  const { data: propertyCount, isLoading: countLoading } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'propertyCounter',
  });

  // Get property data for all properties
  const propertyIds = propertyCount ? Array.from({ length: Number(propertyCount) }, (_, i) => i) : [];
  
  const propertyCalls = propertyIds.map((id) => ({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPropertyInfo',
    args: [id],
  }));

  // @ts-ignore - Complex type inference issue with useReadContracts
  const { data: propertiesData, isLoading: propertiesLoading, error: propertiesError } = useReadContracts({
    contracts: propertyCalls,
    query: {
      enabled: propertyIds.length > 0,
    },
  });


  // Process properties data with useMemo to prevent unnecessary re-renders
  const processedProperties = useMemo(() => {
    if (!propertiesData || !address) return [];
    
    const properties: PropertyInfo[] = [];
    
    propertiesData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const data = result.result as any[];
        const propertyOwner = data[10]; // propertyOwner is at index 10
        
        // Only include properties owned by the current user
        if (propertyOwner.toLowerCase() === address.toLowerCase()) {
          const property = {
            id: index,
            name: data[0],
            description: data[1],
            location: data[2],
            monthlyRent: Number(data[3]).toString(),
            securityDeposit: Number(data[4]).toString(),
            propertySize: Number(data[5]),
            bedrooms: Number(data[6]),
            bathrooms: Number(data[7]),
            isAvailable: data[8],
            isVerified: data[9],
            owner: propertyOwner,
            createdAt: Number(data[11]),
            applications: []
          };
          
          properties.push(property);
        }
      }
    });
    
    return properties;
  }, [propertiesData, address]);

  // Update properties state when processed data changes
  useEffect(() => {
    setProperties(processedProperties);
    setIsLoading(false);
  }, [processedProperties]);

  // Get landlord's applications directly (more efficient)
  const { data: landlordApplicationsData, isLoading: landlordApplicationsLoading } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getLandlordApplications',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Convert application IDs to numbers with useMemo
  const allApplicationIds = useMemo(() => {
    if (!landlordApplicationsData) return [];
    const appIds = landlordApplicationsData as readonly bigint[];
    return appIds.map(id => Number(id));
  }, [landlordApplicationsData]);

  // Get detailed application info for all applications with useMemo
  const detailedApplicationCalls = useMemo(() => {
    return allApplicationIds.map(appId => ({
      address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getDetailedApplicationInfo',
      args: [appId],
    }));
  }, [allApplicationIds]);

  const { data: detailedApplicationsData, isLoading: detailedApplicationsLoading } = useReadContracts({
    contracts: detailedApplicationCalls,
    query: {
      enabled: allApplicationIds.length > 0,
    },
  });

  // Process applications data with useMemo to prevent unnecessary re-renders
  const processedApplications = useMemo(() => {
    if (!detailedApplicationsData || allApplicationIds.length === 0 || !address) return [];
    
    const applications: ApplicationInfo[] = [];
    
    detailedApplicationsData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const data = result.result as any[];
        const appId = allApplicationIds[index];
        
        // Map contract data to our interface
        // Contract returns: [isApproved, isRejected, applicationHash, moveInDate, specialRequests, applicant, propertyOwner, submittedAt, reviewedAt, priorityScore]
        const isApproved = data[0];
        const isRejected = data[1];
        const applicationHash = data[2];
        const moveInDate = data[3];
        const specialRequests = data[4];
        const applicant = data[5];
        const propertyOwner = data[6];
        const submittedAt = Number(data[7]);
        const reviewedAt = Number(data[8]);
        const priorityScore = Number(data[9]);
        
        // Determine status: 0 = pending, 1 = approved, 2 = rejected
        let status = 0; // pending
        if (isApproved) status = 1;
        else if (isRejected) status = 2;
        
        applications.push({
          id: appId,
          applicant: applicant,
          moveInDate: moveInDate,
          specialRequests: specialRequests,
          status: status,
          priorityScore: priorityScore,
          submittedAt: submittedAt,
          reviewedAt: reviewedAt,
          propertyOwner: propertyOwner
        });
      }
    });
    
    return applications;
  }, [detailedApplicationsData, allApplicationIds, address]);

  // Update applications state when processed data changes
  useEffect(() => {
    setApplications(processedApplications);
  }, [processedApplications]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle application actions
  const handleViewDetails = (application: ApplicationInfo) => {
    setSelectedApplication(application);
  };

  // FHE Decryption function (similar to MyApplications)
  const decryptApplicationData = async (applicationId: number) => {
    if (!instance || !address || !walletClient) {
      console.error('Missing FHE instance, wallet, or address');
      setDecryptError(prev => ({ ...prev, [applicationId]: 'Missing FHE instance or wallet connection' }));
      return;
    }

    setIsDecrypting(prev => ({ ...prev, [applicationId]: true }));
    setDecryptError(prev => ({ ...prev, [applicationId]: '' }));

    try {
      // Step 1: Generate keypair
      const keypair = instance.generateKeypair();

      // Step 2: Create EIP712 structure (same as MyApplications)
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
      const contractAddresses = [contractAddress];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      // Step 3: Request wallet signature (same as MyApplications)
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error('Ethereum provider not found');
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      
      const signature = await provider.request({
        method: 'eth_signTypedData_v4',
        params: [userAddress, JSON.stringify({
          domain: eip712.domain,
          types: eip712.types,
          primaryType: 'UserDecryptRequestVerification',
          message: eip712.message
        })]
      });

      // Step 4: Get encrypted data from contract
      
      const { Contract, BrowserProvider } = await import('ethers');
      
      const network = {
        chainId: walletClient.chain.id,
        name: walletClient.chain.name,
        ensAddress: walletClient.chain.contracts?.ensRegistry?.address,
      };
      const ethersProvider = new BrowserProvider(walletClient.transport as any, network);
      const signer = await ethersProvider.getSigner();
      
      const contract = new Contract(import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`, RentShieldedFairABI, signer);
      
      const encryptedData = await contract.getApplicationEncryptedData(applicationId);

      // Step 5: Perform FHE decryption
      
      const encryptedDataTyped = encryptedData as unknown as {
        proposedRent: string;
        creditScore: string;
        income: string;
      };
      
      const handleContractPairs = [
        { 
          handle: encryptedDataTyped.proposedRent, 
          contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS as string
        },
        { 
          handle: encryptedDataTyped.creditScore, 
          contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS as string
        },
        { 
          handle: encryptedDataTyped.income, 
          contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS as string
        }
      ];

      const decryptionResult = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        (signature as string).replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      const decryptedProposedRent = decryptionResult[encryptedDataTyped.proposedRent]?.toString() || '0';
      const decryptedCreditScore = decryptionResult[encryptedDataTyped.creditScore]?.toString() || '0';
      const decryptedIncome = decryptionResult[encryptedDataTyped.income]?.toString() || '0';

      const realDecryptedData = {
        proposedRent: parseInt(decryptedProposedRent),
        creditScore: parseInt(decryptedCreditScore),
        income: parseInt(decryptedIncome),
        encryptedData: {
          proposedRent: encryptedDataTyped.proposedRent,
          creditScore: encryptedDataTyped.creditScore,
          income: encryptedDataTyped.income
        }
      };

      setDecryptedData(prev => ({ ...prev, [applicationId]: realDecryptedData }));

    } catch (error) {
      console.error('FHE Decryption failed:', error);
      setDecryptError(prev => ({ ...prev, [applicationId]: error instanceof Error ? error.message : 'Decryption failed' }));
    } finally {
      setIsDecrypting(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleApproveApplication = async (applicationId: number) => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }

    setIsProcessing(prev => ({ ...prev, [applicationId]: true }));
    
    try {
      console.log('Approving application:', applicationId);
      
      const result = await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI as any,
        functionName: 'reviewApplication',
        args: [applicationId, true], // true = approve
      } as any);
      
      console.log('Application approved successfully:', result);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 1, reviewedAt: Math.floor(Date.now() / 1000) }
            : app
        )
      );
      
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }

    setIsProcessing(prev => ({ ...prev, [applicationId]: true }));
    
    try {
      console.log('Rejecting application:', applicationId);
      
      const result = await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI as any,
        functionName: 'reviewApplication',
        args: [applicationId, false], // false = reject
      } as any);
      
      console.log('Application rejected successfully:', result);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 2, reviewedAt: Math.floor(Date.now() / 1000) }
            : app
        )
      );
      
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Handle adding new property
  const handleAddProperty = async (propertyData: any) => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }

    setIsAddingProperty(true);
    
    try {
      console.log('Adding new property:', propertyData);
      
      const result = await writeContract({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI as any,
        functionName: 'listProperty',
        args: [
          propertyData.name,
          propertyData.description,
          propertyData.location,
          BigInt(propertyData.monthlyRent),
          BigInt(propertyData.securityDeposit),
          BigInt(propertyData.propertySize),
          Number(propertyData.bedrooms),
          Number(propertyData.bathrooms),
          propertyData.propertyType || 'Apartment',
          propertyData.amenities || '',
          BigInt(propertyData.leaseDuration || 12),
          BigInt(propertyData.applicationDeadline || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60)
        ],
      } as any);
      
      console.log('Property added successfully:', result);
      setShowAddProperty(false);
      
      // Refresh properties list
      window.location.reload();
      
    } catch (error) {
      console.error('Error adding property:', error);
    } finally {
      setIsAddingProperty(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-yellow-600';
      case 1: return 'text-green-600';
      case 2: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">Please connect your wallet to view your landlord dashboard.</p>
      </div>
    );
  }


  if (isLoading || countLoading || propertiesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading your properties...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Landlord Dashboard</h2>
          <p className="text-muted-foreground">Manage your rental properties and applications</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="text-sm">
            My Properties ({properties.length})
          </Badge>
          <Badge variant="outline" className="text-sm">
            Applications ({applications.length})
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Properties</h3>
            <Button onClick={() => setShowAddProperty(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
          
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">You haven't listed any properties yet.</p>
              <Button onClick={() => setShowAddProperty(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                // Use the same image mapping as Browse Properties
                const defaultImages = [apartment1, apartment2, apartment3];
                const propertyImage = defaultImages[property.id % defaultImages.length];
                
                return (
                  <Card key={property.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <div className="h-48 overflow-hidden">
                        {/* Property Image - same as Browse Properties */}
                        <img 
                          src={propertyImage}
                          alt={property.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            // Fallback to gradient background if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        {/* Fallback gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center hidden">
                          <MapPin className="w-16 h-16 text-blue-400" />
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant={property.isAvailable ? "default" : "secondary"}>
                          {property.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">{property.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {property.location}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-600">${property.monthlyRent}</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Security Deposit</div>
                        <div className="text-lg">${property.securityDeposit}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{property.bedrooms} bed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{property.bathrooms} bath</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{property.propertySize} sq ft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(property.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Applications</span>
                        <span className="font-medium">{property.applications?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">No applications have been submitted for your properties yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Application #{application.id}
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusText(application.status)}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Submitted on {formatDate(application.submittedAt)}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Priority Score: {application.priorityScore}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Applicant:</span>
                          <span className="font-mono text-xs">{application.applicant}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Move-in Date:</span>
                          <span>{application.moveInDate}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {application.specialRequests && (
                          <div className="text-sm">
                            <span className="font-medium">Special Requests:</span>
                            <p className="text-muted-foreground mt-1">{application.specialRequests}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(application)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveApplication(application.id)}
                        disabled={application.status !== 0 || isProcessing[application.id]}
                      >
                        {isProcessing[application.id] ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectApplication(application.id)}
                        disabled={application.status !== 0 || isProcessing[application.id]}
                      >
                        {isProcessing[application.id] ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Details Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Application Details #{selectedApplication?.id}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this rental application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {getStatusText(selectedApplication.status)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Priority Score: {selectedApplication.priorityScore}
                </div>
              </div>

              {/* Applicant Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Applicant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Address:</span>
                    </div>
                    <p className="font-mono text-sm bg-muted p-2 rounded">
                      {selectedApplication.applicant}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Move-in Date:</span>
                    </div>
                    <p className="text-sm">{selectedApplication.moveInDate}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedApplication.specialRequests && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Special Requests</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedApplication.specialRequests}
                  </p>
                </div>
              )}

              {/* Encrypted Data Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Encrypted Financial Data
                  </h3>
                  {!decryptedData[selectedApplication.id] && (
                    <Button
                      onClick={() => decryptApplicationData(selectedApplication.id)}
                      disabled={isDecrypting[selectedApplication.id] || !isInitialized}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isDecrypting[selectedApplication.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Decrypting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Decrypt Sensitive Data
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {decryptError[selectedApplication.id] && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">
                      Decryption Error: {decryptError[selectedApplication.id]}
                    </p>
                  </div>
                )}

                {decryptedData[selectedApplication.id] ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-800">Proposed Rent</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        ${decryptedData[selectedApplication.id].proposedRent.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-800">Credit Score</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {decryptedData[selectedApplication.id].creditScore}
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-purple-800">Monthly Income</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">
                        ${decryptedData[selectedApplication.id].income.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <Shield className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm">
                      Click "Decrypt Sensitive Data" to view encrypted financial information
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h3 className="font-semibold">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Submitted:</span>
                    <span>{formatDate(selectedApplication.submittedAt)}</span>
                  </div>
                  {selectedApplication.reviewedAt > 0 && (
                    <div className="flex justify-between">
                      <span>Reviewed:</span>
                      <span>{formatDate(selectedApplication.reviewedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedApplication.status === 0 && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApproveApplication(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    disabled={isProcessing[selectedApplication.id]}
                  >
                    Approve Application
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleRejectApplication(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    disabled={isProcessing[selectedApplication.id]}
                  >
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Property Modal */}
      <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Property
            </DialogTitle>
            <DialogDescription>
              List a new rental property for tenants to apply
            </DialogDescription>
          </DialogHeader>
          
          <AddPropertyForm 
            onSubmit={handleAddProperty}
            isLoading={isAddingProperty}
            onCancel={() => setShowAddProperty(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add Property Form Component
const AddPropertyForm = ({ onSubmit, isLoading, onCancel }: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    monthlyRent: '',
    securityDeposit: '',
    propertySize: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: 'Apartment',
    amenities: '',
    leaseDuration: '12',
    applicationDeadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Property Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Modern Downtown Apartment"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., 123 Main St, City, State"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your property, amenities, and what makes it special..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthlyRent">Monthly Rent ($) *</Label>
          <Input
            id="monthlyRent"
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => handleChange('monthlyRent', e.target.value)}
            placeholder="2000"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="securityDeposit">Security Deposit ($) *</Label>
          <Input
            id="securityDeposit"
            type="number"
            value={formData.securityDeposit}
            onChange={(e) => handleChange('securityDeposit', e.target.value)}
            placeholder="2000"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="propertySize">Size (sq ft) *</Label>
          <Input
            id="propertySize"
            type="number"
            value={formData.propertySize}
            onChange={(e) => handleChange('propertySize', e.target.value)}
            placeholder="1200"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms *</Label>
          <Input
            id="bedrooms"
            type="number"
            min="1"
            value={formData.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
            placeholder="2"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms *</Label>
          <Input
            id="bathrooms"
            type="number"
            min="1"
            step="0.5"
            value={formData.bathrooms}
            onChange={(e) => handleChange('bathrooms', e.target.value)}
            placeholder="1.5"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Input
            id="propertyType"
            value={formData.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            placeholder="Apartment, House, Condo, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="leaseDuration">Lease Duration (months)</Label>
          <Input
            id="leaseDuration"
            type="number"
            value={formData.leaseDuration}
            onChange={(e) => handleChange('leaseDuration', e.target.value)}
            placeholder="12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amenities">Amenities</Label>
        <Textarea
          id="amenities"
          value={formData.amenities}
          onChange={(e) => handleChange('amenities', e.target.value)}
          placeholder="e.g., Parking, Gym, Pool, Laundry, etc."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding Property...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default LandlordDashboard;