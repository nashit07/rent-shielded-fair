import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign, User, Clock, CheckCircle, XCircle, Shield } from "lucide-react";
import { useApplications } from '../hooks/useApplications';
import { useZamaInstance } from '../hooks/useZamaInstance';

const MyApplications = () => {
  const { address } = useAccount();
  const { applications, isLoading, getStatusText, getStatusColor } = useApplications();
  const { instance, isLoading: fheLoading, error: fheError, isInitialized, initializeZama } = useZamaInstance();

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

  if (fheError) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Encryption Service Error</h3>
        <p className="text-muted-foreground mb-4">{fheError}</p>
        <Button onClick={initializeZama} variant="outline">
          Retry Initialization
        </Button>
      </div>
    );
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      console.log('[MyApplications] Decrypting application data...');
                      // Here you would implement the actual decryption logic
                      // using the FHE instance
                    }}
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Decrypt Sensitive Data
                  </Button>
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
