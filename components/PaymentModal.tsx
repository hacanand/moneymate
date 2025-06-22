import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import Modal from "react-native-modalbox";
import { Button, Chip, Text, TextInput } from "react-native-paper";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentAmount: string;
  setPaymentAmount: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  onConfirm: () => void;
  theme: any;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  onConfirm,
  theme,
}) => (
  <Modal
    style={[styles.modal, { backgroundColor: theme.colors.surface }]}
    position="center"
    isOpen={isOpen}
    onClosed={onClose}
    backdropPressToClose={false}
    swipeToClose={false}
    coverScreen={true}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={60}
    >
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
          Record Payment
        </Text>
        {/* <Button onPress={onClose} icon="close" compact>
        Close
      </Button> */}
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
          onPress={onClose}
          style={styles.cancelButton}
          textColor={theme.colors.primary}
        >
          Cancel
        </Button>
        <Button mode="contained" onPress={onConfirm} style={styles.saveButton}>
          Confirm
        </Button>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  modal: {
    height: 350,
    width: 320,
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    // alignItems: "center",
    position: "absolute",
    // top: "50%",
    // left: "50%",
    // marginTop: -175, // Half of height
    // marginLeft: -160, // Half of width
  },
  modalHeader: {
    flexDirection: "row",
    // justifyContent: "space-between",
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
});
