"use client";

import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomAlert } from "../../components/CustomAlert";
import { LoanCard } from "../../components/LoanCard";
import { LoanTabs } from "../../components/LoanTabs";
import { SummaryCards } from "../../components/SummaryCards";
import type { Loan, LoanStatus } from "../../types/loan";

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock data for loans
// const initialLoans: Loan[] = [
//   {
//     id: "1",
//     borrowerName: "John Smith",
//     amount: 5000,
//     date: "2023-05-01",
//     dueDate: "2023-06-01",
//     status: "active",
//     interestRate: 5,
//     interestRateType: "monthly",
//   },
//   {
//     id: "2",
//     borrowerName: "Sarah Johnson",
//     amount: 2500,
//     date: "2023-04-15",
//     dueDate: "2023-05-15",
//     status: "active",
//     interestRate: 5,
//     interestRateType: "monthly",
//   },
//   {
//     id: "3",
//     borrowerName: "Michael Brown",
//     amount: 10000,
//     date: "2023-03-20",
//     dueDate: "2023-09-20",
//     status: "active",
//     interestRate: 6,
//     interestRateType: "yearly",
//   },
//   {
//     id: "4",
//     borrowerName: "Emily Davis",
//     amount: 1500,
//     date: "2023-04-10",
//     dueDate: "2023-05-10",
//     status: "paid",
//     interestRate: 4,
//     interestRateType: "monthly",
//   },
// ];

// Shared card/section padding for visual consistency
const cardPadding = 20;
const cardMargin = 16;

export default function LoanListPage() {
  const theme = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [loans, setLoans] = useState<Loan[]>([]); // Initialize with empty array
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [loanTab, setLoanTab] = useState<"active" | "paid">("active");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>("all");

  // Modal references
  const filterModalRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Fetch real loans from API on mount
  useEffect(() => {
    if (!user?.id) return; // Don't fetch loans if user is not available

    (async () => {
      try {
        let apiUrl = `/api/loans?userId=${user.id}`;
        if (
          typeof window !== "undefined" &&
          window.location &&
          window.location.hostname &&
          window.location.hostname !== "localhost"
        ) {
          // Use relative path for web, absolute for device if needed
          apiUrl = `/api/loans?userId=${user.id}`;
        }
        console.log("Fetching loans for user:", user.id);
        const res = await fetch(apiUrl);
        const data = await res.json();
        console.log("Loans API response:", data);
        if (data.loans) {
          setLoans(data.loans);
        }
      } catch (err) {
        // Optionally show error
        console.error("Failed to fetch loans", err);
      }
    })();
  }, [user?.id]);

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

  // Filter loans based on search query, status filter, and showPaidLoans toggle
  const filteredLoans = loans
    .filter((loan) =>
      loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((loan) => {
      if (statusFilter !== "all") {
        return loan.status === statusFilter;
      }
      // If showPaidLoans is false, only show active loans
      return loan.status === "active";
    });

  // Calculate total active loans amount
  const totalActive = loans
    .filter((loan) => loan.status === "active")
    .reduce((sum, loan) => sum + loan.amount, 0);

  // Calculate total interest earned on active loans
  const totalInterest = loans
    .filter((loan) => loan.status === "active")
    .reduce((sum, loan) => sum + calculateInterestEarned(loan), 0);

  // Count paid loans
  const paidLoansCount = loans.filter((loan) => loan.status === "paid").length;

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

  const onChangeSearch = (query: string): void => setSearchQuery(query);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SummaryCards
        totalActive={totalActive}
        totalInterest={totalInterest}
        theme={theme}
      />
      <LoanTabs
        loanTab={loanTab}
        setLoanTab={setLoanTab}
        scrollRef={scrollRef}
        theme={theme}
      />

      {/* Loan list with swipeable pages */}
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
          x: loanTab === "active" ? 0 : Dimensions.get("window").width,
          y: 0,
        }}
        style={{ flex: 1 }}
      >
        {/* Active Loans Page */}
        <View style={{ width: Dimensions.get("window").width }}>
          <FlatList
            data={loans.filter((loan) => loan.status === "active")}
            renderItem={renderLoanItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.loansList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="cash-remove"
                  size={64}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No active loans
                </Text>
              </View>
            }
          />
        </View>
        {/* Paid Loans Page */}
        <View style={{ width: Dimensions.get("window").width }}>
          <FlatList
            data={loans.filter((loan) => loan.status === "paid")}
            renderItem={renderLoanItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.loansList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="cash-check"
                  size={64}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No paid loans
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <Button
        mode="contained"
        onPress={() => router.push("/add-loan")}
        style={{ margin: 16 }}
      >
        Add New Loan
      </Button>

      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    padding: 8,
  },
  summaryContainer: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  summaryAmount: {
    fontSize: 24,
    fontFamily: "Roboto-Bold",
  },
  loansList: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 80,
  },
  loanCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  statusChip: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusChipText: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Medium",
    fontSize: 12,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cardAmountDateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 12,
  },
  cardDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
    gap: 8,
    minHeight: 48,
  },
  cardDetailCol: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    minWidth: 0,
    minHeight: 48,
  },
  cardDetailColRight: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 0,
    minHeight: 48,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
  },
  detailUnit: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    color: "#888",
    marginLeft: 2,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  loanAmountOld: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    marginTop: 4,
  },
  loanDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailText: {
    fontFamily: "Roboto-Regular",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
  },
  modal: {
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  addLoanModal: {
    height: 550,
    width: SCREEN_WIDTH - 40,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
  },
  filterOptions: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
    marginBottom: 10,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedChip: {
    backgroundColor: "#2E7D32",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#2E7D32",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#2E7D32",
  },
  buttonLabel: {
    fontFamily: "Roboto-Medium",
  },
  addLoanForm: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  dateContainer: {
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Roboto-Medium",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginTop: 8,
  },
  interestRateTypeContainer: {
    marginBottom: 12,
  },
  methodOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  methodChip: {
    margin: 4,
  },
  loanTabChipsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  loanTabChip: {
    marginHorizontal: 4,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  selectedLoanTabChip: {
    backgroundColor: "#2E7D32",
  },
  borrowerName: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    flexShrink: 1,
    marginRight: 8,
  },
  loanAmount: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    marginRight: 8,
  },
  loanDate: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    alignSelf: "flex-end",
  },
  selectedChipText: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Medium",
    fontSize: 14,
  },
});
