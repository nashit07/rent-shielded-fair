import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

// FHE utility functions for RentShieldedFair
export class FHEManager {
  private instance: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized && this.instance) {
      return this.instance;
    }

    try {
      await initSDK();
      this.instance = await createInstance(SepoliaConfig);
      this.isInitialized = true;
      console.log('FHE Manager initialized successfully');
      return this.instance;
    } catch (error) {
      console.error('Failed to initialize FHE Manager:', error);
      throw error;
    }
  }

  private convertHex(handle: any): string {
    if (typeof handle === 'string') {
      return handle.startsWith('0x') ? handle : `0x${handle}`;
    } else if (handle instanceof Uint8Array) {
      return `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    } else if (Array.isArray(handle)) {
      return `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }
    return `0x${handle.toString()}`;
  }

  // Property data is now public, no encryption needed
  // Use regular contract calls for property listing

  // Encrypt application data
  async encryptApplicationData(
    contractAddress: string,
    userAddress: string,
    data: {
      proposedRent: number;
      creditScore: number;
      income: number;
    }
  ): Promise<{ handles: string[]; inputProof: string }> {
    if (!this.isInitialized || !this.instance) {
      throw new Error('FHE Manager not initialized');
    }

    try {
      console.log('Encrypting application data:', data);
      
      const input = this.instance.createEncryptedInput(contractAddress, userAddress);
      input.add32(BigInt(data.proposedRent));
      input.add32(BigInt(data.creditScore));
      input.add32(BigInt(data.income));
      
      const encryptedInput = await input.encrypt();
      
      const handles = encryptedInput.handles.map((handle: any) => this.convertHex(handle));
      const inputProof = `0x${Array.from(encryptedInput.inputProof)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;
      
      console.log('Application data encrypted successfully');
      return { handles, inputProof };
    } catch (error) {
      console.error('Failed to encrypt application data:', error);
      throw error;
    }
  }

  // Encrypt agreement data
  async encryptAgreementData(
    contractAddress: string,
    userAddress: string,
    data: {
      monthlyRent: number;
      securityDeposit: number;
      leaseDuration: number;
    }
  ): Promise<{ handles: string[]; inputProof: string }> {
    if (!this.isInitialized || !this.instance) {
      throw new Error('FHE Manager not initialized');
    }

    try {
      console.log('Encrypting agreement data:', data);
      
      const input = this.instance.createEncryptedInput(contractAddress, userAddress);
      input.add32(BigInt(data.monthlyRent));
      input.add32(BigInt(data.securityDeposit));
      input.add32(BigInt(data.leaseDuration));
      
      const encryptedInput = await input.encrypt();
      
      const handles = encryptedInput.handles.map((handle: any) => this.convertHex(handle));
      const inputProof = `0x${Array.from(encryptedInput.inputProof)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;
      
      console.log('Agreement data encrypted successfully');
      return { handles, inputProof };
    } catch (error) {
      console.error('Failed to encrypt agreement data:', error);
      throw error;
    }
  }

  // Encrypt payment data
  async encryptPaymentData(
    contractAddress: string,
    userAddress: string,
    data: {
      amount: number;
      month: number;
      year: number;
    }
  ): Promise<{ handles: string[]; inputProof: string }> {
    if (!this.isInitialized || !this.instance) {
      throw new Error('FHE Manager not initialized');
    }

    try {
      console.log('Encrypting payment data:', data);
      
      const input = this.instance.createEncryptedInput(contractAddress, userAddress);
      input.add32(BigInt(data.amount));
      input.add32(BigInt(data.month));
      input.add32(BigInt(data.year));
      
      const encryptedInput = await input.encrypt();
      
      const handles = encryptedInput.handles.map((handle: any) => this.convertHex(handle));
      const inputProof = `0x${Array.from(encryptedInput.inputProof)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;
      
      console.log('Payment data encrypted successfully');
      return { handles, inputProof };
    } catch (error) {
      console.error('Failed to encrypt payment data:', error);
      throw error;
    }
  }

  // Decrypt encrypted data
  async decryptData(
    handleContractPairs: Array<{ handle: string; contractAddress: string }>
  ): Promise<Record<string, any>> {
    if (!this.isInitialized || !this.instance) {
      throw new Error('FHE Manager not initialized');
    }

    try {
      console.log('Decrypting data:', handleContractPairs);
      
      const result = await this.instance.userDecrypt(handleContractPairs);
      
      console.log('Data decrypted successfully');
      return result;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  getInstance() {
    return this.instance;
  }
}

// Singleton instance
export const fheManager = new FHEManager();
