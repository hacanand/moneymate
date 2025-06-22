import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../utils/db";
import {
  createStatsKey,
  isCacheExpired,
  loansCache,
  paymentsCache,
  statsCache,
  wrapWithTimestamp,
} from "../../utils/lru-cache";

// Define response type for the API
interface LoanStatsResponse {
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
    lastLoanDate: Date;
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

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers or query params
    // Since we're in a client-side context, we'll get the userId from the request
    const url = new URL(request.url);
    const userId =
      url.searchParams.get("userId") || request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const timeframe = url.searchParams.get("timeframe") || "30d";
    const forceRefresh = url.searchParams.get("refresh") === "true";

    // Set appropriate cache TTL based on timeframe
    const ttl =
      timeframe === "7d"
        ? 2 * 60 * 1000 // 2 minutes for short timeframes
        : timeframe === "30d"
        ? 5 * 60 * 1000 // 5 minutes for medium timeframes
        : 15 * 60 * 1000; // 15 minutes for longer timeframes

    // Check cache first
    const cacheKey = createStatsKey(userId, timeframe);
    const cachedStats = statsCache.get(cacheKey);

    if (!forceRefresh && cachedStats && !isCacheExpired(cachedStats, ttl)) {
      return NextResponse.json({
        ...cachedStats.data,
        fromCache: true,
        lastUpdated: new Date(cachedStats.timestamp).toISOString(),
      });
    }

    console.log(`Fetching fresh loan stats for user: ${userId}`);

