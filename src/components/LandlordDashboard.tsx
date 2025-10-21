import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract, useReadContracts } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, DollarSign, Users, Clock, CheckCircle, XCircle, Plus, User } from "lucide-react";
import { formatEther } from 'viem';

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
  const [properties, setProperties] = useState<PropertyInfo[]>([]);
  const [applications, setApplications] = useState<ApplicationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('[LandlordDashboard] Component rendered with address:', address);

  // Get total property count
  const { data: propertyCount, isLoading: countLoading } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'propertyCounter',
  });

  console.log('[LandlordDashboard] Property count:', propertyCount);

  // Get property data for all properties
  const propertyIds = propertyCount ? Array.from({ length: Number(propertyCount) }, (_, i) => i) : [];
  
  console.log('[LandlordDashboard] Property IDs:', propertyIds);
  console.log('[LandlordDashboard] Contract address:', import.meta.env.VITE_CONTRACT_ADDRESS);
  
  const propertyCalls = propertyIds.map((id) => ({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPropertyInfo',
    args: [id],
  }));

  console.log('[LandlordDashboard] Property calls:', propertyCalls);

  const { data: propertiesData, isLoading: propertiesLoading, error: propertiesError } = useReadContracts({
    contracts: propertyCalls,
    query: {
      enabled: propertyIds.length > 0,
    },
  });

  console.log('[LandlordDashboard] Properties data:', propertiesData);
  console.log('[LandlordDashboard] Properties loading:', propertiesLoading);
  console.log('[LandlordDashboard] Properties error:', propertiesError);

  // Process properties data
  useEffect(() => {
    if (propertiesData && address) {
      console.log('📊 Processing properties data for landlord...');
      console.log('📊 Raw properties data:', propertiesData);
      
      const processedProperties: PropertyInfo[] = [];
      
      propertiesData.forEach((result, index) => {
        console.log(`📊 Processing property ${index}:`, result);
        
        if (result.status === 'success' && result.result) {
          const data = result.result as any[];
          console.log(`📊 Property ${index} data:`, data);
          
          const propertyOwner = data[10]; // propertyOwner is at index 10
          console.log(`📊 Property ${index} owner:`, propertyOwner);
          console.log(`📊 Current address:`, address);
          console.log(`📊 Owner match:`, propertyOwner.toLowerCase() === address.toLowerCase());
          
          // Only include properties owned by the current user
          if (propertyOwner.toLowerCase() === address.toLowerCase()) {
            console.log(`✅ Property ${index} belongs to landlord`);
            
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
            
            console.log(`📊 Processed property ${index}:`, property);
            processedProperties.push(property);
          } else {
            console.log(`❌ Property ${index} not owned by landlord`);
          }
        } else {
          console.log(`❌ Property ${index} failed to load:`, result);
        }
      });
      
      console.log(`✅ Found ${processedProperties.length} properties for landlord`);
      console.log('📊 Final processed properties:', processedProperties);
      setProperties(processedProperties);
      setIsLoading(false);
    }
  }, [propertiesData, address]);

  // Get applications for each property
  // Note: getPropertyApplications requires msg.sender to be the property owner
  // Since we can't pass msg.sender in useReadContracts, we'll skip this for now
  // and show a message that applications need to be viewed differently
  const applicationCalls: any[] = []; // Empty array since we can't call getPropertyApplications

  const { data: applicationsData, isLoading: applicationsLoading } = useReadContracts({
    contracts: applicationCalls,
    query: {
      enabled: false, // Disabled since we can't call getPropertyApplications
    },
  });

  console.log('[LandlordDashboard] Applications data:', applicationsData);

  // Get detailed application info for all applications
  const allApplicationIds = applicationsData?.flatMap((result, index) => {
    if (result.status === 'success' && result.result) {
      const applicationIds = result.result as number[];
      return applicationIds;
    }
    return [];
  }) || [];

  const detailedApplicationCalls = allApplicationIds.map(appId => ({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getDetailedApplicationInfo',
    args: [appId],
  }));

  const { data: detailedApplicationsData, isLoading: detailedApplicationsLoading } = useReadContracts({
    contracts: detailedApplicationCalls,
    query: {
      enabled: allApplicationIds.length > 0,
    },
  });

  console.log('[LandlordDashboard] Detailed applications data:', detailedApplicationsData);

  // Process applications data
  useEffect(() => {
    if (detailedApplicationsData && allApplicationIds.length > 0) {
      console.log('📊 Processing detailed applications data...');
      
      const allApplications: ApplicationInfo[] = [];
      
      detailedApplicationsData.forEach((result, index) => {
        if (result.status === 'success' && result.result) {
          const data = result.result as any[];
          const appId = allApplicationIds[index];
          
          console.log(`📊 Processing application ${appId} data:`, data);
          
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
          
          allApplications.push({
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
      
      console.log(`✅ Found ${allApplications.length} total applications with detailed data`);
      setApplications(allApplications);
    }
  }, [detailedApplicationsData, allApplicationIds]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Applications (View via Contract)
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground">You haven't listed any properties yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {property.name}
                          <Badge variant={property.isAvailable ? "default" : "secondary"}>
                            {property.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {property.location}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${property.monthlyRent}</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Size:</span>
                          <span>{property.propertySize} sq ft</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Bedrooms:</span>
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Bathrooms:</span>
                          <span>{property.bathrooms}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Security Deposit:</span>
                          <span>${property.securityDeposit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Listed on:</span>
                          <span>{formatDate(property.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        View Applications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Application Management</h3>
            <p className="text-muted-foreground mb-4">
              To view and manage applications for your properties, you'll need to use the contract's 
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">getPropertyApplications</code> function directly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">How to view applications:</h4>
              <ol className="text-left text-sm text-blue-800 space-y-1">
                <li>1. Connect to the contract using a blockchain explorer</li>
                <li>2. Call <code>getPropertyApplications(propertyId)</code> for each property</li>
                <li>3. Use the returned application IDs to get detailed information</li>
                <li>4. Call <code>getDetailedApplicationInfo(applicationId)</code> for each application</li>
              </ol>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This limitation exists because the contract requires the property owner to be the caller (msg.sender).
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LandlordDashboard;