"use client";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from "react-native";
import Modal from "react-native-modalbox";
import {
  Button,
  Card,
  Chip,
  FAB,
  Searchbar,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import type { Loan, LoanStatus } from "../../types/loan";
// Import the useCustomAlert hook
import * as Animatable from "react-native-animatable";
import { Path, Svg } from "react-native-svg";
import { useCustomAlert } from "../../components/CustomAlert";

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock data for loans
const initialLoans: Loan[] = [
  {
    id: "1",
    borrowerName: "John Smith",
    amount: 5000,
    date: "2023-05-01",
    dueDate: "2023-06-01",
    status: "active",
    interestRate: 5,
    interestRateType: "monthly",
  },
  {
    id: "2",
    borrowerName: "Sarah Johnson",
    amount: 2500,
    date: "2023-04-15",
    dueDate: "2023-05-15",
    status: "active",
    interestRate: 5,
    interestRateType: "monthly",
  },
  {
    id: "3",
    borrowerName: "Michael Brown",
    amount: 10000,
    date: "2023-03-20",
    dueDate: "2023-09-20",
    status: "active",
    interestRate: 6,
    interestRateType: "yearly",
  },
  {
    id: "4",
    borrowerName: "Emily Davis",
    amount: 1500,
    date: "2023-04-10",
    dueDate: "2023-05-10",
    status: "paid",
    interestRate: 4,
    interestRateType: "monthly",
  },
];

// Helper SVG icons
const InterestIcon = ({ color = "#4CAF50", size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
      fill={color}
    />
  </Svg>
);
const CalendarIcon = ({ color = "#2196F3", size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"
      fill={color}
    />
  </Svg>
);
const RupeeIcon = ({ color = "#388E3C", size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6h12v2H6zm0 3h12v2H6zm0 3h7v2H6zm0 3h7v2H6z" fill={color} />
  </Svg>
);

export default function HomeScreen() {
  const { theme } = useTheme();
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [addLoanModalOpen, setAddLoanModalOpen] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Add loan form state
  const [borrowerName, setBorrowerName] = useState<string>("");
  const [borrowerPhone, setBorrowerPhone] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ); // 30 days from now
  const [notes, setNotes] = useState<string>("");
  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState<boolean>(false);
  const [collateralRequired, setCollateralRequired] = useState<boolean>(false);
  const [collateralDetails, setCollateralDetails] = useState<string>("");
  const [interestRateType, setInterestRateType] = useState<
    "monthly" | "yearly"
  >("monthly");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>("all");

  // Modal references
  const filterModalRef = useRef<any>(null);
  const addLoanModalRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Add this line near the top of the component, after other hooks
  const { showAlert, AlertComponent } = useCustomAlert();

  // Add state for tab selection
  const [loanTab, setLoanTab] = useState<"active" | "paid">("active");

  const onChangeSearch = (query: string): void => setSearchQuery(query);

  // Function to calculate interest earned for a loan
  const calculateInterestEarned = (loan: Loan): number => {
    const principal = loan.amount;
    const interestRate = loan.interestRate / 100;
    const loanStartDate = new Date(loan.date);
    const currentDate = new Date();

    // Calculate duration in days from loan start to now
    const durationInDays = Math.max(
      0,
      Math.ceil(
        (currentDate.getTime() - loanStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    let interest = 0;
    if (loan.interestRateType === "yearly") {
      // Convert days to years for calculation
      const durationInYears = durationInDays / 365;
      interest = principal * interestRate * durationInYears;
    } else {
      // Default to monthly - convert days to months for calculation
      const durationInMonths = durationInDays / 30;
      interest = principal * interestRate * durationInMonths;
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

  const renderLoanItem: ListRenderItem<Loan> = ({ item }) => {
    const interestEarned = calculateInterestEarned(item);
    return (
      <Animatable.View animation="fadeInUp" duration={500} useNativeDriver>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/loan-details",
              params: { loan: JSON.stringify(item) },
            })
          }
          style={{ borderRadius: 12 }}
        >
          <Animatable.View
            animation="pulse"
            duration={300}
            iterationCount={1}
            style={{ borderRadius: 12 }}
          >
            <Card
              style={[
                styles.loanCard,
                { backgroundColor: theme.colors.surface },
                item.status === "paid" && { opacity: 0.7 },
              ]}
              mode="elevated"
            >
              <Card.Content>
                {/* Header: Name & Status */}
                <View style={styles.cardHeaderRow}>
                  <Text
                    style={[
                      styles.borrowerName,
                      { color: theme.colors.onSurface },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.borrowerName}
                  </Text>
                  <Chip
                    mode="flat"
                    textStyle={styles.statusChipText}
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                    compact
                    accessibilityLabel={
                      item.status === "paid" ? "Paid loan" : "Active loan"
                    }
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Chip>
                </View>

                {/* Amount & Date Row */}
                <View style={styles.cardAmountDateRow}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <RupeeIcon color={theme.colors.primary} size={16} />
                    <Text
                      style={[
                        styles.loanAmount,
                        { color: theme.colors.primary, marginLeft: 4 },
                      ]}
                    >
                      {item.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <CalendarIcon
                      color={theme.colors.onSurfaceVariant}
                      size={16}
                    />
                    <Text
                      style={[
                        styles.loanDate,
                        { color: theme.colors.onSurfaceVariant, marginLeft: 4 },
                      ]}
                    >
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Details Grid: Interest Rate & Interest Earned */}
                <View style={styles.cardDetailsGrid}>
                  <View style={styles.cardDetailCol}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <InterestIcon color={theme.colors.primary} size={16} />
                      <Text
                        style={[
                          styles.detailLabel,
                          {
                            color: theme.colors.onSurfaceVariant,
                            marginLeft: 6,
                          },
                        ]}
                      >
                        Interest Rate
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "flex-end" }}
                    >
                      <Text
                        style={[
                          styles.detailValue,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        {item.interestRate}
                      </Text>
                      <Text
                        style={[
                          styles.detailUnit,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        %
                      </Text>
                      <Text
                        style={[
                          styles.detailUnit,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {item.interestRateType === "yearly" ? "/yr" : "/mo"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardDetailColRight}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                        justifyContent: "flex-end",
                      }}
                    >
                      <InterestIcon color={theme.colors.primary} size={16} />
                      <Text
                        style={[
                          styles.detailLabel,
                          {
                            color: theme.colors.onSurfaceVariant,
                            marginLeft: 6,
                            textAlign: "right",
                          },
                        ]}
                      >
                        Interest Earned
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Text
                        style={[
                          styles.detailValue,
                          { color: theme.colors.primary },
                        ]}
                      >
                        ₹{interestEarned.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const onChangeStartDate = (event: any, selectedDate?: Date): void => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onChangeDueDate = (event: any, selectedDate?: Date): void => {
    const currentDate = selectedDate || dueDate;
    setShowDueDatePicker(false);
    setDueDate(currentDate);
  };

  // Update the handleAddLoan function
  const handleAddLoan = (): void => {
    // Validate form
    if (!borrowerName || !amount || !interestRate) {
      showAlert({
        title: "Missing Information",
        message: "Please fill in all required fields",
      });
      return;
    }

    // Create new loan
    const newLoan: Loan = {
      id: (loans.length + 1).toString(),
      borrowerName,
      amount: Number.parseFloat(amount),
      date: startDate.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      status: "active",
      interestRate: Number.parseFloat(interestRate),
      interestRateType: interestRateType,
      borrowerPhone,
      notes,
      collateral: collateralRequired ? collateralDetails : undefined,
    };

    // Add to loans
    setLoans([newLoan, ...loans]);

    // Reset form and close modal
    resetForm();
    setAddLoanModalOpen(false);
  };

  const resetForm = (): void => {
    setBorrowerName("");
    setBorrowerPhone("");
    setAmount("");
    setInterestRate("");
    setInterestRateType("monthly");
    setStartDate(new Date());
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setNotes("");
    setCollateralRequired(false);
    setCollateralDetails("");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search borrowers"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.onSurfaceVariant}
          inputStyle={{ color: theme.colors.onSurface }}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalOpen(true)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Surface
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.surface,
                flex: 1,
                marginRight: 8,
              },
            ]}
          >
            <Text
              style={[
                styles.summaryTitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Total Active Loans
            </Text>
            <Text
              style={[styles.summaryAmount, { color: theme.colors.primary }]}
            >
              ₹{totalActive.toLocaleString()}
            </Text>
          </Surface>

          <Surface
            style={[
              styles.summaryCard,
              { backgroundColor: theme.colors.surface, flex: 1, marginLeft: 8 },
            ]}
          >
            <Text
              style={[
                styles.summaryTitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Total Interest
            </Text>
            <Text style={[styles.summaryAmount, { color: "#4CAF50" }]}>
              ₹{totalInterest.toFixed(2)}
            </Text>
          </Surface>
        </View>
      </View>

      {/* Loan type chips */}
      <View style={styles.loanTabChipsContainer}>
        <Chip
          mode={loanTab === "active" ? "flat" : "outlined"}
          selected={loanTab === "active"}
          onPress={() => {
            setLoanTab("active");
            scrollRef.current?.scrollTo({ x: 0, animated: true });
          }}
          style={[
            styles.loanTabChip,
            loanTab === "active" && styles.selectedLoanTabChip,
          ]}
          textStyle={
            loanTab === "active"
              ? styles.selectedChipText
              : { color: theme.colors.onSurface }
          }
        >
          Active Loans
        </Chip>
        <Chip
          mode={loanTab === "paid" ? "flat" : "outlined"}
          selected={loanTab === "paid"}
          onPress={() => {
            setLoanTab("paid");
            scrollRef.current?.scrollTo({
              x: Dimensions.get("window").width,
              animated: true,
            });
          }}
          style={[
            styles.loanTabChip,
            loanTab === "paid" && styles.selectedLoanTabChip,
          ]}
          textStyle={
            loanTab === "paid"
              ? styles.selectedChipText
              : { color: theme.colors.onSurface }
          }
        >
          Paid Loans
        </Chip>
      </View>

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

      <FAB
        style={[
          styles.fab,
          {
            bottom: insets.bottom > 0 ? insets.bottom : 16,
            backgroundColor: theme.colors.primary,
          },
        ]}
        icon="plus"
        onPress={() => setAddLoanModalOpen(true)}
        color="#FFFFFF"
      />

      {/* Filter Modal */}
      <Modal
        ref={filterModalRef}
        style={[styles.modal, { backgroundColor: theme.colors.surface }]}
        position="bottom"
        isOpen={filterModalOpen}
        onClosed={() => setFilterModalOpen(false)}
        swipeToClose
        backdropPressToClose
        entry="bottom"
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Filter Loans
          </Text>
          <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.filterOptions}>
          <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>
            Status
          </Text>
          {/* Find the statusButtons View in the Filter Modal and replace it with: */}
          <View style={styles.statusButtons}>
            <Chip
              mode={statusFilter === "all" ? "flat" : "outlined"}
              selected={statusFilter === "all"}
              onPress={() => setStatusFilter("all")}
              style={[
                styles.statusChip,
                statusFilter === "all" && styles.selectedChip,
              ]}
              textStyle={
                statusFilter === "all"
                  ? styles.selectedChipText
                  : { color: theme.colors.onSurface }
              }
              selectedColor="#FFFFFF"
            >
              All
            </Chip>
            <Chip
              mode={statusFilter === "active" ? "flat" : "outlined"}
              selected={statusFilter === "active"}
              onPress={() => setStatusFilter("active")}
              style={[
                styles.statusChip,
                statusFilter === "active" && styles.selectedChip,
              ]}
              textStyle={
                statusFilter === "active"
                  ? styles.selectedChipText
                  : { color: theme.colors.onSurface }
              }
              selectedColor="#FFFFFF"
            >
              Active
            </Chip>
            <Chip
              mode={statusFilter === "paid" ? "flat" : "outlined"}
              selected={statusFilter === "paid"}
              onPress={() => setStatusFilter("paid")}
              style={[
                styles.statusChip,
                statusFilter === "paid" && styles.selectedChip,
              ]}
              textStyle={
                statusFilter === "paid"
                  ? styles.selectedChipText
                  : { color: theme.colors.onSurface }
              }
              selectedColor="#FFFFFF"
            >
              Paid
            </Chip>
          </View>
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setStatusFilter("all")}
            style={styles.resetButton}
            textColor={theme.colors.primary}
          >
            Reset Filters
          </Button>
          <Button
            mode="contained"
            onPress={() => setFilterModalOpen(false)}
            style={styles.applyButton}
            labelStyle={styles.buttonLabel}
          >
            Apply Filters
          </Button>
        </View>
      </Modal>

      {/* Add Loan Modal */}
      <Modal
        ref={addLoanModalRef}
        style={[styles.addLoanModal, { backgroundColor: theme.colors.surface }]}
        position="center"
        isOpen={addLoanModalOpen}
        onClosed={() => setAddLoanModalOpen(false)}
        backdropPressToClose
        swipeToClose
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Add New Loan
          </Text>
          <TouchableOpacity onPress={() => setAddLoanModalOpen(false)}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.addLoanForm}>
          <TextInput
            label="Borrower Name *"
            value={borrowerName}
            onChangeText={setBorrowerName}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            textColor={theme.colors.onSurface}
          />

          <TextInput
            label="Phone Number"
            value={borrowerPhone}
            onChangeText={setBorrowerPhone}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            keyboardType="phone-pad"
            textColor={theme.colors.onSurface}
          />

          <TextInput
            label="Loan Amount *"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            keyboardType="numeric"
            left={
              <TextInput.Affix
                text="₹"
                textStyle={{ color: theme.colors.onSurfaceVariant }}
              />
            }
            textColor={theme.colors.onSurface}
          />

          <TextInput
            label="Interest Rate *"
            value={interestRate}
            onChangeText={setInterestRate}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            keyboardType="numeric"
            right={
              <TextInput.Affix
                text="%"
                textStyle={{ color: theme.colors.onSurfaceVariant }}
              />
            }
            textColor={theme.colors.onSurface}
          />

          <View style={styles.interestRateTypeContainer}>
            <Text
              style={[
                styles.dateLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Interest Rate Type
            </Text>
            <View style={styles.methodOptions}>
              <Chip
                mode={interestRateType === "monthly" ? "flat" : "outlined"}
                selected={interestRateType === "monthly"}
                onPress={() => setInterestRateType("monthly")}
                style={[
                  styles.methodChip,
                  interestRateType === "monthly" && styles.selectedChip,
                ]}
                textStyle={
                  interestRateType === "monthly"
                    ? styles.selectedChipText
                    : { color: theme.colors.onSurface }
                }
                selectedColor="#FFFFFF"
              >
                Monthly
              </Chip>
              <Chip
                mode={interestRateType === "yearly" ? "flat" : "outlined"}
                selected={interestRateType === "yearly"}
                onPress={() => setInterestRateType("yearly")}
                style={[
                  styles.methodChip,
                  interestRateType === "yearly" && styles.selectedChip,
                ]}
                textStyle={
                  interestRateType === "yearly"
                    ? styles.selectedChipText
                    : { color: theme.colors.onSurface }
                }
                selectedColor="#FFFFFF"
              >
                Yearly
              </Chip>
            </View>
          </View>

          <View style={styles.dateContainer}>
            <Text
              style={[
                styles.dateLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Start Date
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowStartDatePicker(true)}
              style={styles.dateButton}
              textColor={theme.colors.primary}
            >
              {startDate.toLocaleDateString()}
            </Button>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onChangeStartDate}
                themeVariant={theme.dark ? "dark" : "light"}
              />
            )}
          </View>

          <View style={styles.dateContainer}>
            <Text
              style={[
                styles.dateLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Due Date
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowDueDatePicker(true)}
              style={styles.dateButton}
              textColor={theme.colors.primary}
            >
              {dueDate.toLocaleDateString()}
            </Button>
            {showDueDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={onChangeDueDate}
                themeVariant={theme.dark ? "dark" : "light"}
              />
            )}
          </View>

          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            multiline
            numberOfLines={3}
            textColor={theme.colors.onSurface}
          />
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setAddLoanModalOpen(false)}
            style={styles.cancelButton}
            textColor={theme.colors.primary}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleAddLoan}
            style={styles.saveButton}
            labelStyle={styles.buttonLabel}
          >
            Save Loan
          </Button>
        </View>
      </Modal>

      {/* Render the AlertComponent */}
      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
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
