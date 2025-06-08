"use client";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image, // <-- add this import
  Platform, // <-- add this import for platform check
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modalbox";
import {
  Button,
  Card,
  Chip,
  Divider,
  List,
  Text,
  TextInput,
} from "react-native-paper";
import { useCustomAlert } from "../components/CustomAlert";
import { useTheme } from "../context/ThemeContext";
import type { Loan, Payment, PaymentMethod } from "../types/loan";

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Shared card/section padding for visual consistency
const cardPadding = 20;
const cardMargin = 8;

export default function LoanDetailsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ loan: string }>();
  const loan = params.loan ? (JSON.parse(params.loan as string) as Loan) : null;

  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [reminderModalOpen, setReminderModalOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [reminderMessage, setReminderMessage] = useState<string>(
    `Hello ${loan?.borrowerName}, this is a reminder that your loan payment of ₹${loan?.amount} is pending.`
  );

  // Modal references
  const paymentModalRef = useRef<any>(null);
  const reminderModalRef = useRef<any>(null);

  const { showAlert, AlertComponent } = useCustomAlert();

  if (!loan) {
    router.back();
    return null;
  }

  const handlePayment = (): void => {
    // Validate payment amount
    if (
      !paymentAmount ||
      isNaN(Number.parseFloat(paymentAmount)) ||
      Number.parseFloat(paymentAmount) <= 0
    ) {
      showAlert({
        title: "Invalid Amount",
        message: "Please enter a valid payment amount.",
      });
      return;
    }

    // In a real app, you would process the payment here
    showAlert({
      title: "Payment Recorded",
      message: `Payment of ₹${paymentAmount} has been recorded via ${
        paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
      }.`,
    });
    setPaymentModalOpen(false);
    setPaymentAmount("");
    setPaymentMethod("cash");
  };

  const handleSendReminder = (): void => {
    // In a real app, you would send the reminder here
    showAlert({
      title: "Reminder Sent",
      message: `A payment reminder has been sent to ${loan.borrowerName}.`,
    });
    setReminderModalOpen(false);
  };

  // Calculate interest based on rate type
  const principal = loan.amount;
  const interestRate = loan.interestRate / 100;
  const loanStartDate = new Date(loan.startDate);
  const loanPaidDate = loan.paidDate ? new Date(loan.paidDate) : null;
  let durationInDays = 0;
  if (loanPaidDate) {
    durationInDays = Math.ceil(
      (loanPaidDate.getTime() - loanStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  const durationInMonths = durationInDays / 30;
  const durationInYears = durationInDays / 365;

  // Calculate interest based on rate type (default to monthly if not specified)
  let interest: number = 0;
  if (loanPaidDate) {
    if (loan.interestRateType === "yearly") {
      interest = principal * interestRate * durationInYears;
    } else {
      interest = principal * interestRate * durationInMonths;
    }
  }
  const totalAmount = principal + interest;

  // Mock payment history
  const paymentHistory: Payment[] = [
    { id: "1", date: "2025-04-15", amount: 500, method: "Cash" },
    { id: "2", date: "2025-04-30", amount: 500, method: "Bank Transfer" },
  ];

  const getStatusColor = (status: string): string => {
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text
                style={[styles.borrowerName, { color: theme.colors.onSurface }]}
              >
                {loan.borrowerName}
              </Text>
              <Text
                style={[
                  styles.loanId,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Loan ID: {loan.id}
              </Text>
            </View>
            <Chip
              mode="outlined"
              style={{
                borderColor: getStatusColor(loan.status),
                marginBottom: 20,
                marginRight: 12,
              }}
              textStyle={{
                color: getStatusColor(loan.status),
                fontFamily: "Roboto-Medium",
              }}
            >
              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Loan Details
          </Text>
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Principal Amount
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.colors.onSurface }]}
            >
              ₹{principal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Interest Rate
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.colors.onSurface }]}
            >
              {loan.interestRate}%{" "}
              {loan.interestRateType
                ? `(${loan.interestRateType})`
                : "(monthly)"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Interest Amount
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.colors.onSurface }]}
            >
              ₹{interest.toFixed(2)}
            </Text>
          </View>
          <Divider
            style={[
              styles.divider,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Total Amount
            </Text>
            <Text
              style={[
                styles.detailValue,
                styles.totalAmount,
                { color: theme.colors.primary },
              ]}
            >
              ₹{totalAmount.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Loan Schedule
          </Text>
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Start Date
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.colors.onSurface }]}
            >
              {new Date(loan.startDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Paid Date
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.colors.onSurface }]}
            >
              {loan.paidDate
                ? new Date(loan.paidDate).toLocaleDateString()
                : "Not Paid"}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <View style={styles.paymentHeaderRow}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Payment History
            </Text>
            <TouchableOpacity onPress={() => setPaymentModalOpen(true)}>
              <MaterialCommunityIcons
                name="plus-circle"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          {paymentHistory.map((payment) => (
            <List.Item
              key={payment.id}
              title={`₹${payment.amount.toLocaleString()}`}
              description={`Method: ${payment.method}`}
              right={(props) => (
                <Text
                  {...props}
                  style={[
                    styles.paymentDate,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {new Date(payment.date).toLocaleDateString()}
                </Text>
              )}
              style={styles.paymentItem}
              titleStyle={{
                fontFamily: "Roboto-Medium",
                color: theme.colors.onSurface,
              }}
              descriptionStyle={{
                fontFamily: "Roboto-Regular",
                color: theme.colors.onSurfaceVariant,
              }}
            />
          ))}
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Other Details
          </Text>
          {loan.borrowerPhone && (
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Phone
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {loan.borrowerPhone}
              </Text>
            </View>
          )}
          {loan.notes && (
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Notes
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: theme.colors.onSurface,
                    flex: 1,
                    textAlign: "right",
                  },
                ]}
                numberOfLines={3}
              >
                {loan.notes}
              </Text>
            </View>
          )}
          {loan.collateral && (
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Collateral
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {loan.collateral}
              </Text>
            </View>
          )}
          {loan.paymentProofUri && (
            <View style={{ marginTop: 16 }}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant, marginBottom: 8 },
                ]}
              >
                Payment Proof
              </Text>
              {/* Payment proof preview */}
              {loan.paymentProofType?.startsWith("image") ? (
                <View style={{ alignItems: "flex-start", marginBottom: 8 }}>
                  <Image
                    source={{ uri: loan.paymentProofUri || "" }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#DDD",
                    }}
                    resizeMode="cover"
                  />
                </View>
              ) : loan.paymentProofType === "application/pdf" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name="file-pdf-box"
                    size={32}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    {loan.paymentProofName || "Payment Proof PDF"}
                  </Text>
                </View>
              ) : (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  No preview available
                </Text>
              )}
              {/* Download button */}
              <Button
                mode="outlined"
                icon="download"
                onPress={async () => {
                  if (!loan.paymentProofUri) return;
                  const url = loan.paymentProofUri;
                  if (Platform.OS === "web") {
                    window.open(url, "_blank");
                  } else {
                    const Linking = await import("expo-linking");
                    Linking.openURL(url);
                  }
                }}
                style={{ marginTop: 4, alignSelf: "flex-start" }}
                disabled={!loan.paymentProofUri}
              >
                Download Payment Proof
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => setPaymentModalOpen(true)}
          style={[styles.button, styles.paymentButton]}
          icon="cash-plus"
        >
          Record Payment
        </Button>
        <Button
          mode="outlined"
          onPress={() => setReminderModalOpen(true)}
          style={styles.button}
          icon="bell-ring-outline"
          textColor={theme.colors.primary}
        >
          Send Reminder
        </Button>
      </View>

      {/* Payment Modal */}
      <Modal
        ref={paymentModalRef}
        style={[styles.modal, { backgroundColor: theme.colors.surface }]}
        position="center"
        isOpen={paymentModalOpen}
        onClosed={() => setPaymentModalOpen(false)}
        backdropPressToClose
        swipeToClose
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Record Payment
          </Text>
          <TouchableOpacity onPress={() => setPaymentModalOpen(false)}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            label="Payment Amount"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            left={
              <TextInput.Affix
                text="₹"
                textStyle={{ color: theme.colors.onSurfaceVariant }}
              />
            }
            textColor={theme.colors.onSurface}
          />

          <Text style={[styles.methodLabel, { color: theme.colors.onSurface }]}>
            Payment Method
          </Text>
          <View style={styles.methodOptions}>
            <Chip
              mode={paymentMethod === "cash" ? "flat" : "outlined"}
              selected={paymentMethod === "cash"}
              onPress={() => setPaymentMethod("cash")}
              style={[
                styles.methodChip,
                paymentMethod === "cash" && styles.selectedChip,
              ]}
              textStyle={
                paymentMethod === "cash"
                  ? styles.selectedChipText
                  : { color: theme.colors.onSurface }
              }
              icon="cash"
              selectedColor="#FFFFFF"
            >
              Cash
            </Chip>
            <Chip
              mode={paymentMethod === "bank transfer" ? "flat" : "outlined"}
              selected={paymentMethod === "bank transfer"}
              onPress={() => setPaymentMethod("bank transfer")}
              style={[
                styles.methodChip,
                paymentMethod === "bank transfer" && styles.selectedChip,
              ]}
              textStyle={
                paymentMethod === "bank transfer"
                  ? styles.selectedChipText
                  : { color: theme.colors.onSurface }
              }
              icon="bank"
              selectedColor="#FFFFFF"
            >
              Bank Transfer
            </Chip>
            <Chip
              mode={paymentMethod === "check" ? "flat" : "outlined"}
              selected={paymentMethod === "check"}
              onPress={() => setPaymentMethod("check")}
              style={[
                styles.methodChip,
                paymentMethod === "check" && styles.selectedChip,
              ]}
              textStyle={
                paymentMethod === "check"
                  ? styles.selectedChipText
                  : { color: theme.colors.onSurface }
              }
              icon="checkbox-marked"
              selectedColor="#FFFFFF"
            >
              Check
            </Chip>
          </View>
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setPaymentModalOpen(false)}
            style={styles.cancelButton}
            textColor={theme.colors.primary}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handlePayment}
            style={styles.saveButton}
          >
            Confirm
          </Button>
        </View>
      </Modal>

      {/* Reminder Modal */}
      <Modal
        ref={reminderModalRef}
        style={[styles.modal, { backgroundColor: theme.colors.surface }]}
        position="center"
        isOpen={reminderModalOpen}
        onClosed={() => setReminderModalOpen(false)}
        backdropPressToClose
        swipeToClose
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Send Payment Reminder
          </Text>
          <TouchableOpacity onPress={() => setReminderModalOpen(false)}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            label="Message"
            value={reminderMessage}
            onChangeText={setReminderMessage}
            mode="outlined"
            style={[
              styles.messageInput,
              { backgroundColor: theme.colors.surface },
            ]}
            multiline
            numberOfLines={5}
            textColor={theme.colors.onSurface}
          />
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setReminderModalOpen(false)}
            style={styles.cancelButton}
            textColor={theme.colors.primary}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSendReminder}
            style={styles.saveButton}
          >
            Send
          </Button>
        </View>
      </Modal>

      {/* Render the AlertComponent */}
      <AlertComponent />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  borrowerName: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
  },
  loanId: {
    fontFamily: "Roboto-Regular",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: "Roboto-Regular",
  },
  detailValue: {
    fontFamily: "Roboto-Medium",
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
  },
  divider: {
    marginVertical: 8,
  },
  paymentItem: {
    paddingLeft: 0,
  },
  paymentDate: {
    fontFamily: "Roboto-Regular",
    alignSelf: "center",
  },
  buttonContainer: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  button: {
    marginBottom: 12,
  },
  paymentButton: {
    backgroundColor: "#2E7D32",
  },
  modal: {
    height: 300,
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
  modalContent: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  messageInput: {
    height: 120,
  },
  methodLabel: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
    marginBottom: 10,
  },
  methodOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  methodChip: {
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
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#2E7D32",
  },
  paymentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
});
