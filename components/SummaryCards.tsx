import React from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";

interface SummaryCardsProps {
  totalActive: number;
  totalInterest: number;
  theme: any;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalActive,
  totalInterest,
  theme,
}) => (
  <View style={styles.summaryContainer}>
    <View style={styles.summaryRow}>
      <Surface
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.surface, flex: 1, marginRight: 8 },
        ]}
      >
        <Text
          style={[
            styles.summaryTitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Total Active Loans
        </Text>
        <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
          ₹{totalActive.toLocaleString()}
        </Text>
      </Surface>
      <Surface
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.surface, flex: 1, marginLeft: 8 },
        ]}
      >
        <Text
          style={[
            styles.summaryTitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Total Interest
        </Text>
        <Text style={[styles.summaryAmount, { color: "#4CAF50" }]}>
          ₹{totalInterest.toFixed(2)}
        </Text>
      </Surface>
    </View>
  </View>
);

const styles = StyleSheet.create({
  summaryContainer: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  summaryAmount: {
    fontSize: 24,
    fontFamily: "Roboto-Bold",
  },
});
