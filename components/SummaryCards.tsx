import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { Path, Svg } from "react-native-svg";

// Professional design constants - matching LoanCard
const CARD_PADDING = 20;
const CARD_MARGIN = 16;
const BORDER_RADIUS = 16;
const ICON_SIZE = 24;

interface SummaryCardsProps {
  totalActive: number;
  totalInterest: number;
  theme: any;
}

// Icons for summary cards
const ActiveLoansIcon = ({ color = "#2196F3", size = ICON_SIZE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C13.1 2 14 2.9 14 4V6H20C21.1 6 22 6.9 22 8V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V8C2 6.9 2.9 6 4 6H10V4C10 2.9 10.9 2 12 2ZM12 4V6H12V4ZM4 8V20H20V8H4ZM12 11C13.66 11 15 12.34 15 14C15 15.66 13.66 17 12 17C10.34 17 9 15.66 9 14C9 12.34 10.34 11 12 11Z"
      fill={color}
    />
  </Svg>
);

const InterestIcon = ({ color = "#4CAF50", size = ICON_SIZE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"
      fill={color}
    />
  </Svg>
);

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalActive,
  totalInterest,
  theme,
}) => (
  <View style={styles.container}>
    <View style={styles.cardRow}>
      <Card
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
        mode="elevated"
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <ActiveLoansIcon color={theme.colors.primary} size={ICON_SIZE} />
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Active Loans
            </Text>
          </View>
          <Text style={[styles.cardAmount, { color: theme.colors.primary }]}>
            ₹{totalActive.toLocaleString()}
          </Text>
        </Card.Content>
      </Card>

      <Card
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
        mode="elevated"
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <InterestIcon color={theme.colors.tertiary} size={ICON_SIZE} />
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Interest Earned
            </Text>
          </View>
          <Text style={[styles.cardAmount, { color: theme.colors.tertiary }]}>
            ₹{totalInterest.toFixed(2)}
          </Text>
        </Card.Content>
      </Card>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 16,
    paddingBottom: 8, // Reduced for better flow with minimalistic tabs
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  cardContent: {
    padding: CARD_PADDING,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    marginLeft: 8,
    fontWeight: "500",
  },
  cardAmount: {
    fontSize: 24,
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
  },
});
