import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Modal from "react-native-modalbox";
import { Button, Chip, Text, TextInput } from "react-native-paper";

interface FullPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountDue: number;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  onConfirm: (details: {
    amountPaid: string;
    notes: string;
    paymentDate: string;
  }) => void;
  theme: any;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export const FullPaymentModal: React.FC<FullPaymentModalProps> = ({
  isOpen,
  onClose,
  amountDue,
  paymentMethod,
  setPaymentMethod,
  onConfirm,
  theme,
}) => {
  const [amountPaid, setAmountPaid] = useState(amountDue.toString());
  const [notes, setNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const handleConfirm = () => {
    onConfirm({ amountPaid, notes, paymentDate });
  };

  return (
    <Modal
      style={[styles.modal, { backgroundColor: theme.colors.surface }]}
      position="center"
      isOpen={isOpen}
      onClosed={onClose}
      backdropPressToClose
      swipeToClose
      keyboardTopOffset={Platform.OS === "ios" ? 40 : 0}
      coverScreen={true}
      avoidKeyboard={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Full Loan Payment
          </Text>
          <Button onPress={onClose} icon="close" compact>
            Close
          </Button>
        </View>
        <View style={styles.modalContent}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Amount Due
          </Text>
          <Text style={[styles.amount, { color: theme.colors.primary }]}>
            ₹{amountDue.toLocaleString()}
          </Text>
          <TextInput
            label="Amount Paid"
            value={amountPaid}
            onChangeText={setAmountPaid}
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
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            multiline
            numberOfLines={2}
            textColor={theme.colors.onSurface}
          />
          <TextInput
            label="Payment Date"
            value={paymentDate}
            onChangeText={setPaymentDate}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            textColor={theme.colors.onSurface}
            placeholder="YYYY-MM-DD"
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
            onPress={onClose}
            style={styles.cancelButton}
            textColor={theme.colors.primary}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.saveButton}
          >
            Confirm Full Payment
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    height: 600,
    width: SCREEN_WIDTH > 400 ? 360 : SCREEN_WIDTH - 40,
    borderRadius: 20,
    padding: 20,
    justifyContent: "flex-start",
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
    flexGrow: 1,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontFamily: "Roboto-Bold",
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
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
    backgroundColor: "#1A4A31",
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
});
