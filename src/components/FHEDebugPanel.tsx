import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useAccount } from 'wagmi';

interface FHEDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FHEDebugPanel = ({ isOpen, onClose }: FHEDebugPanelProps) => {
  const { instance, isLoading, error, isInitialized, initializeZama } = useZamaInstance();
  const { address, isConnected } = useAccount();
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (isInitialized) {
      addLog('✅ FHE instance initialized successfully');
    }
    if (error) {
      addLog(`❌ FHE initialization error: ${error}`);
    }
  }, [isInitialized, error]);

  const testFHEEncryption = async () => {
    if (!instance || !address) {
      addLog('❌ Missing FHE instance or wallet connection');
      return;
    }

    try {
      addLog('🚀 Starting FHE encryption test...');
      
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      addLog(`🔗 Contract address: ${contractAddress}`);
      addLog(`👤 User address: ${address}`);

      // Test data
      const testData = {
        proposedRent: 2500,
        creditScore: 750,
        income: 80000
      };

      addLog('📊 Test data:', testData);

      // Create encrypted input
      addLog('🔄 Creating encrypted input...');
      const input = instance.createEncryptedInput(contractAddress, address);
      
      addLog('🔄 Adding test data to encrypted input...');
      input.add32(BigInt(testData.proposedRent));
      input.add32(BigInt(testData.creditScore));
      input.add32(BigInt(testData.income));
      
      addLog('🔄 Encrypting data...');
      const encryptedInput = await input.encrypt();
      
      addLog(`✅ Encryption completed! Handles count: ${encryptedInput.handles.length}`);
      addLog(`🔐 Input proof length: ${encryptedInput.inputProof.length}`);
      
      // Convert handles for display
      const convertHex = (handle: any): string => {
        if (typeof handle === 'string') {
          return handle.startsWith('0x') ? handle : `0x${handle}`;
        } else if (handle instanceof Uint8Array) {
          return `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
        } else if (Array.isArray(handle)) {
          return `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
        }
        return `0x${handle.toString()}`;
      };

      const handles = encryptedInput.handles.map(convertHex);
      addLog(`📋 Handle 1 (proposedRent): ${handles[0]?.substring(0, 20)}...`);
      addLog(`📋 Handle 2 (creditScore): ${handles[1]?.substring(0, 20)}...`);
      addLog(`📋 Handle 3 (income): ${handles[2]?.substring(0, 20)}...`);
      
      addLog('🎉 FHE encryption test completed successfully!');
      
    } catch (err) {
      addLog(`❌ FHE encryption test failed: ${err}`);
      console.error('FHE encryption test error:', err);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">FHE Debug Panel</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogs(!showLogs)}
              >
                {showLogs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showLogs ? 'Hide' : 'Show'} Logs
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {isInitialized ? '✅' : isLoading ? '⏳' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">FHE Instance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {isConnected ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">Wallet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {instance ? '✅' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground">Instance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {error ? '❌' : '✅'}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">FHE Initialization Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={initializeZama}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Initializing...' : 'Reinitialize FHE'}
            </Button>
            <Button
              onClick={testFHEEncryption}
              disabled={!instance || !isConnected}
              variant="outline"
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              Test Encryption
            </Button>
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
            >
              Clear Logs
            </Button>
          </div>

          {/* Logs Display */}
          {showLogs && (
            <Card className="p-4 bg-gray-50 border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Debug Logs</h4>
                <Badge variant="secondary">{logs.length} entries</Badge>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No logs yet. Try testing encryption.</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono bg-white p-2 rounded border">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* Environment Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Environment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Contract Address:</strong>
                <br />
                <code className="text-xs">{import.meta.env.VITE_CONTRACT_ADDRESS}</code>
              </div>
              <div>
                <strong>Chain ID:</strong>
                <br />
                <code className="text-xs">{import.meta.env.VITE_CHAIN_ID}</code>
              </div>
              <div>
                <strong>User Address:</strong>
                <br />
                <code className="text-xs">{address || 'Not connected'}</code>
              </div>
              <div>
                <strong>FHE Status:</strong>
                <br />
                <Badge variant={isInitialized ? 'default' : 'destructive'}>
                  {isInitialized ? 'Ready' : 'Not Ready'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};
