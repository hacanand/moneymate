"use client";

import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { useCustomAlert } from "../components/CustomAlert";
import { FullPaymentModal } from "../components/FullPaymentModal";
import { LoanSummaryCard } from "../components/LoanSummaryCard";
import { PaymentHistorySection } from "../components/PaymentHistorySection";
import { PaymentModal } from "../components/PaymentModal";
import { PaymentProofSection } from "../components/PaymentProofSection";
import { ReminderModal } from "../components/ReminderModal";
import { useTheme } from "../context/ThemeContext";
import type { Loan, Payment, PaymentMethod } from "../types/loan";
// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Shared card/section padding for visual consistency
const cardPadding = 20;
const cardMargin = 8;
const cardHMargin = 16;

export default function LoanDetailsScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ loan: string }>();
  const loan = params.loan ? (JSON.parse(params.loan as string) as Loan) : null;

  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [reminderModalOpen, setReminderModalOpen] = useState<boolean>(false);
  const [fullPaymentModalOpen, setFullPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [fullPaymentMethod, setFullPaymentMethod] =
    useState<PaymentMethod>("cash");
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

  const handleFullPayment = (): void => {
    // In a real app, you would process the full payment here
    showAlert({
      title: "Full Payment Recorded",
      message: `Full payment of ₹${totalAmount.toLocaleString()} has been recorded via ${
        fullPaymentMethod.charAt(0).toUpperCase() + fullPaymentMethod.slice(1)
      }.`,
    });
    setFullPaymentModalOpen(false);
    setFullPaymentMethod("cash");
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
      <LoanSummaryCard
        loan={loan}
        interest={interest}
        totalAmount={totalAmount}
        getStatusColor={getStatusColor}
        theme={theme}
      />
      <PaymentHistorySection
        paymentHistory={paymentHistory}
        onAddPayment={() => setPaymentModalOpen(true)}
        theme={theme}
      />
      <PaymentProofSection
        paymentProofUri={loan.paymentProofUri}
        paymentProofName={loan.paymentProofName}
        paymentProofType={loan.paymentProofType}
        downloading={downloading}
        onDownload={handleDownloadAndOpen}
        theme={theme}
      />
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => setPaymentModalOpen(true)}
          style={styles.button}
          icon="cash-plus"
        >
          Record Payment
        </Button>
        <Button
          mode="contained"
          onPress={() => setFullPaymentModalOpen(true)}
          style={[styles.button, styles.paymentButton]}
          // textColor={theme.colors}
          icon="cash"
        >
          Full Loan Payment
        </Button>
        {/* <Button
          mode="outlined"
          onPress={() => setReminderModalOpen(true)}
          style={styles.button}
          icon="bell-ring-outline"
          textColor={theme.colors.primary}
        >
          Send Reminder
        </Button> */}
      </View>
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={(v: string) => setPaymentMethod(v as PaymentMethod)}
        onConfirm={handlePayment}
        theme={theme}
      />
      <FullPaymentModal
        isOpen={fullPaymentModalOpen}
        onClose={() => setFullPaymentModalOpen(false)}
        amountDue={totalAmount}
        paymentMethod={fullPaymentMethod}
        setPaymentMethod={(v: string) =>
          setFullPaymentMethod(v as PaymentMethod)
        }
        onConfirm={({ amountPaid, notes, paymentDate }) => {
          showAlert({
            title: "Full Payment Recorded",
            message: `Full payment of ₹${amountPaid} has been recorded via ${
              fullPaymentMethod.charAt(0).toUpperCase() +
              fullPaymentMethod.slice(1)
            } on ${paymentDate}.${notes ? "\nNotes: " + notes : ""}`,
          });
          setFullPaymentModalOpen(false);
          setFullPaymentMethod("cash");
        }}
        theme={theme}
      />
      <ReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        reminderMessage={reminderMessage}
        setReminderMessage={setReminderMessage}
        onSend={handleSendReminder}
        theme={theme}
      />
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
