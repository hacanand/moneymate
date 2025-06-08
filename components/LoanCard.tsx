import React from "react";
import { TouchableOpacity, View } from "react-native";
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

// Shared card/section padding for visual consistency
const cardPadding = 20;

const InterestIcon = ({ color = "#4CAF50", size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
      fill={color}
    />
  </Svg>
);
const CalendarIcon = ({ color = "#2196F3", size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"
      fill={color}
    />
  </Svg>
);
const RupeesIcon = ({ color = "#388E3C", size = 20 }) => (
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
        style={{ borderRadius: 12 }}
      >
        <Animatable.View
          animation="pulse"
          duration={300}
          iterationCount={1}
          style={{ borderRadius: 12 }}
        >
          <Card
            style={[
              {
                marginBottom: 16,
                borderRadius: 12,
                elevation: 3,
                marginHorizontal: 8,
                backgroundColor: theme.colors.surface,
                padding: cardPadding, // uniform card padding
              },
              loan.status === "paid" && { opacity: 0.7 },
            ]}
            mode="elevated"
          >
            <Card.Content>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={[
                      {
                        fontSize: 18,
                        fontFamily: "Roboto-Bold",
                        flexShrink: 1,
                        marginRight: 8,
                        color: theme.colors.onSurface,
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {loan.borrowerName}
                  </Text>
                </View>
                <Chip
                  textStyle={{
                    color:
                      loan.status === "active"
                        ? theme.colors.onPrimary ||
                          theme.colors.onSurface ||
                          "#222222"
                        : theme.colors.onPrimary || "#FFFFFF",
                    fontFamily: "Roboto-Medium",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                  style={{
                    alignSelf: "flex-start",
                    marginBottom: 8,
                    backgroundColor: getStatusColor(loan.status),
                    borderRadius: 14,
                    height: 28,
                    minWidth: 60,
                    paddingHorizontal: 8,
                    elevation: 1,
                  }}
                  compact
                  accessibilityLabel={
                    loan.status === "paid" ? "Paid loan" : "Active loan"
                  }
                >
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </Chip>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  marginTop: 0,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <RupeesIcon color={theme.colors.primary} size={16} />
                  <Text
                    style={[
                      {
                        fontSize: 18,
                        fontFamily: "Roboto-Bold",
                        marginRight: 8,
                        color: theme.colors.primary,
                        marginLeft: 4,
                      },
                    ]}
                  >
                    {loan.amount.toLocaleString()}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <CalendarIcon
                    color={theme.colors.onSurfaceVariant}
                    size={16}
                  />
                  <Text
                    style={[
                      {
                        fontSize: 14,
                        fontFamily: "Roboto-Regular",
                        alignSelf: "flex-end",
                        color: theme.colors.onSurfaceVariant,
                        marginLeft: 4,
                      },
                    ]}
                  >
                    {new Date(loan.startDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: "rgba(0,0,0,0.1)",
                  marginVertical: 12,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 0,
                  gap: 8,
                  minHeight: 48,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    minWidth: 0,
                    minHeight: 48,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <InterestIcon color={theme.colors.primary} size={16} />
                    <Text
                      style={[
                        {
                          fontSize: 12,
                          fontFamily: "Roboto-Regular",
                          marginBottom: 4,
                          color: theme.colors.onSurfaceVariant,
                          marginLeft: 6,
                        },
                      ]}
                    >
                      Interest Rate
                    </Text>
                  </View>
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-end" }}
                  >
                    <Text
                      style={[
                        {
                          fontSize: 16,
                          fontFamily: "Roboto-Medium",
                          color: theme.colors.onSurface,
                          marginLeft: 4,
                        },
                      ]}
                    >
                      {loan.interestRate}
                    </Text>
                    <Text
                      style={[
                        {
                          fontSize: 12,
                          fontFamily: "Roboto-Regular",
                          color: theme.colors.onSurfaceVariant,
                          marginLeft: 3,
                          marginBottom: 2,
                        },
                      ]}
                    >
                      %
                    </Text>
                    <Text
                      style={[
                        {
                          fontSize: 12,
                          fontFamily: "Roboto-Regular",
                          color: theme.colors.onSurfaceVariant,
                          marginLeft: 2,
                          marginBottom: 2,
                        },
                      ]}
                    >
                      {loan.interestRateType === "yearly" ? "/yr" : "/mo"}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-end",
                    justifyContent: "center",
                    minWidth: 0,
                    minHeight: 48,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                      justifyContent: "flex-end",
                    }}
                  >
                    <InterestIcon color={theme.colors.primary} size={16} />
                    <Text
                      style={[
                        {
                          fontSize: 12,
                          fontFamily: "Roboto-Regular",
                          marginBottom: 4,
                          color: theme.colors.onSurfaceVariant,
                          marginLeft: 6,
                          textAlign: "right",
                        },
                      ]}
                    >
                      Interest Earned
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-end",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Text
                      style={[
                        {
                          fontSize: 16,
                          fontFamily: "Roboto-Medium",
                          color: theme.colors.primary,
                        },
                      ]}
                    >
                      ₹{interestEarned.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>
      </TouchableOpacity>
    </Animatable.View>
  );
};
