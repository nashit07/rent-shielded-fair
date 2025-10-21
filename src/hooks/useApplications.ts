import { useReadContract, useReadContracts } from 'wagmi';
import { useAccount } from 'wagmi';
import { RentShieldedFairABI } from '../lib/contract';
import { formatEther } from 'viem';

export interface ApplicationData {
  id: number;
  propertyId: number;
  proposedRent: string;
  creditScore: number;
  income: string;
  applicationHash: string;
  moveInDate: string;
  specialRequests: string;
  status: number;
  priorityScore: number;
  submittedAt: number;
  reviewedAt: number;
  propertyOwner: string;
}

export function useApplications() {
  const { address } = useAccount();

  // Get user's application IDs
  const { data: userApplications, isLoading: isLoadingApplications } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: RentShieldedFairABI,
    functionName: 'getUserApplications',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  // Get detailed application info for each application
  const applicationIds = userApplications || [];
  const contractCalls = applicationIds.map((id: number) => ({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: RentShieldedFairABI,
    functionName: 'getDetailedApplicationInfo',
    args: [id],
  }));

  const { data: applicationsData, isLoading: isLoadingDetails } = useReadContracts({
    contracts: contractCalls,
    query: {
      enabled: applicationIds.length > 0,
    },
  });

  const applications: ApplicationData[] = [];

  if (applicationsData && applicationsData.length > 0) {
    applicationsData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const data = result.result as any[];
        console.log(`📊 Processing application ${applicationIds[index]} data:`, data);
        
        // Map contract data to our interface
        // Contract returns: [isApproved, isRejected, applicationHash, moveInDate, specialRequests, applicant, propertyOwner, submittedAt, reviewedAt, priorityScore]
        const isApproved = data[0];
        const isRejected = data[1];
        const applicationHash = data[2];
        const moveInDate = data[3];
        const specialRequests = data[4];
        const applicant = data[5];
        const propertyOwner = data[6];
        const submittedAt = Number(data[7]);
        const reviewedAt = Number(data[8]);
        const priorityScore = Number(data[9]);
        
        // Determine status: 0 = pending, 1 = approved, 2 = rejected
        let status = 0; // pending
        if (isApproved) status = 1;
        else if (isRejected) status = 2;
        
        applications.push({
          id: applicationIds[index],
          propertyId: 0, // Not available in this contract function
          proposedRent: "0", // Not available in this contract function
          creditScore: 0, // Not available in this contract function
          income: "0", // Not available in this contract function
          applicationHash: applicationHash,
          moveInDate: moveInDate,
          specialRequests: specialRequests,
          status: status,
          priorityScore: priorityScore,
          submittedAt: submittedAt,
          reviewedAt: reviewedAt,
          propertyOwner: propertyOwner,
        });
      }
    });
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-yellow-600';
      case 1: return 'text-green-600';
      case 2: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return {
    applications,
    isLoading: isLoadingApplications || isLoadingDetails,
    getStatusText,
    getStatusColor,
  };
}
