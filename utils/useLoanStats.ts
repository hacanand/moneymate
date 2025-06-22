import { useCallback, useEffect, useState } from "react";

export interface LoanStats {
  summary: {
    totalActiveLoans: number;
    totalPaidLoans: number;
    totalOverdueLoans: number;
    totalActiveLoanAmount: number;
    totalPaidLoanAmount: number;
    totalOverdueLoanAmount: number;
    totalInterestEarned: number;
    averageLoanAmount: number;
    repaymentRate: number;
    totalLoans: number;
  };
  monthlyData: Array<{
    month: string;
    loansGiven: number;
    totalAmount: number;
    paymentsReceived: number;
    paymentAmount: number;
  }>;
  interestTrends: Array<{
    month: string;
    totalInterest: number;
    activeLoans: number;
  }>;
  paymentHistory: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    amount: number;
    color: string;
  }>;
  topBorrowers: Array<{
    borrowerName: string;
    totalBorrowed: number;
    activeLoans: number;
    paidLoans: number;
    overdueLoans: number;
    totalLoans: number;
    repaymentRate: number;
    lastLoanDate: string;
  }>;
  upcomingPayments: Array<{
    id: string;
    borrowerName: string;
    amount: number;
    dueDate: string;
    isOverdue: boolean;
    daysOverdue: number;
    originalAmount: number;
    interestAmount: number;
  }>;
  recentActivity: {
    loansThisMonth: number;
    paymentsThisMonth: number;
    interestThisMonth: number;
  };
  fromCache?: boolean;
  lastUpdated?: string;
}

interface UseLoanStatsOptions {
  userId: string;
  timeframe?: string;
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
}

interface UseLoanStatsReturn {
  stats: LoanStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  lastUpdated: Date | null;
  isFromCache: boolean;
  cacheInfo: () => Promise<any>; // Function to get cache information
}

export function useLoanStats({
  userId,
  timeframe = "30d",
  refreshInterval = 5 * 60 * 1000, // 5 minutes default
  autoRefresh = false,
}: UseLoanStatsOptions): UseLoanStatsReturn {
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  const fetchStats = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!userId || userId.trim() === "") {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        if (!stats || forceRefresh) {
          setLoading(true);
        }

        const params = new URLSearchParams({
          userId: userId,
          timeframe,
          ...(forceRefresh && { refresh: "true" }),
        });

        // Use fetch with clerk session token automatically included
        const response = await fetch(`/api/loan-stats?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // This ensures Clerk auth cookies are sent with the request
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: LoanStats = await response.json();

        setStats(data);
        setIsFromCache(data.fromCache || false);
        setLastUpdated(
          data.lastUpdated ? new Date(data.lastUpdated) : new Date()
        );
      } catch (err) {
        console.error("Error fetching loan statistics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch loan statistics"
        );
      } finally {
        setLoading(false);
      }
    },
    [userId, timeframe]
  );

  const refreshStats = useCallback(async () => {
    await fetchStats(true);
  }, [fetchStats]);

  // Initial fetch
  useEffect(() => {
    if (userId && userId.trim() !== "") {
      fetchStats();
    }
  }, [userId, fetchStats]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !userId || userId.trim() === "") return;

    const interval = setInterval(() => {
      fetchStats(false); // Don't force refresh for auto-refresh
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, userId, refreshInterval, fetchStats]);

  // App state handling for React Native
  useEffect(() => {
    if (!autoRefresh || !userId || userId.trim() === "") return;

    let appStateListener: any;

    try {
      // Try to import AppState from react-native
      // This will only work in a React Native environment
      const { AppState } = require("react-native");

      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === "active" && userId) {
          // App became active, refresh if data is stale
          const now = new Date();
          if (!lastUpdated || now.getTime() - lastUpdated.getTime() > 60000) {
            fetchStats(false); // Refresh if it's been more than a minute
          }
        }
      };

      appStateListener = AppState.addEventListener(
        "change",
        handleAppStateChange
      );
    } catch (e) {
      // Not in React Native environment, ignore
      console.log("AppState not available, using only interval refresh");
    }

    return () => {
      if (appStateListener) {
        try {
          appStateListener.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [autoRefresh, userId, lastUpdated, fetchStats]);

  // Add a function to get cache information
  const getCacheInfo = useCallback(async () => {
    if (!userId || userId.trim() === "") return null;

    try {
      const params = new URLSearchParams({ userId });
      const response = await fetch(`/api/loan-stats?${params}`, {
        method: "OPTIONS",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Error fetching cache info:", err);
      return null;
    }
  }, [userId]);

  return {
    stats,
    loading,
    error,
    refreshStats,
    lastUpdated,
    isFromCache,
    cacheInfo: getCacheInfo,
  };
}

// Additional helper hooks for specific data
export function usePaymentTrends(userId: string) {
  const { stats, loading, error } = useLoanStats({ userId });

  return {
    trends: stats?.paymentHistory || [],
    interestTrends: stats?.interestTrends || [],
    loading,
    error,
  };
}

export function useLoanSummary(userId: string) {
  const { stats, loading, error, refreshStats } = useLoanStats({ userId });

  return {
    summary: stats?.summary || null,
    loading,
    error,
    refresh: refreshStats,
  };
}

export function useTopBorrowers(userId: string, limit: number = 5) {
  const { stats, loading, error } = useLoanStats({ userId });

  return {
    topBorrowers: stats?.topBorrowers.slice(0, limit) || [],
    loading,
    error,
  };
}

export function useUpcomingPayments(userId: string) {
  const { stats, loading, error, refreshStats } = useLoanStats({ userId });

  const overduePayments =
    stats?.upcomingPayments.filter((p) => p.isOverdue) || [];
  const duePayments = stats?.upcomingPayments.filter((p) => !p.isOverdue) || [];

  return {
    upcomingPayments: stats?.upcomingPayments || [],
    overduePayments,
    duePayments,
    totalOverdue: overduePayments.length,
    totalUpcoming: duePayments.length,
    loading,
    error,
    refresh: refreshStats,
  };
}
