"use client";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  Dimensions,
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
const cardMargin = 16;

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
  const [downloading, setDownloading] = useState(false);

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

  // Calculate interest as in index page (day-wise, startDate to paidDate or today)
  const calculateInterestEarned = (loan: Loan): number => {
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

  // Use the above for interest and totalAmount
  const interest = calculateInterestEarned(loan);
  const totalAmount = loan.amount + interest;

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
  const handleDownloadAndOpen = async () => {
    // Check if payment proof URI exists
    if (!loan.paymentProofUri) {
      showAlert({
        title: "No File",
        message: "No payment proof file available to download.",
      });
      return;
    }
    setDownloading(true); // Set loading state
    try {
      // Construct API URL to match curl command
      const apiUrl = `http://192.168.34.53:8081${loan.paymentProofUri}`;
      console.log("Downloading from:", apiUrl); // Debug log

      // Determine file name and type
      let fileName =
        loan.paymentProofName || `payment-proof-${loan.paymentProofUri}`;
      let extension = fileName.split(".").pop()?.toLowerCase();
      let mimeType = "image/jpeg"; // Default to JPEG

      // Infer extension if missing or invalid
      if (!extension || !["pdf", "png", "jpg", "jpeg"].includes(extension)) {
        extension = loan.paymentProofName?.endsWith(".pdf")
          ? "pdf"
          : loan.paymentProofName?.endsWith(".png")
          ? "png"
          : "jpg";
        fileName =
          loan.paymentProofName ||
          `payment-proof-${loan.paymentProofUri}.${extension}`;
      }

      mimeType =
        extension === "pdf"
          ? "application/pdf"
          : extension === "png"
          ? "image/png"
          : "image/jpeg";

      // Use cacheDirectory for accessibility
      const destUri = `${FileSystem.cacheDirectory}${fileName}`;
      console.log("Saving to:", destUri); // Debug log

      // Download the file
      const downloadResumable = FileSystem.createDownloadResumable(
        apiUrl,
        destUri
      );
      const downloadResult = await downloadResumable.downloadAsync();

      // Verify download
      if (!downloadResult || !downloadResult.uri) {
        throw new Error("Download failed: No file URI returned.");
      }

      const uri = downloadResult.uri;
      console.log("File saved to:", uri); // Debug log

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("File could not be saved.");
      }

      // Check if sharing/opening is available
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        showAlert({
          title: "Cannot Open File",
          message: `Unable to open file. Saved to: ${uri}`,
        });
        return;
      }

      // Open the file with a native app (no share dialog)
      await Sharing.shareAsync(uri, {
        mimeType,
        dialogTitle: `Open ${extension === "pdf" ? "PDF" : "Image"}`,
        UTI: extension === "pdf" ? "com.adobe.pdf" : "public.image", // iOS UTI
      });

      showAlert({
        title: "Download Complete",
        message: `File ${fileName} downloaded and opened.`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      showAlert({
        title: "Download Error",
        message:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Failed to download payment proof. Please try again.",
      });
    } finally {
      setDownloading(false); // Reset loading state
    }
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Loan Summary Card (Professional, improved layout) */}
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Roboto-Bold",
                color: theme.colors.onSurface,
                flex: 1,
                marginBottom: 0,
              }}
            >
              Loan Summary
            </Text>
            <Chip
              mode="outlined"
              style={{
                borderColor: getStatusColor(loan.status),
                backgroundColor: "#00000000",
                height: 32,
                minWidth: 60,
                borderRadius: 8,
                elevation: 1,
                marginLeft: 8,
              }}
              textStyle={{
                color: getStatusColor(loan.status),
                fontFamily: "Roboto-Medium",
                fontSize: 15,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
            </Chip>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontFamily: "Roboto-Bold",
                color: theme.colors.primary,
                flex: 1,
              }}
            >
              ₹{loan.amount.toLocaleString()}
            </Text>
          </View>
          {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          > */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: "Roboto-Regular",
                fontSize: 14,
              }}
            >
              Loan ID
            </Text>
            <Text
              style={{
                color: theme.colors.onSurface,
                fontFamily: "Roboto-Medium",
                fontSize: 16,
              }}
            >
              {loan.id}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: "Roboto-Regular",
                fontSize: 14,
              }}
            >
              Borrower
            </Text>
            <Text
              style={{
                color: theme.colors.onSurface,
                fontFamily: "Roboto-Medium",
                fontSize: 16,
              }}
            >
              {loan.borrowerName}
            </Text>
          </View>
          {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 10,
              alignItems: "center",
            }}
          > */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: "Roboto-Regular",
                fontSize: 14,
              }}
            >
              Start Date
            </Text>
            <Text
              style={{
                color: theme.colors.onSurface,
                fontFamily: "Roboto-Medium",
                fontSize: 16,
              }}
            >
              {new Date(loan.startDate).toLocaleDateString()}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: "Roboto-Regular",
                fontSize: 14,
              }}
            >
              Paid Date
            </Text>
            <Text
              style={{
                color: theme.colors.onSurface,
                fontFamily: "Roboto-Medium",
                fontSize: 16,
              }}
            >
              {loan.paidDate
                ? new Date(loan.paidDate).toLocaleDateString()
                : "Not Paid"}
            </Text>
          </View>
          {/* </View> */}
          {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          > */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: "Roboto-Regular",
                fontSize: 14,
              }}
            >
              Interest Rate
            </Text>
            <Text
              style={{
                color: theme.colors.onSurface,
                fontFamily: "Roboto-Medium",
                fontSize: 16,
              }}
            >
              {loan.interestRate}%{" "}
              {loan.interestRateType
                ? `(${loan.interestRateType})`
                : "(monthly)"}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: "Roboto-Regular",
                fontSize: 14,
              }}
            >
              Interest Earned
            </Text>
            <Text
              style={{
                fontFamily: "Roboto-Medium",
                fontSize: 18,
                textAlign: "right",
                color: theme.colors.primary,
                minWidth: 100,
                maxWidth: "50%",
                flexWrap: "wrap",
              }}
            >
              ₹{interest.toFixed(2)}
            </Text>
          </View>
          {/* </View> */}
          <Divider
            style={{
              marginVertical: 12,
              backgroundColor: theme.colors.surfaceVariant,
            }}
          />
          <View
            style={{
              marginBottom: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: "Roboto-Regular",
                fontSize: 14,
                flex: 1,
                minWidth: 80,
                maxWidth: 120,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Total Amount
            </Text>
            <Text
              style={{
                color: theme.colors.primary,
                fontFamily: "Roboto-Bold",
                fontSize: 20,
                textAlign: "right",
                flex: 2,
                minWidth: 100,
                maxWidth: "70%",
                flexWrap: "wrap",
              }}
              selectable
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              ₹{totalAmount.toFixed(2)}
            </Text>
          </View>
          {/* Details fields with wrapping and truncation for overflow */}
          {loan.borrowerPhone && (
            <View
              style={{
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontFamily: "Roboto-Regular",
                  fontSize: 14,
                  flex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Phone
              </Text>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontFamily: "Roboto-Medium",
                  fontSize: 16,
                  flex: 2,
                  textAlign: "right",
                  flexWrap: "wrap",
                }}
                selectable
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {loan.borrowerPhone}
              </Text>
            </View>
          )}
          {loan.loanPurpose && (
            <View
              style={{
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontFamily: "Roboto-Regular",
                  fontSize: 14,
                  // flex: 1,
                }}
                // numberOfLines={1}
                // ellipsizeMode="tail"
              >
                Loan Purpose
              </Text>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontFamily: "Roboto-Medium",
                  fontSize: 16,
                  flex: 2,
                  textAlign: "right",
                  flexWrap: "wrap",
                }}
                selectable
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {loan.loanPurpose}
              </Text>
            </View>
          )}
          {loan.bankAccount && (
            <View
              style={{
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontFamily: "Roboto-Regular",
                  fontSize: 14,
                  // flex: 1,
                }}
                // numberOfLines={1}
                // ellipsizeMode="tail"
              >
                Bank Account
              </Text>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontFamily: "Roboto-Medium",
                  fontSize: 16,
                  flex: 2,
                  textAlign: "right",
                  flexWrap: "wrap",
                }}
                selectable
                numberOfLines={4}
                ellipsizeMode="tail"
              >
                {loan.bankAccount}
              </Text>
            </View>
          )}
          {loan.notes && (
            <View
              style={{
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontFamily: "Roboto-Regular",
                  fontSize: 14,
                  flex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Notes
              </Text>
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontFamily: "Roboto-Medium",
                  fontSize: 16,
                  flex: 2,
                  textAlign: "right",
                  flexWrap: "wrap",
                }}
                selectable
                numberOfLines={10}
                ellipsizeMode="tail"
              >
                {loan.notes}
              </Text>
            </View>
          )}
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

          {loan.paymentProofUri ? (
            <View style={{ marginTop: 16 }}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant, marginBottom: 8 },
                ]}
              >
                Payment Proof
              </Text>
              {/* Hide preview, show only file name and download button */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <MaterialCommunityIcons
                  name={
                    loan.paymentProofType === "application/pdf"
                      ? "file-pdf-box"
                      : "file-image"
                  }
                  size={32}
                  color={theme.colors.primary}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    color: theme.colors.onSurfaceVariant,
                    textDecorationLine: "underline",
                  }}
                >
                  {loan.paymentProofName || "Payment Proof"}
                </Text>
              </View>
              <Button
                mode="outlined"
                icon={downloading ? undefined : "download"}
                loading={downloading}
                onPress={handleDownloadAndOpen}
                style={{ marginTop: 4, alignSelf: "flex-start" }}
                disabled={!loan.paymentProofUri || downloading}
              >
                {downloading ? "Downloading..." : "Download Payment Proof"}
              </Button>
            </View>
          ) : null}
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
