import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { Card, Chip, Text } from "react-native-paper";
import { Path, Svg } from "react-native-svg";
import type { Loan, LoanStatus } from "../types/loan";

interface LoanCardProps {
  loan: Loan;
  onPress?: () => void;
  calculateInterestEarned: (loan: Loan) => number;
  getStatusColor: (status: LoanStatus) => string;
  theme: any;
}

// Professional design constants
const CARD_PADDING = 20;
const CARD_MARGIN = 16;
const BORDER_RADIUS = 16;
const DIVIDER_HEIGHT = 1;
const ICON_SIZE = 18;
const SMALL_ICON_SIZE = 16;

const InterestIcon = ({ color = "#4CAF50", size = ICON_SIZE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
      fill={color}
    />
  </Svg>
);

const CalendarIcon = ({ color = "#2196F3", size = SMALL_ICON_SIZE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"
      fill={color}
    />
  </Svg>
);

const RupeesIcon = ({ color = "#388E3C", size = ICON_SIZE }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 10 16"
    fill="none"
    accessibilityLabel="Indian Rupee Icon"
  >
    <Path
      d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z"
      fill={color}
    />
  </Svg>
);
export const LoanCard: React.FC<LoanCardProps> = ({
  loan,
  onPress,
  calculateInterestEarned,
  getStatusColor,
  theme,
}) => {
  const interestEarned = calculateInterestEarned(loan);

  return (
    <Animatable.View animation="fadeInUp" duration={500} useNativeDriver>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.touchableContainer}
      >
        <Card
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
            loan.status === "paid" && styles.paidCard,
          ]}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.borrowerInfo}>
                <Text
                  style={[
                    styles.borrowerName,
                    { color: theme.colors.onSurface },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {loan.borrowerName}
                </Text>
                <View style={styles.dateContainer}>
                  <CalendarIcon
                    color={theme.colors.onSurfaceVariant}
                    size={SMALL_ICON_SIZE}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {new Date(loan.startDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <Chip
                textStyle={[
                  styles.chipText,
                  {
                    color:
                      loan.status === "active"
                        ? theme.colors.onPrimary
                        : theme.colors.onSecondary,
                  },
                ]}
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(loan.status) },
                ]}
                compact
              >
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </Chip>
            </View>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <View style={styles.amountContainer}>
                <RupeesIcon color={theme.colors.primary} size={ICON_SIZE} />
                <Text
                  style={[styles.amountText, { color: theme.colors.primary }]}
                >
                  {loan.amount.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.outlineVariant },
              ]}
            />

            {/* Details Section */}
            <View style={styles.detailsSection}>
              <View style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <InterestIcon
                    color={theme.colors.secondary}
                    size={SMALL_ICON_SIZE}
                  />
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Interest Rate
                  </Text>
                </View>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {loan.interestRate}%{" "}
                  {loan.interestRateType === "yearly" ? "/yr" : "/mo"}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <InterestIcon
                    color={theme.colors.tertiary}
                    size={SMALL_ICON_SIZE}
                  />
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Interest Earned
                  </Text>
                </View>
                <Text
                  style={[
                    styles.detailValue,
                    styles.earnedValue,
                    { color: theme.colors.tertiary },
                  ]}
                >
                  ₹{interestEarned.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    borderRadius: BORDER_RADIUS,
    marginBottom: CARD_MARGIN,
    marginHorizontal: 12,
  },
  card: {
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
  paidCard: {
    opacity: 0.75,
  },
  cardContent: {
    padding: CARD_PADDING,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  borrowerInfo: {
    flex: 1,
    marginRight: 12,
  },
  borrowerName: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
    marginBottom: 8,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginLeft: 6,
  },
  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    elevation: 2,
  },
  chipText: {
    fontFamily: "Roboto-Medium",
    fontSize: 12,
    fontWeight: "600",
  },
  amountSection: {
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountText: {
    fontSize: 24,
    fontFamily: "Roboto-Bold",
    marginLeft: 8,
    fontWeight: "700",
  },
  divider: {
    height: DIVIDER_HEIGHT,
    marginVertical: 16,
    borderRadius: 1,
  },
  detailsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Roboto-Medium",
    marginLeft: 6,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    fontWeight: "600",
  },
  earnedValue: {
    textAlign: "right",
  },
});
