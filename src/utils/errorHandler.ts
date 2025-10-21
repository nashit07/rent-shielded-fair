// Global error handler for comprehensive error logging
export class ErrorHandler {
  static logError(context: string, error: any, additionalInfo?: any): void {
    console.error(`❌ ${context} failed:`, error);
    
    // Detailed error information
    console.error('📊 Error Details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      reason: error?.reason,
      cause: error?.cause,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Additional context information
    if (additionalInfo) {
      console.error('📋 Additional Context:', additionalInfo);
    }

    // Specific error type handling
    if (error instanceof Error) {
      console.error('🔍 Error Analysis:', {
        isNetworkError: error.message.includes('network') || error.message.includes('fetch'),
        isWalletError: error.message.includes('wallet') || error.message.includes('user rejected'),
        isContractError: error.message.includes('contract') || error.message.includes('revert'),
        isFHEError: error.message.includes('FHE') || error.message.includes('encrypt'),
        isTransactionError: error.message.includes('transaction') || error.message.includes('gas')
      });
    }

    // Provide specific guidance based on error type
    this.provideErrorGuidance(context, error);
  }

  static provideErrorGuidance(context: string, error: any): void {
    const errorMessage = error?.message || '';
    
    if (errorMessage.includes('User rejected')) {
      console.error('💡 User rejected the transaction. This is normal if the user cancels the wallet popup.');
    } else if (errorMessage.includes('Insufficient funds')) {
      console.error('💡 Insufficient funds. Please ensure your wallet has enough ETH for gas fees.');
    } else if (errorMessage.includes('Network error')) {
      console.error('💡 Network error detected. Check your internet connection and RPC endpoint.');
    } else if (errorMessage.includes('FHE') || errorMessage.includes('encrypt')) {
      console.error('💡 FHE encryption error. This might be due to FHE SDK initialization issues.');
      console.error('🔧 Try refreshing the page or checking FHE SDK configuration.');
    } else if (errorMessage.includes('contract')) {
      console.error('💡 Contract interaction error. Check contract address and ABI compatibility.');
    } else if (errorMessage.includes('wallet')) {
      console.error('💡 Wallet connection error. Try reconnecting your wallet.');
    }
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔄 ${context} - Attempt ${i + 1}/${maxRetries}`);
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${context} - Attempt ${i + 1} failed:`, error);
        
        if (i < maxRetries - 1) {
          const waitTime = delay * Math.pow(2, i); // Exponential backoff
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    console.error(`❌ ${context} failed after ${maxRetries} attempts`);
    this.logError(context, lastError);
    throw lastError;
  }

  static setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      this.logError('Unhandled Promise Rejection', event.reason);
      
      // Prevent default browser error handling for known issues
      if (this.shouldIgnoreError(event.reason)) {
        event.preventDefault();
        console.log('🔇 Ignored known extension conflict error');
      }
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('🚨 JavaScript Error:', event.error);
      this.logError('JavaScript Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Prevent default browser error handling for known issues
      if (this.shouldIgnoreError(event.error)) {
        event.preventDefault();
        console.log('🔇 Ignored known extension conflict error');
      }
    });

    // Handle React error boundaries
    window.addEventListener('error', (event) => {
      if (event.error?.componentStack) {
        console.error('🚨 React Component Error:', event.error);
        this.logError('React Component Error', event.error, {
          componentStack: event.error.componentStack
        });
      }
    });

    console.log('✅ Global error handlers initialized');
  }

  private static shouldIgnoreError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message || error.toString() || '';
    
    // Known browser extension conflicts
    const ignorePatterns = [
      'Unexpected error',
      'evmAsk.js',
      'contentScript.ts',
      'browser-ponyfill',
      'utils-',
      'Failed to load module script',
      'MIME type',
      'Strict MIME type checking',
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded'
    ];
    
    return ignorePatterns.some(pattern => message.includes(pattern));
  }
}

// Initialize global error handlers
ErrorHandler.setupGlobalErrorHandlers();
