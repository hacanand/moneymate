"use client";

import { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  type ListRenderItem,
} from "react-native";
import {
  Text,
  FAB,
  Surface,
  Card,
  Chip,
  Searchbar,
  Button,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal from "react-native-modalbox";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import type { Loan, LoanStatus } from "../../types/loan";
import { useTheme } from "../../context/ThemeContext";
// Import the useCustomAlert hook
import { useCustomAlert } from "../../components/CustomAlert";

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock data for loans
const initialLoans: Loan[] = [
  {
    id: "1",
    borrowerName: "John Smith",
    amount: 5000,
    date: "2025-05-01",
    dueDate: "2025-06-01",
    status: "active",
    interestRate: 5,
  },
  {
    id: "2",
    borrowerName: "Sarah Johnson",
    amount: 2500,
    date: "2025-04-15",
    dueDate: "2025-05-15",
    status: "overdue",
    interestRate: 5,
  },
  {
    id: "3",
    borrowerName: "Michael Brown",
    amount: 10000,
    date: "2025-03-20",
    dueDate: "2025-09-20",
    status: "active",
    interestRate: 6,
  },
  {
    id: "4",
    borrowerName: "Emily Davis",
    amount: 1500,
    date: "2025-04-10",
    dueDate: "2025-05-10",
    status: "paid",
    interestRate: 4,
  },
];

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

  // Add this line near the top of the component, after other hooks
  const { showAlert, AlertComponent } = useCustomAlert();

  const onChangeSearch = (query: string): void => setSearchQuery(query);

  const filteredLoans = loans
    .filter((loan) =>
      loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((loan) => statusFilter === "all" || loan.status === statusFilter);

  const totalActive = loans
    .filter((loan) => loan.status === "active" || loan.status === "overdue")
    .reduce((sum, loan) => sum + loan.amount, 0);

  const getStatusColor = (status: LoanStatus): string => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "overdue":
        return "#F44336";
      case "paid":
        return "#2196F3";
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const renderLoanItem: ListRenderItem<Loan> = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/loan-details",
          params: { loan: JSON.stringify(item) },
        })
      }
    >
      <Card
        style={[styles.loanCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Content>
          <View style={styles.loanHeader}>
            <View>
              <Text
                style={[styles.borrowerName, { color: theme.colors.onSurface }]}
              >
                {item.borrowerName}
              </Text>
              <Text
                style={[styles.loanAmount, { color: theme.colors.primary }]}
              >
                ₹{item.amount.toLocaleString()}
              </Text>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(item.status) }}
              style={{ borderColor: getStatusColor(item.status) }}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Chip>
          </View>
          <View style={styles.loanDetails}>
            <Text
              style={[
                styles.detailText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Interest: {item.interestRate}%
            </Text>
            <Text
              style={[
                styles.detailText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

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
        <Surface
          style={[
            styles.summaryCard,
            { backgroundColor: theme.colors.surface },
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
          <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
            ₹{totalActive.toLocaleString()}
          </Text>
        </Surface>
      </View>

      <FlatList
        data={filteredLoans}
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
              No loans found
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Add a new loan to get started
            </Text>
          </View>
        }
      />

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
              mode={statusFilter === "overdue" ? "flat" : "outlined"}
              selected={statusFilter === "overdue"}
              onPress={() => setStatusFilter("overdue")}
              style={[
                styles.statusChip,
                statusFilter === "overdue" && styles.selectedChip,
              ]}
              textStyle={
                statusFilter === "overdue"
                  ? styles.selectedChipText
                  : { color: theme.colors.onSurface }
              }
              selectedColor="#FFFFFF"
            >
              Overdue
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
    padding: 16,
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
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  loanCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  borrowerName: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
  },
  loanAmount: {
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
  statusChip: {
    margin: 4,
  },
  selectedChip: {
    backgroundColor: "#2E7D32",
  },
  selectedChipText: {
    color: "white",
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
    marginBottom: 8,
  },
  methodChip: {
    margin: 4,
  },
});
