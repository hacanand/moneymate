"use client";

import React,{ useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Divider,
  List,
  Chip,
  TextInput,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "react-native-modalbox";
import type { LoanDetailsScreenNavigationProp } from "../../types/navigation";
import type { Payment, PaymentMethod } from "../../types/loan";

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const LoanDetailsScreen: React.FC<LoanDetailsScreenNavigationProp> = ({
  route,
  navigation,
}) => {
  const { loan } = route.params;
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [reminderModalOpen, setReminderModalOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [reminderMessage, setReminderMessage] = useState<string>(
    `Hello ${
      loan.borrowerName
    }, this is a reminder that your loan payment of $${
      loan.amount
    } is due on ${new Date(loan.dueDate).toLocaleDateString()}.`
  );

  // Modal references
  const paymentModalRef = useRef<any>(null);
  const reminderModalRef = useRef<any>(null);

  const handlePayment = (): void => {
    // Validate payment amount
    if (
      !paymentAmount ||
      isNaN(Number.parseFloat(paymentAmount)) ||
      Number.parseFloat(paymentAmount) <= 0
    ) {
      Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
      return;
    }

    // In a real app, you would process the payment here
    Alert.alert(
      "Payment Recorded",
      `Payment of $${paymentAmount} has been recorded via ${
        paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
      }.`
    );
    setPaymentModalOpen(false);
    setPaymentAmount("");
    setPaymentMethod("cash");
  };

  const handleSendReminder = (): void => {
    // In a real app, you would send the reminder here
    Alert.alert(
      "Reminder Sent",
      `A payment reminder has been sent to ${loan.borrowerName}.`
    );
    setReminderModalOpen(false);
  };

  // Calculate interest
  const principal = loan.amount;
  const interestRate = loan.interestRate / 100;
  const loanStartDate = new Date(loan.date);
  const loanDueDate = new Date(loan.dueDate);
  const durationInDays = Math.ceil(
    (loanDueDate.getTime() - loanStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const durationInMonths = durationInDays / 30;
  const interest = principal * interestRate * durationInMonths;
  const totalAmount = principal + interest;

  // Calculate days remaining or overdue
  const currentDate = new Date();
  const daysRemaining = Math.ceil(
    (loanDueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Mock payment history
  const paymentHistory: Payment[] = [
    { id: "1", date: "2025-04-15", amount: 500, method: "Cash" },
    { id: "2", date: "2025-04-30", amount: 500, method: "Bank Transfer" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.borrowerName}>{loan.borrowerName}</Text>
              <Text style={styles.loanId}>Loan ID: {loan.id}</Text>
            </View>
            <Chip
              mode="outlined"
              style={{
                borderColor:
                  loan.status === "active"
                    ? "#4CAF50"
                    : loan.status === "overdue"
                    ? "#F44336"
                    : "#2196F3",
              }}
              textStyle={{
                color:
                  loan.status === "active"
                    ? "#4CAF50"
                    : loan.status === "overdue"
                    ? "#F44336"
                    : "#2196F3",
                fontFamily: "Roboto-Medium",
              }}
            >
              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Principal Amount</Text>
            <Text style={styles.detailValue}>
              ${principal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest Rate</Text>
            <Text style={styles.detailValue}>{loan.interestRate}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest Amount</Text>
            <Text style={styles.detailValue}>${interest.toFixed(2)}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={[styles.detailValue, styles.totalAmount]}>
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Loan Schedule</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>
              {new Date(loan.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>
              {new Date(loan.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {daysRemaining > 0 ? "Days Remaining" : "Days Overdue"}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: daysRemaining > 0 ? "#4CAF50" : "#F44336" },
              ]}
            >
              {Math.abs(daysRemaining)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.paymentHeaderRow}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <TouchableOpacity onPress={() => setPaymentModalOpen(true)}>
              <MaterialCommunityIcons
                name="plus-circle"
                size={24}
                color="#2E7D32"
              />
            </TouchableOpacity>
          </View>
          {paymentHistory.map((payment) => (
            <List.Item
              key={payment.id}
              title={`$${payment.amount.toLocaleString()}`}
              description={`Method: ${payment.method}`}
              right={(props) => (
                <Text {...props} style={styles.paymentDate}>
                  {new Date(payment.date).toLocaleDateString()}
                </Text>
              )}
              style={styles.paymentItem}
              titleStyle={{ fontFamily: "Roboto-Medium" }}
              descriptionStyle={{ fontFamily: "Roboto-Regular" }}
            />
          ))}
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
        >
          Send Reminder
        </Button>
      </View>

      {/* Payment Modal */}
      <Modal
        ref={paymentModalRef}
        style={styles.modal}
        position="center"
        isOpen={paymentModalOpen}
        onClosed={() => setPaymentModalOpen(false)}
        backdropPressToClose
        swipeToClose
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Record Payment</Text>
          <TouchableOpacity onPress={() => setPaymentModalOpen(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            label="Payment Amount"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="$" />}
          />

          <Text style={styles.methodLabel}>Payment Method</Text>
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
                paymentMethod === "cash" ? styles.selectedChipText : {}
              }
              icon="cash"
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
                paymentMethod === "bank transfer" ? styles.selectedChipText : {}
              }
              icon="bank"
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
                paymentMethod === "check" ? styles.selectedChipText : {}
              }
              icon="checkbox-marked"
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
        style={styles.modal}
        position="center"
        isOpen={reminderModalOpen}
        onClosed={() => setReminderModalOpen(false)}
        backdropPressToClose
        swipeToClose
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Send Payment Reminder</Text>
          <TouchableOpacity onPress={() => setReminderModalOpen(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            label="Message"
            value={reminderMessage}
            onChangeText={setReminderMessage}
            mode="outlined"
            style={styles.messageInput}
            multiline
            numberOfLines={5}
          />
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setReminderModalOpen(false)}
            style={styles.cancelButton}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
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
    color: "#757575",
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
    color: "#757575",
  },
  detailValue: {
    fontFamily: "Roboto-Medium",
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    color: "#2E7D32",
  },
  divider: {
    marginVertical: 8,
  },
  paymentItem: {
    paddingLeft: 0,
  },
  paymentDate: {
    fontFamily: "Roboto-Regular",
    color: "#757575",
    alignSelf: "center",
  },
  buttonContainer: {
    marginBottom: 24,
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

export default LoanDetailsScreen;
