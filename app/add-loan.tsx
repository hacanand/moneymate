"use client"
import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function AddLoanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [interestRateType, setInterestRateType] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [paymentProof, setPaymentProof] = useState<any>(null);
  const [loanPurpose, setLoanPurpose] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("Cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentModes = ["Cash", "Bank Transfer", "UPI", "Cheque", "Other"];

  const handleAddLoan = async () => {
    setLoading(true);
    setError(null);
    try {
      let paymentProofData = undefined;
      if (paymentProof && paymentProof.uri) {
        const response = await fetch(paymentProof.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(",")[1];
          // Ensure state update and API call are not missed
          handleSubmitLoan(base64data);
        };
        reader.onerror = () => {
          setError("Failed to read payment proof file.");
          setLoading(false);
        };
        reader.readAsDataURL(blob);
        return;
      } else {
        handleSubmitLoan();
      }
    } catch (err: any) {
      setError(err.message || "Failed to add loan. Please try again.");
      setLoading(false);
    }
  };

  // Helper to submit loan after file is read
  const handleSubmitLoan = async (paymentProofData?: string) => {
    if (!user?.id) {
      setError("User not authenticated. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      let apiUrl = "/api/add-loan";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName,
          borrowerPhone,
          amount,
          interestRate,
          interestRateType,
          startDate: startDate.toISOString(),
          notes,
          paymentMode: selectedPaymentMode,
          paymentProofUri: paymentProof?.uri,
          paymentProofType: paymentProof?.type,
          paymentProofName: paymentProof?.name,
          paymentProofData,
          loanPurpose,
          bankAccount,
          userId: user.id, // Add userId to the request
        }),
      });
      const data = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(data);
      } catch (e) {
        setError("Unexpected server response. Please try again later.");
        setLoading(false);
        if (Platform.OS === "android") {
          import("react-native").then(({ ToastAndroid }) => {
            ToastAndroid.show(
              "Unexpected server response. Please try again later.",
              ToastAndroid.LONG
            );
          });
        } else {
          import("react-native").then(({ Alert }) => {
            Alert.alert(
              "Error",
              "Unexpected server response. Please try again later.",
              [
                {
                  text: "OK",
                  style: "cancel",
                },
              ],
              { cancelable: true }
            );
          });
        }
        console.log("API non-JSON response:", data); // Debugging
        return;
      }
      if (!res.ok) {
        setError(json?.error || "Failed to add loan. Please try again.");
        setLoading(false);
        if (Platform.OS === "android") {
          import("react-native").then(({ ToastAndroid }) => {
            ToastAndroid.show(
              json?.error || "Failed to add loan. Please try again.",
              ToastAndroid.LONG
            );
          });
        } else {
          import("react-native").then(({ Alert }) => {
            Alert.alert(
              "Error",
              json?.error || "Failed to add loan. Please try again.",
              [
                {
                  text: "OK",
                  style: "cancel",
                },
              ],
              { cancelable: true }
            );
          });
        }
        console.log("API error:", json); // Debugging
        return;
      }
      setLoading(false);
      // Show toast/alert on success before navigating back
      if (Platform.OS === "android") {
        // Use ToastAndroid for Android
        // @ts-ignore
        import("react-native").then(({ ToastAndroid }) => {
          ToastAndroid.show("Loan added successfully!", ToastAndroid.SHORT);
          setTimeout(() => router.back(), 700);
        });
      } else {
        // Use Alert for iOS/web
        import("react-native").then(({ Alert }) => {
          Alert.alert(
            "Success",
            "Loan added successfully!",
            [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ],
            { cancelable: false }
          );
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to add loan. Please try again.");
      setLoading(false);
      console.log("API exception:", err); // Debugging
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPaymentProof({
        uri: result.assets[0].uri,
        type: "image",
        name:
          result.assets[0].fileName || result.assets[0].uri.split("/").pop(),
      });
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (result.assets && result.assets.length > 0) {
      setPaymentProof({
        uri: result.assets[0].uri,
        type: "pdf",
        name: result.assets[0].name || result.assets[0].uri.split("/").pop(),
      });
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPaymentProof({
        uri: result.assets[0].uri,
        type: "image",
        name:
          result.assets[0].fileName || result.assets[0].uri.split("/").pop(),
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Add New Loan
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            paddingHorizontal: 4,
          }}
        >
          <View
            style={[
              styles.form,
              { backgroundColor: theme.dark ? theme.colors.surface : "#fff" },
            ]}
          >
            <TextInput
              label="Borrower Name *"
              value={borrowerName}
              onChangeText={setBorrowerName}
              mode="outlined"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              textColor={theme.colors.onSurface}
              placeholder="Enter borrower's full name"
              left={
                <TextInput.Icon
                  icon="account"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
            <TextInput
              label="Phone Number"
              value={borrowerPhone}
              onChangeText={setBorrowerPhone}
              mode="outlined"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              keyboardType="phone-pad"
              textColor={theme.colors.onSurface}
              placeholder="Enter phone number"
              left={
                <TextInput.Icon
                  icon="phone"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
            <TextInput
              label="Loan Amount *"
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              keyboardType="numeric"
              left={
                <TextInput.Icon
                  icon="currency-inr"
                  color={theme.colors.onSurfaceVariant}
                />
              }
              textColor={theme.colors.onSurface}
              placeholder="Enter loan amount"
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
              left={
                <TextInput.Icon
                  icon="percent"
                  color={theme.colors.onSurfaceVariant}
                />
              }
              textColor={theme.colors.onSurface}
              placeholder="Enter interest rate"
            />
            <View style={styles.interestRateTypeContainer}>
              <Text
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
              >
                Interest Rate Type
              </Text>
              <View style={styles.methodOptions}>
                <Button
                  mode={
                    interestRateType === "monthly" ? "contained" : "outlined"
                  }
                  onPress={() => setInterestRateType("monthly")}
                  style={
                    interestRateType === "monthly"
                      ? styles.selectedChip
                      : styles.methodChip
                  }
                >
                  Monthly
                </Button>
                <Button
                  mode={
                    interestRateType === "yearly" ? "contained" : "outlined"
                  }
                  onPress={() => setInterestRateType("yearly")}
                  style={
                    interestRateType === "yearly"
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
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
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
                  onChange={(_e, d) => {
                    if (d) setStartDate(d);
                    setShowStartDatePicker(false);
                  }}
                  themeVariant={theme.dark ? "dark" : "light"}
                />
              )}
            </View>
            <TextInput
              label="Loan Purpose"
              value={loanPurpose}
              onChangeText={setLoanPurpose}
              mode="outlined"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              textColor={theme.colors.onSurface}
              placeholder="Purpose of the loan"
              left={
                <TextInput.Icon
                  icon="notebook-outline"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
            <Text
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              Payment Mode
            </Text>
            <View
              style={{
                marginBottom: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                backgroundColor: theme.colors.surface, // Always use theme.colors.surface for Picker bg
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={selectedPaymentMode}
                onValueChange={setSelectedPaymentMode}
                style={{
                  color: theme.colors.onSurface,
                }}
                dropdownIconColor={theme.colors.onSurfaceVariant}
                itemStyle={{ color: theme.colors.onSurface }}
                mode="dialog"
              >
                {paymentModes.map((mode) => (
                  <Picker.Item
                    key={mode}
                    label={mode}
                    value={mode}
                    color={theme.colors.background}
                  />
                ))}
              </Picker>
            </View>
            {selectedPaymentMode !== "Cash" && (
              <TextInput
                label="Bank Account Details"
                value={bankAccount}
                onChangeText={setBankAccount}
                mode="outlined"
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surface },
                ]}
                textColor={theme.colors.onSurface}
                placeholder="Account number, IFSC, etc."
                left={
                  <TextInput.Icon
                    icon="bank"
                    color={theme.colors.onSurfaceVariant}
                  />
                }
              />
            )}

            <Text
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              Payment Proof
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <Button
                icon="image"
                mode="outlined"
                onPress={async () => {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: "images",
                    allowsEditing: true,
                    quality: 0.7,
                  });
                  if (
                    !result.canceled &&
                    result.assets &&
                    result.assets.length > 0
                  ) {
                    setPaymentProof({
                      uri: result.assets[0].uri,
                      type: "image",
                      name:
                        result.assets[0].fileName ||
                        result.assets[0].uri.split("/").pop(),
                    });
                  }
                }}
                compact
              >
                Gallery
              </Button>
              <Button
                icon="file-pdf-box"
                mode="outlined"
                onPress={async () => {
                  const result = await DocumentPicker.getDocumentAsync({
                    type: "application/pdf",
                  });
                  if (result.assets && result.assets.length > 0) {
                    setPaymentProof({
                      uri: result.assets[0].uri,
                      type: "pdf",
                      name:
                        result.assets[0].name ||
                        result.assets[0].uri.split("/").pop(),
                    });
                  }
                }}
                compact
              >
                PDF
              </Button>
              {paymentProof && (
                <Button
                  icon="close"
                  mode="outlined"
                  onPress={() => setPaymentProof(null)}
                  compact
                  textColor={theme.colors.error}
                  style={{ marginLeft: 8, borderColor: theme.colors.error }}
                >
                  Remove
                </Button>
              )}
            </View>
            {paymentProof && paymentProof.type === "image" && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 4,
                  }}
                >
                  Selected Image: {paymentProof.name || "Image"}
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#DDD",
                    borderRadius: 8,
                    overflow: "hidden",
                    width: 120,
                    height: 120,
                  }}
                >
                  <Image
                    source={{ uri: paymentProof.uri }}
                    style={{ width: 120, height: 120, resizeMode: "cover" }}
                  />
                </View>
              </View>
            )}
            {paymentProof && paymentProof.type === "pdf" && (
              <View
                style={{
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={28}
                  color={theme.colors.primary}
                />
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  {paymentProof.name ||
                    (paymentProof.uri
                      ? paymentProof.uri.split("/").pop()
                      : "PDF Selected")}
                </Text>
              </View>
            )}
            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              multiline
              numberOfLines={3}
              textColor={theme.colors.onSurface}
              placeholder="Additional notes (optional)"
              left={
                <TextInput.Icon
                  icon="note-text-outline"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
          </View>
        </ScrollView>

        <View
          style={[
            styles.actions,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.outline,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 8,
            },
          ]}
        >
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={[
              styles.cancelButton,
              {
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                backgroundColor: theme.colors.surface,
              },
            ]}
            textColor={theme.colors.primary}
            icon="close"
            contentStyle={{ height: 48 }}
            labelStyle={{
              fontSize: 16,
              fontFamily: "Roboto-Medium",
              letterSpacing: 0.5,
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleAddLoan}
            style={[
              styles.saveButton,
              { borderRadius: 12, backgroundColor: theme.colors.primary },
            ]}
            icon={loading ? undefined : "check"}
            loading={loading}
            disabled={loading}
            textColor={theme.dark ? "#fff" : "#fff"}
            contentStyle={{ height: 48 }}
            labelStyle={{
              fontSize: 16,
              fontFamily: "Roboto-Medium",
              letterSpacing: 0.5,
            }}
          >
            {loading ? "Saving..." : "Save Loan"}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
  },
  form: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    // backgroundColor is set inline in the component to access theme
  },
  input: {
    marginBottom: 12,
  },
  interestRateTypeContainer: {
    marginBottom: 10,
  },
  methodOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  methodChip: {
    margin: 4,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    backgroundColor: "transparent",
  },
  selectedChip: {
    backgroundColor: "#2E7D32",
    borderWidth: 0,
    margin: 4,
    // Add shadow for selected
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dateContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 4,
  },
  actions: {
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
