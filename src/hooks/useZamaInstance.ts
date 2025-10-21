import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeZama = async () => {
    if (isLoading || isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('[FHE] Starting Zama instance initialization...');
      
      // Check if ethereum provider is available
      if (!(window as any).ethereum) {
        console.warn('[FHE] Ethereum provider not found');
        throw new Error('Ethereum provider not found');
      }

      console.log('[FHE] Initializing SDK...');
      await initSDK();
      console.log('[FHE] SDK initialized successfully');

      const config = {
        ...SepoliaConfig,
        network: (window as any).ethereum
      };

      console.log('[FHE] Creating instance with config:', config);
      const zamaInstance = await createInstance(config);
      console.log('[FHE] Instance created successfully');
      
      setInstance(zamaInstance);
      setIsInitialized(true);
      console.log('[FHE] Zama instance fully initialized');

    } catch (err) {
      console.error('[FHE] Failed to initialize Zama instance:', err);
      setError('Failed to initialize encryption service. Please ensure you have a wallet connected.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeZama();
  }, []);

  return {
    instance,
    isLoading,
    error,
    isInitialized,
    initializeZama
  };
}
