import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import Modal from "react-native-modalbox";
import { Button, Text, TextInput } from "react-native-paper";

interface FullPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: {
    amountPaid: string;
    notes: string;
    paymentDate: string;
  }) => void;
  defaultAmount: string;
  theme: any;
}

export const FullPaymentModal: React.FC<FullPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultAmount,
  theme,
}) => {
  const [amountPaid, setAmountPaid] = useState(defaultAmount);
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
      backdropPressToClose={false}
      swipeToClose={false}
      animationDuration={200}
      backdrop={true}
      backdropOpacity={0.5}
      coverScreen={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={20}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Full Loan Payment
          </Text>
        </View>
        <View style={styles.content}>
          <TextInput
            label="Amount Paid"
            value={amountPaid}
            onChangeText={setAmountPaid}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={styles.input}
            multiline
          />
          <TextInput
            label="Payment Date"
            value={paymentDate}
            onChangeText={setPaymentDate}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.actions}>
          <Button mode="outlined" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.button}
          >
            Confirm
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    height: 380,
    width: 325,
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    // alignItems: "center",
    position: "absolute",
    // top: "50%",
    // left: "50%",
    // marginTop: -190, // Half of height
    // marginLeft: -160, // Half of width
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  input: {
    marginBottom: 14,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
  container: {
    flex: 1,
  },
});
