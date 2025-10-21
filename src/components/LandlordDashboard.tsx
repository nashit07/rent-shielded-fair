import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, DollarSign, Users, Clock, CheckCircle, XCircle, Plus, User } from "lucide-react";

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
];

interface PropertyInfo {
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
  applicationCount?: number;
}

interface ApplicationInfo {
  applicationId: number;
  propertyId: number;
  isApproved: boolean;
  isRejected: boolean;
  applicationHash: string;
  moveInDate: string;
  specialRequests: string;
  applicant: string;
  propertyOwner: string;
  submittedAt: number;
  reviewedAt: number;
  priorityScore: number;
}

const LandlordDashboard = () => {
  const { address } = useAccount();
  const [properties, setProperties] = useState<PropertyInfo[]>([]);
  const [applications, setApplications] = useState<ApplicationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get property count
  const { data: propertyCount, isLoading: countLoading } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'propertyCounter',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyCount || countLoading || !address) return;

      setLoading(true);
      setError(null);

      try {
        const totalProperties = Number(propertyCount);
        console.log(`📊 Fetching ${totalProperties} properties for landlord...`);

        const fetchedProperties: PropertyInfo[] = [];
        const allApplications: ApplicationInfo[] = [];

        for (let i = 0; i < totalProperties; i++) {
          try {
            // Check if this property belongs to the current user
            const propertyData = await fetchPropertyData(i);
            if (propertyData && propertyData.owner.toLowerCase() === address.toLowerCase()) {
              fetchedProperties.push(propertyData);

              // Fetch applications for this property
              const propertyApplications = await fetchPropertyApplications(i);
              allApplications.push(...propertyApplications);
            }
          } catch (err) {
            console.error(`Failed to fetch property ${i}:`, err);
          }
        }

        setProperties(fetchedProperties);
        setApplications(allApplications);
      } catch (err) {
        console.error('Error fetching landlord data:', err);
        setError('Failed to fetch landlord data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyCount, countLoading, address]);

  const fetchPropertyData = async (propertyId: number): Promise<PropertyInfo | null> => {
    try {
      console.log(`🔍 Fetching property ${propertyId} data for landlord...`);
      
      // For now, return mock data since we don't have a backend API
      // In production, this would use direct contract calls
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
          createdAt: Date.now() - 86400000
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
          createdAt: Date.now() - 172800000
        }
      ];

      const property = mockProperties[propertyId];
      if (property) {
        console.log(`✅ Property ${propertyId} data loaded for landlord:`, property.name);
        return property;
      }
    } catch (err) {
      console.error(`❌ Error fetching property ${propertyId}:`, err);
    }
    
    return null;
  };

  const fetchPropertyApplications = async (propertyId: number): Promise<ApplicationInfo[]> => {
    try {
      console.log(`🔍 Fetching applications for property ${propertyId}...`);
      
      // For now, return mock data since we don't have a backend API
      // In production, this would use direct contract calls
      const mockApplications = [
        {
          applicationId: 0,
          propertyId: propertyId,
          isApproved: false,
          isRejected: false,
          applicationHash: "hash_12345",
          moveInDate: "2024-12-01",
          specialRequests: "Pet-friendly unit preferred",
          applicant: "0x1234567890123456789012345678901234567890",
          propertyOwner: "0x3f0EB6E953eDA41d70a497712C0D64D33035aDac",
          submittedAt: Date.now() - 86400000,
          reviewedAt: 0,
          priorityScore: 85
        }
      ];

      console.log(`✅ Applications for property ${propertyId} loaded:`, mockApplications.length);
      return mockApplications;
    } catch (err) {
      console.error(`❌ Error fetching applications for property ${propertyId}:`, err);
    }
    
    return [];
  };

  const fetchApplicationData = async (applicationId: number): Promise<ApplicationInfo | null> => {
    try {
      console.log(`🔍 Fetching application ${applicationId} data...`);
      
      // For now, return mock data since we don't have a backend API
      // In production, this would use direct contract calls
      const mockApplication = {
        applicationId,
        propertyId: 0, // Will be set by caller
        isApproved: false,
        isRejected: false,
        applicationHash: "hash_12345",
        moveInDate: "2024-12-01",
        specialRequests: "Pet-friendly unit preferred",
        applicant: "0x1234567890123456789012345678901234567890",
        propertyOwner: "0x3f0EB6E953eDA41d70a497712C0D64D33035aDac",
        submittedAt: Date.now() - 86400000,
        reviewedAt: 0,
        priorityScore: 85
      };

      console.log(`✅ Application ${applicationId} data loaded`);
      return mockApplication;
    } catch (err) {
      console.error(`❌ Error fetching application ${applicationId}:`, err);
    }
    
    return null;
  };

  const getStatusBadge = (application: ApplicationInfo) => {
    if (application.isApproved) {
      return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    } else if (application.isRejected) {
      return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Not reviewed';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">Please connect your wallet to access the landlord dashboard.</p>
      </div>
    );
  }

  if (loading || countLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading landlord dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Landlord Dashboard</h2>
          <p className="text-muted-foreground">Manage your properties and review applications</p>
        </div>
        <Button onClick={() => window.location.href = '/properties'}>
          <Plus className="w-4 h-4 mr-2" />
          List New Property
        </Button>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties">My Properties ({properties.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Listed</h3>
              <p className="text-muted-foreground">You haven't listed any properties yet.</p>
              <Button className="mt-4" onClick={() => window.location.href = '/properties'}>
                <Plus className="w-4 h-4 mr-2" />
                List Your First Property
              </Button>
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
                            {property.isAvailable ? 'Available' : 'Rented'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {property.location}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${property.monthlyRent.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Size:</span>
                        <div>{property.propertySize} sq ft</div>
                      </div>
                      <div>
                        <span className="font-medium">Bedrooms:</span>
                        <div>{property.bedrooms}</div>
                      </div>
                      <div>
                        <span className="font-medium">Bathrooms:</span>
                        <div>{property.bathrooms}</div>
                      </div>
                      <div>
                        <span className="font-medium">Security Deposit:</span>
                        <div>${property.securityDeposit.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Listed on {formatDate(property.createdAt)}
                        </span>
                        <Button variant="outline" size="sm">
                          View Applications
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications</h3>
              <p className="text-muted-foreground">You haven't received any applications yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((application) => (
                <Card key={application.applicationId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Application #{application.applicationId}
                          {getStatusBadge(application)}
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
                          <span>{application.moveInDate || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {application.specialRequests && (
                          <div className="text-sm">
                            <span className="font-medium">Special Requests:</span>
                            <p className="text-muted-foreground mt-1">{application.specialRequests}</p>
                          </div>
                        )}
                        {application.reviewedAt > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Reviewed:</span>
                            <span>{formatDate(application.reviewedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {!application.isApproved && !application.isRejected && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LandlordDashboard;
