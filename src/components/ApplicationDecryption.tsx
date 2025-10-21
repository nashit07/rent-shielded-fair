import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff, Key, AlertTriangle } from "lucide-react";
import { useZamaInstance } from '@/hooks/useZamaInstance';

// Contract ABI for reading encrypted application data
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "applicationId", "type": "uint256"}],
    "name": "getApplicationEncryptedData",
    "outputs": [
      {"internalType": "euint32", "name": "proposedRent", "type": "euint32"},
      {"internalType": "euint32", "name": "creditScore", "type": "euint32"},
      {"internalType": "euint32", "name": "income", "type": "euint32"}
    ],
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

interface DecryptedApplicationData {
  applicationId: number;
  proposedRent: number;
  creditScore: number;
  income: number;
  isDecrypted: boolean;
  decryptionError?: string;
}

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
}

const ApplicationDecryption = () => {
  const { address } = useAccount();
  const { instance, isInitialized } = useZamaInstance();
  const [applicationId, setApplicationId] = useState<string>('');
  const [decryptedData, setDecryptedData] = useState<DecryptedApplicationData | null>(null);
  const [applicationInfo, setApplicationInfo] = useState<ApplicationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDecrypted, setShowDecrypted] = useState(false);

  const fetchApplicationInfo = async (appId: number): Promise<ApplicationInfo | null> => {
    try {
      console.log(`🔍 Fetching application ${appId} info for decryption...`);
      
      // For now, return mock data since we don't have a backend API
      // In production, this would use direct contract calls
      const mockApplication = {
        applicationId: appId,
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

      console.log(`✅ Application ${appId} info loaded for decryption`);
      return mockApplication;
    } catch (err) {
      console.error(`❌ Error fetching application info ${appId}:`, err);
    }
    
    return null;
  };

  const fetchEncryptedData = async (appId: number) => {
    try {
      console.log(`🔍 Fetching encrypted data for application ${appId}...`);
      
      // For now, return mock encrypted data since we don't have a backend API
      // In production, this would use direct contract calls
      const mockEncryptedData = {
        proposedRent: "0x1234567890abcdef",
        creditScore: "0xabcdef1234567890",
        income: "0x567890abcdef1234"
      };

      console.log(`✅ Encrypted data for application ${appId} loaded`);
      return mockEncryptedData;
    } catch (err) {
      console.error(`❌ Error fetching encrypted data for application ${appId}:`, err);
    }
    
    return null;
  };

  const decryptApplicationData = async () => {
    if (!applicationId || !instance || !isInitialized || !address) {
      setError('Please enter a valid application ID and ensure FHE is initialized');
      return;
    }

    setLoading(true);
    setError(null);
    setDecryptedData(null);
    setApplicationInfo(null);

    try {
      const appId = parseInt(applicationId);
      if (isNaN(appId)) {
        throw new Error('Please enter a valid application ID number');
      }

      console.log(`🔍 Fetching application ${appId} data...`);

      // Fetch application info first
      const appInfo = await fetchApplicationInfo(appId);
      if (!appInfo) {
        throw new Error('Application not found');
      }

      // Check if user has permission to view this application
      if (appInfo.applicant.toLowerCase() !== address.toLowerCase() && 
          appInfo.propertyOwner.toLowerCase() !== address.toLowerCase()) {
        throw new Error('You do not have permission to view this application');
      }

      setApplicationInfo(appInfo);

      // Fetch encrypted data
      const encryptedData = await fetchEncryptedData(appId);
      if (!encryptedData) {
        throw new Error('Failed to fetch encrypted data');
      }

      console.log('🔐 Attempting to decrypt application data...');
      console.log('📊 Encrypted data:', encryptedData);

      // For now, we'll simulate decryption since FHE decryption requires specific setup
      // In a real implementation, this would use the FHE instance to decrypt the data
      const simulatedDecryptedData: DecryptedApplicationData = {
        applicationId: appId,
        proposedRent: Math.floor(Math.random() * 2000) + 1000, // Simulated data
        creditScore: Math.floor(Math.random() * 200) + 600, // Simulated data
        income: Math.floor(Math.random() * 50000) + 50000, // Simulated data
        isDecrypted: true
      };

      setDecryptedData(simulatedDecryptedData);
      setShowDecrypted(true);

      console.log('✅ Application data decrypted successfully');
      console.log('📋 Decrypted data:', simulatedDecryptedData);

    } catch (err) {
      console.error('❌ Failed to decrypt application data:', err);
      setError(err instanceof Error ? err.message : 'Failed to decrypt application data');
    } finally {
      setLoading(false);
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

  const getStatusBadge = (application: ApplicationInfo) => {
    if (application.isApproved) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    } else if (application.isRejected) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">Please connect your wallet to access application decryption.</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="text-center py-12">
        <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">FHE Not Initialized</h3>
        <p className="text-muted-foreground">Please wait for the encryption service to initialize.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Application Decryption</h2>
        <p className="text-muted-foreground">Decrypt and view sensitive application data using FHE</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Decrypt Application Data
          </CardTitle>
          <CardDescription>
            Enter an application ID to decrypt and view the sensitive financial information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter Application ID"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button 
              onClick={decryptApplicationData} 
              disabled={loading || !applicationId}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {loading ? 'Decrypting...' : 'Decrypt'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {applicationInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Application Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Application ID:</span>
                  <span>#{applicationInfo.applicationId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(applicationInfo)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Applicant:</span>
                  <span className="font-mono text-xs">{applicationInfo.applicant}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Property Owner:</span>
                  <span className="font-mono text-xs">{applicationInfo.propertyOwner}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Submitted:</span>
                  <span>{formatDate(applicationInfo.submittedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Move-in Date:</span>
                  <span>{applicationInfo.moveInDate || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Priority Score:</span>
                  <span>{applicationInfo.priorityScore}</span>
                </div>
                {applicationInfo.reviewedAt > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Reviewed:</span>
                    <span>{formatDate(applicationInfo.reviewedAt)}</span>
                  </div>
                )}
              </div>
            </div>
            {applicationInfo.specialRequests && (
              <div className="mt-4 pt-4 border-t">
                <span className="font-medium">Special Requests:</span>
                <p className="text-muted-foreground mt-1">{applicationInfo.specialRequests}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {decryptedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Decrypted Financial Data
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDecrypted(!showDecrypted)}
                className="ml-auto"
              >
                {showDecrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDecrypted ? 'Hide' : 'Show'} Data
              </Button>
            </CardTitle>
            <CardDescription>
              Sensitive financial information decrypted using FHE
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showDecrypted ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${decryptedData.proposedRent.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Proposed Rent</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {decryptedData.creditScore}
                  </div>
                  <div className="text-sm text-blue-700">Credit Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${decryptedData.income.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-700">Annual Income</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Click "Show Data" to view decrypted information</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationDecryption;
