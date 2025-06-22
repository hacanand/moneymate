"use client";

import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";
import { ActivityIndicator, FAB, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomAlert } from "../../components/CustomAlert";
import { LoanCard } from "../../components/LoanCard";
import { LoanTabs } from "../../components/LoanTabs";
import { SummaryCards } from "../../components/SummaryCards";
import type { Loan, LoanStatus } from "../../types/loan";

// Professional design constants - matching LoanCard design
const SCREEN_WIDTH = Dimensions.get("window").width;
const CONTENT_PADDING = 16;
const CARD_MARGIN = 16;
const BORDER_RADIUS = 16;
const FAB_MARGIN = 16;

export default function LoanListPage() {
  const theme = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const insets = useSafeAreaInsets();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();

  // State management
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loanTab, setLoanTab] = useState<"active" | "paid">("active");

  // Refs
  const scrollRef = useRef<ScrollView>(null);

  // Fetch real loans from API
  const fetchLoans = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const apiUrl = `/api/loans?userId=${user.id}`;
      console.log("Fetching loans for user:", user.id);
      const res = await fetch(apiUrl);
      const data = await res.json();
      console.log("Loans API response:", data);
      if (data.loans) {
        setLoans(data.loans);
      }
    } catch (err) {
      console.error("Failed to fetch loans", err);
      console.error("Failed to fetch loans", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (isUserLoaded && isSignedIn && user?.id) {
      fetchLoans();
    } else if (isUserLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [user?.id, isUserLoaded, isSignedIn]);

  // Refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  };

  // Function to calculate interest earned for a loan
  const calculateInterestEarned = (loan: Loan): number => {
    const principal = loan.amount;
    const interestRate = loan.interestRate / 100;
    // Use date as start date (since startDate is not in Loan type)
    const startDate = new Date(loan.startDate);
    const currentDate = new Date();
    // Calculate duration in days from loan start to now
    const durationInDays = Math.max(
      0,
      Math.ceil(
        (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    let interest = 0;
    if (loan.interestRateType === "yearly") {
      // Day-wise yearly interest
      interest = principal * interestRate * (durationInDays / 365);
    } else {
      // Day-wise monthly interest
      interest = principal * interestRate * (durationInDays / 30);
    }
    return interest;
  };

  // Calculate statistics
  const activeLoans = loans.filter((loan) => loan.status === "active");
  const paidLoans = loans.filter((loan) => loan.status === "paid");

  const totalActive = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalInterest = activeLoans.reduce(
    (sum, loan) => sum + calculateInterestEarned(loan),
    0
  );
  const paidLoansCount = paidLoans.length;

  const getStatusColor = (status: LoanStatus): string => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "paid":
        return "#2196F3";
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const renderLoanItem: ListRenderItem<Loan> = ({ item }) => (
    <LoanCard
      loan={item}
      onPress={() =>
        router.push({
          pathname: "/loan-details",
          params: { loan: JSON.stringify(item) },
        })
      }
      calculateInterestEarned={calculateInterestEarned}
      getStatusColor={getStatusColor}
      theme={theme}
    />
  );

  // Show loading state
  if (loading && loans.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Loading your loans...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header with Summary Cards */}
      <SummaryCards
        totalActive={totalActive}
        totalInterest={totalInterest}
        theme={theme}
      />

      {/* Tab Navigation */}
      <LoanTabs
        loanTab={loanTab}
        setLoanTab={setLoanTab}
        scrollRef={scrollRef}
        theme={theme}
      />

      {/* Main Content - Swipeable Loan Lists */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(
            e.nativeEvent.contentOffset.x /
              e.nativeEvent.layoutMeasurement.width
          );
          setLoanTab(page === 0 ? "active" : "paid");
        }}
        contentOffset={{
          x: loanTab === "active" ? 0 : SCREEN_WIDTH,
          y: 0,
        }}
        style={styles.pagesContainer}
      >
        {/* Active Loans Page */}
        <View style={[styles.pageContainer, { width: SCREEN_WIDTH }]}>
          <FlatList
            data={activeLoans}
            renderItem={renderLoanItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <View
                  style={[
                    styles.emptyStateIcon,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-remove"
                    size={48}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                <Text
                  style={[
                    styles.emptyStateTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  No Active Loans
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtitle,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Start by adding your first loan to track your lending activity
                </Text>
              </View>
            }
          />
        </View>

        {/* Paid Loans Page */}
        <View style={[styles.pageContainer, { width: SCREEN_WIDTH }]}>
          <FlatList
            data={paidLoans}
            renderItem={renderLoanItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <View
                  style={[
                    styles.emptyStateIcon,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-check"
                    size={48}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                <Text
                  style={[
                    styles.emptyStateTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  No Paid Loans
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtitle,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Completed loans will appear here once they're marked as paid
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + FAB_MARGIN,
          },
        ]}
        color={theme.colors.onPrimary}
        onPress={() => router.push("/add-loan")}
        label="Add Loan"
      />

      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: CONTENT_PADDING,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
  },

  // Loading state
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
    marginTop: 16,
    textAlign: "center",
  },

  // Pages and lists
  pagesContainer: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  listContainer: {
    padding: CONTENT_PADDING,
    paddingBottom: 100, // Extra space for FAB
  },

  // Empty states
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    lineHeight: 24,
  },

  // Floating Action Button
  fab: {
    position: "absolute",
    right: FAB_MARGIN,
    borderRadius: 28,
    elevation: 8,
  },
});
