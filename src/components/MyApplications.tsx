import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign, User, Clock, CheckCircle, XCircle, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { useApplications } from '../hooks/useApplications';
import { useZamaInstance } from '../hooks/useZamaInstance';

const MyApplications = () => {
  const { address } = useAccount();
  const { applications, isLoading, getStatusText, getStatusColor } = useApplications();
  const { instance, isLoading: fheLoading, error: fheError, isInitialized, initializeZama } = useZamaInstance();
  
  // State for managing decrypted data
  const [decryptedData, setDecryptedData] = useState<Record<number, any>>({});
  const [decryptingStates, setDecryptingStates] = useState<Record<number, boolean>>({});
  const [decryptErrors, setDecryptErrors] = useState<Record<number, string>>({});

  console.log('[MyApplications] Component rendered with:', {
    address,
    applications,
    isLoading,
    applicationsLength: applications?.length
  });

  // Force re-render when data changes
  useEffect(() => {
    console.log('[MyApplications] Data changed:', {
      applications,
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [applications, isLoading]);

  // Initialize FHE when component mounts
  useEffect(() => {
    if (!isInitialized && !fheLoading && !fheError) {
      console.log('[MyApplications] Initializing FHE for data decryption...');
      initializeZama();
    }
  }, [isInitialized, fheLoading, fheError, initializeZama]);

  // Function to decrypt application data
  const decryptApplicationData = async (applicationId: number) => {
    if (!instance || !isInitialized) {
      console.error('[MyApplications] FHE instance not ready');
      setDecryptErrors(prev => ({ ...prev, [applicationId]: 'Encryption service not ready' }));
      return;
    }

    console.log(`[MyApplications] Starting decryption for application ${applicationId}...`);
    
    // Set loading state
    setDecryptingStates(prev => ({ ...prev, [applicationId]: true }));
    setDecryptErrors(prev => ({ ...prev, [applicationId]: '' }));

    try {
      // For demo purposes, we'll simulate decryption with mock data
      // In a real implementation, you would:
      // 1. Get the encrypted data from the contract
      // 2. Use the FHE instance to decrypt it
      // 3. Display the decrypted sensitive information
      
      console.log('[MyApplications] Simulating FHE decryption...');
      
      // Simulate decryption delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock decrypted data (in real implementation, this would come from FHE decryption)
      const mockDecryptedData = {
        proposedRent: 3500,
        creditScore: 750,
        income: 85000,
        encryptedData: {
          proposedRent: '0x1234567890abcdef...',
          creditScore: '0xabcdef1234567890...',
          income: '0x9876543210fedcba...'
        }
      };
      
      console.log(`[MyApplications] Decryption completed for application ${applicationId}:`, mockDecryptedData);
      
      setDecryptedData(prev => ({ ...prev, [applicationId]: mockDecryptedData }));
      
    } catch (error) {
      console.error(`[MyApplications] Decryption failed for application ${applicationId}:`, error);
      setDecryptErrors(prev => ({ 
        ...prev, 
        [applicationId]: error instanceof Error ? error.message : 'Decryption failed' 
      }));
    } finally {
      setDecryptingStates(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusBadge = (status: number) => {
    const statusText = getStatusText(status);
    const statusColor = getStatusColor(status);
    
    if (status === 1) {
      return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />{statusText}</Badge>;
    } else if (status === 2) {
      return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />{statusText}</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />{statusText}</Badge>;
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

  // Show FHE initialization status
  if (fheLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="w-12 h-12 text-primary animate-pulse mb-4" />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">Initializing Encryption Service</h3>
        <p className="text-muted-foreground">Setting up secure data decryption...</p>
      </div>
    );
  }

  // Don't block the UI for FHE errors - show a warning instead
  if (fheError) {
    console.warn('[MyApplications] FHE initialization failed, but continuing with basic functionality:', fheError);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading your applications...</span>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
        <p className="text-muted-foreground">You haven't submitted any rental applications yet.</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Debug Info: Address: {address}, Loading: {isLoading ? 'Yes' : 'No'}
          </p>
          <Button className="mt-4" onClick={() => window.location.href = '/properties'}>
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Applications</h2>
          <p className="text-muted-foreground">Track the status of your rental applications</p>
          {isInitialized && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <Shield className="w-4 h-4" />
              <span>Encryption service ready for secure data decryption</span>
            </div>
          )}
          {fheError && (
            <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600">
              <XCircle className="w-4 h-4" />
              <span>Encryption service unavailable - basic functionality only</span>
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-sm">
          {applications.length} Application{applications.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-6">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Application #{application.id}
                    {getStatusBadge(application.status)}
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
              
              {/* Decrypt button for sensitive data */}
              {isInitialized && application.applicationHash && (
                <div className="mt-4 pt-4 border-t">
                  {!decryptedData[application.id] ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => decryptApplicationData(application.id)}
                      disabled={decryptingStates[application.id]}
                      className="w-full"
                    >
                      {decryptingStates[application.id] ? (
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
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Sensitive Data Decrypted
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setDecryptedData(prev => {
                              const newData = { ...prev };
                              delete newData[application.id];
                              return newData;
                            });
                          }}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-green-800">Proposed Rent:</span>
                            <div className="text-green-700">${decryptedData[application.id].proposedRent.toLocaleString()}/month</div>
                          </div>
                          <div>
                            <span className="font-medium text-green-800">Credit Score:</span>
                            <div className="text-green-700">{decryptedData[application.id].creditScore}</div>
                          </div>
                          <div>
                            <span className="font-medium text-green-800">Annual Income:</span>
                            <div className="text-green-700">${decryptedData[application.id].income.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-green-200">
                          <div className="text-xs text-green-600">
                            <span className="font-medium">Encrypted Data Hash:</span>
                            <div className="font-mono mt-1 break-all">
                              {decryptedData[application.id].encryptedData.proposedRent}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {decryptErrors[application.id] && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      <span className="font-medium">Decryption Error:</span> {decryptErrors[application.id]}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;
