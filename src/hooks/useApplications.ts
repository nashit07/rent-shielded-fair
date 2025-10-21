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
        applications.push({
          id: applicationIds[index],
          propertyId: Number(data[0]),
          proposedRent: formatEther(BigInt(data[1])),
          creditScore: Number(data[2]),
          income: formatEther(BigInt(data[3])),
          applicationHash: data[4],
          moveInDate: new Date(Number(data[5]) * 1000).toISOString().split('T')[0],
          specialRequests: data[6],
          status: Number(data[7]),
          priorityScore: Number(data[8]),
          submittedAt: Number(data[9]),
          reviewedAt: Number(data[10]),
          propertyOwner: data[11],
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