    // Get all loans for the user using Prisma
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: {
        payments: true,
      },
    });

    // Define a type for the payment with loanId
    interface PaymentWithLoanId {
      id: string;
      loanId: string;
      amount: number;
      date: Date;
      method: string | null;
      notes: string | null;
    }

    // Flatten payments for easier processing
    const payments: PaymentWithLoanId[] = loans.flatMap((loan) =>
      loan.payments.map((payment) => ({
        ...payment,
        loanId: loan.id,
      }))
    );

    // Calculate summary statistics
    const activeLoans = loans.filter((loan) => loan.status === "active");
    const paidLoans = loans.filter((loan) => loan.status === "paid");
    const overdueLoans = loans.filter((loan) => {
      if (loan.status !== "active") return false;
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(loan.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return daysSinceStart > 30; // Assuming 30 days is overdue threshold
    });

    const totalActiveLoanAmount = activeLoans.reduce(
      (sum, loan) => sum + loan.amount,
      0
    );
    const totalPaidLoanAmount = paidLoans.reduce(
      (sum, loan) => sum + loan.amount,
      0
    );
    const totalOverdueLoanAmount = overdueLoans.reduce(
      (sum, loan) => sum + loan.amount,
      0
    );

    // Calculate interest earned
    const calculateInterest = (loan: {
      amount: number;
      interestRate: number;
      interestRateType: string;
      startDate: Date;
      paidDate?: Date | null;
    }): number => {
      const principal = loan.amount;
      const interestRate = loan.interestRate / 100;
      const startDate = new Date(loan.startDate);
      const endDate = loan.paidDate ? new Date(loan.paidDate) : new Date();
      const durationInDays = Math.max(
        0,
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );

      if (loan.interestRateType === "yearly") {
        return principal * interestRate * (durationInDays / 365);
      } else {
        return principal * interestRate * (durationInDays / 30);
      }
    };

    const totalInterestEarned = loans.reduce(
      (sum, loan) => sum + calculateInterest(loan),
      0
    );
    const averageLoanAmount =
      loans.length > 0
        ? loans.reduce((sum, loan) => sum + loan.amount, 0) / loans.length
        : 0;
    const repaymentRate =
      loans.length > 0 ? (paidLoans.length / loans.length) * 100 : 0;

    // Monthly trends (last 12 months)
    const monthlyData = [];
    const interestTrends = [];
    const paymentHistory = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthLoans = loans.filter((loan) => {
        const loanDate = new Date(loan.startDate);
        return loanDate >= monthStart && loanDate <= monthEnd;
      });

      const monthPayments = payments.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

      const monthInterest = monthLoans.reduce(
        (sum, loan) => sum + calculateInterest(loan),
        0
      );
      const monthPaymentAmount = monthPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      monthlyData.push({
        month: monthStart.toISOString(),
        loansGiven: monthLoans.length,
        totalAmount: monthLoans.reduce((sum, loan) => sum + loan.amount, 0),
        paymentsReceived: monthPayments.length,
        paymentAmount: monthPaymentAmount,
      });

      interestTrends.push({
        month: monthStart.toISOString(),
        totalInterest: monthInterest,
        activeLoans: monthLoans.filter((loan) => loan.status === "active")
          .length,
      });

      if (monthPaymentAmount > 0) {
        paymentHistory.push({
          date: monthStart.toISOString(),
          amount: monthPaymentAmount,
          count: monthPayments.length,
        });
      }
    }

    // Last 7 days payment activity
    const last7DaysPayments = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const dayPayments = payments.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= dayStart && paymentDate < dayEnd;
      });

      last7DaysPayments.push({
        date: dayStart.toISOString(),
        amount: dayPayments.reduce((sum, payment) => sum + payment.amount, 0),
        count: dayPayments.length,
      });
    }

    // Status distribution for pie chart
    const statusDistribution = [
      {
        status: "Active",
        count: activeLoans.length,
        amount: totalActiveLoanAmount,
        color: "#4CAF50",
      },
      {
        status: "Paid",
        count: paidLoans.length,
        amount: totalPaidLoanAmount,
        color: "#2196F3",
      },
      {
        status: "Overdue",
        count: overdueLoans.length,
        amount: totalOverdueLoanAmount,
        color: "#F44336",
      },
    ].filter((item) => item.count > 0);

    // Top borrowers
    interface BorrowerStat {
      borrowerName: string;
      totalBorrowed: number;
      activeLoans: number;
      paidLoans: number;
      overdueLoans: number;
      lastLoanDate: Date;
    }

    const borrowerStats: Record<string, BorrowerStat> = loans.reduce(
      (acc: Record<string, BorrowerStat>, loan) => {
        if (!acc[loan.borrowerName]) {
          acc[loan.borrowerName] = {
            borrowerName: loan.borrowerName,
            totalBorrowed: 0,
            activeLoans: 0,
            paidLoans: 0,
            overdueLoans: 0,
            lastLoanDate: loan.startDate,
          };
        }

        acc[loan.borrowerName].totalBorrowed += loan.amount;

        if (loan.status === "active") acc[loan.borrowerName].activeLoans++;
        else if (loan.status === "paid") acc[loan.borrowerName].paidLoans++;
        else if (
          overdueLoans.some((ol) => ol.id.toString() === loan.id.toString())
        ) {
          acc[loan.borrowerName].overdueLoans++;
        }

        if (
          new Date(loan.startDate) >
          new Date(acc[loan.borrowerName].lastLoanDate)
        ) {
          acc[loan.borrowerName].lastLoanDate = loan.startDate;
        }

        return acc;
      },
      {}
    );

    const topBorrowers = Object.values(borrowerStats)
      .map((borrower) => ({
        ...borrower,
        totalLoans:
          borrower.activeLoans + borrower.paidLoans + borrower.overdueLoans,
        repaymentRate:
          borrower.paidLoans > 0
            ? (borrower.paidLoans /
                (borrower.activeLoans +
                  borrower.paidLoans +
                  borrower.overdueLoans)) *
              100
            : 0,
      }))
      .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
      .slice(0, 10);

    // Upcoming payments (loans that should be paid soon)
    const upcomingPayments = activeLoans
      .map((loan) => {
        const daysSinceStart = Math.floor(
          (Date.now() - new Date(loan.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const expectedPaymentDate = new Date(loan.startDate);
        expectedPaymentDate.setDate(expectedPaymentDate.getDate() + 30); // Assuming monthly payments

        return {
          id: loan.id,
          borrowerName: loan.borrowerName,
          amount: loan.amount + calculateInterest(loan),
          dueDate: expectedPaymentDate.toISOString(),
          isOverdue: daysSinceStart > 30,
          daysOverdue: Math.max(0, daysSinceStart - 30),
          originalAmount: loan.amount,
          interestAmount: calculateInterest(loan),
        };
      })
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

    const stats: LoanStatsResponse = {
      summary: {
        totalActiveLoans: activeLoans.length,
        totalPaidLoans: paidLoans.length,
        totalOverdueLoans: overdueLoans.length,
        totalActiveLoanAmount,
        totalPaidLoanAmount,
        totalOverdueLoanAmount,
        totalInterestEarned,
        averageLoanAmount,
        repaymentRate,
        totalLoans: loans.length,
      },
      monthlyData,
      interestTrends,
      paymentHistory: last7DaysPayments,
      statusDistribution,
      topBorrowers,
      upcomingPayments,
      recentActivity: {
        loansThisMonth: monthlyData[monthlyData.length - 1]?.loansGiven || 0,
        paymentsThisMonth:
          monthlyData[monthlyData.length - 1]?.paymentsReceived || 0,
        interestThisMonth:
          interestTrends[interestTrends.length - 1]?.totalInterest || 0,
      },
    };

    // Cache the results with appropriate TTL based on timeframe
    statsCache.set(cacheKey, wrapWithTimestamp(stats));

    // Return the data with metadata
    return NextResponse.json({
      ...stats,
      fromCache: false,
      lastUpdated: new Date().toISOString(),
      cacheInfo: {
        cacheKey,
        ttl,
        stats: statsCache.getStats(),
      },
    });
  } catch (error) {
    console.error("Error fetching loan statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper API route to get cache information
export async function OPTIONS(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId =
      url.searchParams.get("userId") || request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const cacheInfo = {
      statsCache: statsCache.getStats(),
      loansCache: loansCache.getStats(),
      paymentsCache: paymentsCache.getStats(),
      keys: {
        stats: statsCache.keys().slice(0, 10), // Show first 10 keys only
      },
      userId: userId,
    };

    return NextResponse.json(cacheInfo);
  } catch (error) {
    console.error("Error getting cache info:", error);
    return NextResponse.json(
      { error: "Failed to get cache information" },
      { status: 500 }
    );
  }
}
