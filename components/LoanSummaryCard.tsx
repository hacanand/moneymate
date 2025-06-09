import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Divider, Text } from "react-native-paper";

interface LoanSummaryCardProps {
  loan: any;
  interest: number;
  totalAmount: number;
  getStatusColor: (status: string) => string;
  theme: any;
}

export const LoanSummaryCard: React.FC<LoanSummaryCardProps> = ({
  loan,
  interest,
  totalAmount,
  getStatusColor,
  theme,
}) => (
  <Card
    style={{
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 8,
      padding: 20,
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
          gap: 10,
          alignItems: "center",
        }}
      >
        <Text style={styles.label}>Loan ID</Text>
        <Text style={styles.value}>{loan.id}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Borrower</Text>
        <Text style={styles.value}>{loan.borrowerName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Start Date</Text>
        <Text style={styles.value}>
          {new Date(loan.startDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Paid Date</Text>
        <Text style={styles.value}>
          {loan.paidDate
            ? new Date(loan.paidDate).toLocaleDateString()
            : "Not Paid"}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Interest Rate</Text>
        <Text style={styles.value}>
          {loan.interestRate}%{" "}
          {loan.interestRateType
            ? `(${loan.interestRateType.toLocaleString()})`
            : "(monthly)"}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Interest Earned</Text>
        <Text
          style={{
            ...styles.value,
            color: theme.colors.primary,
            fontSize: 18,
            minWidth: 100,
            maxWidth: "50%",
            flexWrap: "wrap",
          }}
        >
          ₹{interest.toFixed(2).toLocaleString()}
        </Text>
      </View>
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
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Text
          style={{ ...styles.label, flex: 1, minWidth: 80, maxWidth: 120 }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Total Amount
        </Text>
        <Text
          style={{
            ...styles.value,
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
      {loan.borrowerPhone && (
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text
            style={styles.value}
            selectable
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {loan.borrowerPhone}
          </Text>
        </View>
      )}
      {loan.loanPurpose && (
        <View style={styles.row}>
          <Text style={styles.label}>Loan Purpose</Text>
          <Text
            style={styles.value}
            selectable
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {loan.loanPurpose}
          </Text>
        </View>
      )}
      {loan.bankAccount && (
        <View style={styles.row}>
          <Text style={styles.label}>Bank Account</Text>
          <Text
            style={styles.value}
            selectable
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {loan.bankAccount}
          </Text>
        </View>
      )}
      {loan.notes && (
        <View style={styles.row}>
          <Text style={styles.label}>Notes</Text>
          <Text
            style={styles.value}
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
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 10,
    alignItems: "center",
  },
  label: {
    // color: "#888",
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    // color is set inline where theme is available
  },
  value: {
    fontFamily: "Roboto-Medium",
    fontSize: 15,
    textAlign: "right",
    flex: 2,
    flexWrap: "wrap",
  },
});
