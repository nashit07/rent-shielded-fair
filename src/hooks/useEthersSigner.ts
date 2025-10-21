import { useAccount, useWalletClient } from 'wagmi';
import { useEffect, useState } from 'react';

export const useEthersSigner = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [signerPromise, setSignerPromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    if (walletClient) {
      const promise = Promise.resolve(walletClient);
      setSignerPromise(promise);
    }
  }, [walletClient]);

  return signerPromise;
};
