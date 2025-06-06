import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

interface AddLoanModalProps {
  borrowerName: string;
  setBorrowerName: (v: string) => void;
  borrowerPhone: string;
  setBorrowerPhone: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  interestRate: string;
  setInterestRate: (v: string) => void;
  interestRateType: "monthly" | "yearly";
  setInterestRateType: (v: "monthly" | "yearly") => void;
  startDate: Date;
  setShowStartDatePicker: (v: boolean) => void;
  showStartDatePicker: boolean;
  onChangeStartDate: (event: any, selectedDate?: Date) => void;
  dueDate: Date;
  setShowDueDatePicker: (v: boolean) => void;
  showDueDatePicker: boolean;
  onChangeDueDate: (event: any, selectedDate?: Date) => void;
  notes: string;
  setNotes: (v: string) => void;
  handleAddLoan: () => void;
  theme: any;
}

export default function AddLoanPage(
  props: Omit<
    AddLoanModalProps,
    "addLoanModalOpen" | "setAddLoanModalOpen" | "addLoanModalRef"
  > & { theme: any }
) {
  const router = useRouter();
  return (
    <View
      style={[
        styles.addLoanModal,
        { backgroundColor: props.theme.colors.surface },
      ]}
    >
      <View style={styles.modalHeader}>
        <Text
          style={[styles.modalTitle, { color: props.theme.colors.onSurface }]}
        >
          Add New Loan
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={props.theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.addLoanForm}>
        <TextInput
          label="Borrower Name *"
          value={props.borrowerName}
          onChangeText={props.setBorrowerName}
          mode="outlined"
          style={[
            styles.input,
            { backgroundColor: props.theme.colors.surface },
          ]}
          textColor={props.theme.colors.onSurface}
        />
        <TextInput
          label="Phone Number"
          value={props.borrowerPhone}
          onChangeText={props.setBorrowerPhone}
          mode="outlined"
          style={[
            styles.input,
            { backgroundColor: props.theme.colors.surface },
          ]}
          keyboardType="phone-pad"
          textColor={props.theme.colors.onSurface}
        />
        <TextInput
          label="Loan Amount *"
          value={props.amount}
          onChangeText={props.setAmount}
          mode="outlined"
          style={[
            styles.input,
            { backgroundColor: props.theme.colors.surface },
          ]}
          keyboardType="numeric"
          left={
            <TextInput.Affix
              text="₹"
              textStyle={{ color: props.theme.colors.onSurfaceVariant }}
            />
          }
          textColor={props.theme.colors.onSurface}
        />
        <TextInput
          label="Interest Rate *"
          value={props.interestRate}
          onChangeText={props.setInterestRate}
          mode="outlined"
          style={[
            styles.input,
            { backgroundColor: props.theme.colors.surface },
          ]}
          keyboardType="numeric"
          right={
            <TextInput.Affix
              text="%"
              textStyle={{ color: props.theme.colors.onSurfaceVariant }}
            />
          }
          textColor={props.theme.colors.onSurface}
        />
        <View style={styles.interestRateTypeContainer}>
          <Text
            style={[
              styles.dateLabel,
              { color: props.theme.colors.onSurfaceVariant },
            ]}
          >
            Interest Rate Type
          </Text>
          <View style={styles.methodOptions}>
            <Button
              mode={
                props.interestRateType === "monthly" ? "contained" : "outlined"
              }
              onPress={() => props.setInterestRateType("monthly")}
              style={
                props.interestRateType === "monthly"
                  ? styles.selectedChip
                  : styles.methodChip
              }
            >
              Monthly
            </Button>
            <Button
              mode={
                props.interestRateType === "yearly" ? "contained" : "outlined"
              }
              onPress={() => props.setInterestRateType("yearly")}
              style={
                props.interestRateType === "yearly"
                  ? styles.selectedChip
                  : styles.methodChip
              }
            >
              Yearly
            </Button>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Text
            style={[
              styles.dateLabel,
              { color: props.theme.colors.onSurfaceVariant },
            ]}
          >
            Start Date
          </Text>
          <Button
            mode="outlined"
            onPress={() => props.setShowStartDatePicker(true)}
            style={styles.dateButton}
            textColor={props.theme.colors.primary}
          >
            {props.startDate.toLocaleDateString()}
          </Button>
          {props.showStartDatePicker && (
            <DateTimePicker
              value={props.startDate}
              mode="date"
              display="default"
              onChange={props.onChangeStartDate}
              themeVariant={props.theme.dark ? "dark" : "light"}
            />
          )}
        </View>
        <View style={styles.dateContainer}>
          <Text
            style={[
              styles.dateLabel,
              { color: props.theme.colors.onSurfaceVariant },
            ]}
          >
            Due Date
          </Text>
          <Button
            mode="outlined"
            onPress={() => props.setShowDueDatePicker(true)}
            style={styles.dateButton}
            textColor={props.theme.colors.primary}
          >
            {props.dueDate.toLocaleDateString()}
          </Button>
          {props.showDueDatePicker && (
            <DateTimePicker
              value={props.dueDate}
              mode="date"
              display="default"
              onChange={props.onChangeDueDate}
              themeVariant={props.theme.dark ? "dark" : "light"}
            />
          )}
        </View>
        <TextInput
          label="Notes"
          value={props.notes}
          onChangeText={props.setNotes}
          mode="outlined"
          style={[
            styles.input,
            { backgroundColor: props.theme.colors.surface },
          ]}
          multiline
          numberOfLines={3}
          textColor={props.theme.colors.onSurface}
        />
      </View>
      <View style={styles.modalActions}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.cancelButton}
          textColor={props.theme.colors.primary}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={props.handleAddLoan}
          style={styles.saveButton}
          labelStyle={styles.buttonLabel}
        >
          Save Loan
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addLoanModal: {
    height: 550,
    width: 320,
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
  addLoanForm: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
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
  selectedChip: {
    backgroundColor: "#2E7D32",
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
  buttonLabel: {
    fontFamily: "Roboto-Medium",
  },
});
