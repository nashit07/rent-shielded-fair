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
      console.log('🚀 Starting FHE application encryption process...');
      console.log('📊 Input parameters:', data);
      console.log('🔗 Contract address:', contractAddress);
      console.log('👤 User address:', userAddress);

      // Validate input parameters
      if (!data.proposedRent || data.proposedRent <= 0) {
        throw new Error('Proposed rent must be positive');
      }
      if (!data.creditScore || data.creditScore < 300 || data.creditScore > 850) {
        throw new Error('Credit score must be between 300 and 850');
      }
      if (!data.income || data.income <= 0) {
        throw new Error('Income must be positive');
      }

      console.log('🔄 Step 1: Creating encrypted input...');
      const input = this.instance.createEncryptedInput(contractAddress, userAddress);
      
      console.log('🔄 Step 2: Adding proposed rent to encrypted input...');
      input.add32(BigInt(data.proposedRent));
      
      console.log('🔄 Step 3: Adding credit score to encrypted input...');
      input.add32(BigInt(data.creditScore));
      
      console.log('🔄 Step 4: Adding income to encrypted input...');
      input.add32(BigInt(data.income));
      
      console.log('🔄 Step 5: Encrypting data...');
      const encryptedInput = await input.encrypt();
      console.log('✅ Encryption completed, handles count:', encryptedInput.handles.length);

      // Convert handles to proper hex format
      const handles = encryptedInput.handles.map((handle: any) => this.convertHex(handle));
      const inputProof = `0x${Array.from(encryptedInput.inputProof)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;
      
      console.log('✅ Application data encrypted successfully');
      console.log('📋 Handles:', handles);
      console.log('🔐 Input proof length:', inputProof.length);
      
      return { handles, inputProof };
    } catch (error) {
      console.error('❌ Failed to encrypt application data:', error);
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
