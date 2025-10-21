import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign, User, Clock, CheckCircle, XCircle } from "lucide-react";

// Contract ABI for reading application data
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserApplications",
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
  }
];

interface ApplicationInfo {
  applicationId: number;
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
  propertyName?: string;
  propertyLocation?: string;
  propertyRent?: number;
}

const MyApplications = () => {
  const { address } = useAccount();
  const [applications, setApplications] = useState<ApplicationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user applications
  const { data: userApplications, isLoading: applicationsLoading } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getUserApplications',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userApplications || applicationsLoading || !address) return;

      setLoading(true);
      setError(null);

      try {
        const applicationIds = userApplications as number[];
        console.log(`📊 Fetching ${applicationIds.length} applications for user...`);

        const fetchedApplications: ApplicationInfo[] = [];

        for (const applicationId of applicationIds) {
          try {
            // Fetch application details
            const applicationData = await fetchApplicationData(applicationId);
            if (applicationData) {
              fetchedApplications.push(applicationData);
            }
          } catch (err) {
            console.error(`Failed to fetch application ${applicationId}:`, err);
          }
        }

        setApplications(fetchedApplications);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userApplications, applicationsLoading, address]);

  const fetchApplicationData = async (applicationId: number): Promise<ApplicationInfo | null> => {
    try {
      console.log(`🔍 Fetching application ${applicationId} data...`);
      
      // For now, return mock data since we don't have a backend API
      // In production, this would use direct contract calls
      const mockApplications = [
        {
          applicationId: 0,
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
        },
        {
          applicationId: 1,
          isApproved: true,
          isRejected: false,
          applicationHash: "hash_67890",
          moveInDate: "2024-11-15",
          specialRequests: "Ground floor unit",
          applicant: "0x1234567890123456789012345678901234567890",
          propertyOwner: "0x3f0EB6E953eDA41d70a497712C0D64D33035aDac",
          submittedAt: Date.now() - 172800000,
          reviewedAt: Date.now() - 86400000,
          priorityScore: 92
        }
      ];

      const application = mockApplications[applicationId];
      if (application) {
        console.log(`✅ Application ${applicationId} data loaded`);
        return application;
      }
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
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">Please connect your wallet to view your applications.</p>
      </div>
    );
  }

  if (loading || applicationsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading your applications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Applications</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
        <p className="text-muted-foreground">You haven't submitted any rental applications yet.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/properties'}>
          Browse Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Applications</h2>
          <p className="text-muted-foreground">Track the status of your rental applications</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {applications.length} Application{applications.length !== 1 ? 's' : ''}
        </Badge>
      </div>

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
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Move-in Date:</span>
                    <span>{application.moveInDate || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Property Owner:</span>
                    <span className="font-mono text-xs">{application.propertyOwner}</span>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;
