"use client";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Card, SegmentedButtons, Text } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";

type TimeRange = "week" | "month" | "year";

// Shared card/section padding for visual consistency
const cardPadding = 12;
const cardMargin = 8;
const cardHMargin = 16;

export default function StatsScreen() {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width - 30; // padding

  // Example data for charts
  const interestData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [120, 150, 180, 200, 220, 250],
        color: () => theme.colors.primary,
        strokeWidth: 2,
      },
    ],
  };
  const pieData = [
    {
      name: "Active",
      population: 17500,
      color: theme.colors.primary,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 14,
    },
    {
      name: "Paid",
      population: 1500,
      color: theme.colors.secondary,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 14,
    },
    {
      name: "Overdue",
      population: 2500,
      color: theme.colors.error,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 14,
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardHMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Loan Summary
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash-plus"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.statValue, { color: theme.colors.onSurface }]}
              >
                ₹17,500
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Active Loans
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash-check"
                size={24}
                color={theme.colors.secondary}
              />
              <Text
                style={[styles.statValue, { color: theme.colors.onSurface }]}
              >
                ₹1,500
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Paid Loans
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash-remove"
                size={24}
                color={theme.colors.error}
              />
              <Text
                style={[styles.statValue, { color: theme.colors.onSurface }]}
              >
                ₹2,500
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Overdue
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardHMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Interest Earned
          </Text>
          <View
            style={[
              styles.chartPlaceholder,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text
              style={[
                styles.chartPlaceholderText,
                { color: theme.colors.primary },
              ]}
            >
              ₹875
            </Text>
            <Text
              style={[
                styles.chartSubtext,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Total Interest
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardHMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Upcoming Payments
          </Text>
          <View style={styles.paymentItem}>
            <View>
              <Text
                style={[styles.paymentName, { color: theme.colors.onSurface }]}
              >
                John Smith
              </Text>
              <Text
                style={[
                  styles.paymentDate,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Due: May 15, 2025
              </Text>
            </View>
            <Text
              style={[styles.paymentAmount, { color: theme.colors.primary }]}
            >
              ₹500
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
          <View style={styles.paymentItem}>
            <View>
              <Text
                style={[styles.paymentName, { color: theme.colors.onSurface }]}
              >
                Sarah Johnson
              </Text>
              <Text
                style={[
                  styles.paymentDate,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Due: May 20, 2025
              </Text>
            </View>
            <Text
              style={[styles.paymentAmount, { color: theme.colors.primary }]}
            >
              ₹250
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
          <View style={styles.paymentItem}>
            <View>
              <Text
                style={[styles.paymentName, { color: theme.colors.onSurface }]}
              >
                Michael Brown
              </Text>
              <Text
                style={[
                  styles.paymentDate,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Due: June 5, 2025
              </Text>
            </View>
            <Text
              style={[styles.paymentAmount, { color: theme.colors.primary }]}
            >
              ₹1,000
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardHMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Interest Earned (Last 6 Months)
          </Text>
          <View style={{ width: "100%", overflow: "hidden", borderRadius: 8 }}>
            <LineChart
              data={interestData}
              width={screenWidth - cardPadding * 2} // ensure chart fits inside card
              height={180}
              chartConfig={{
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                color: () => theme.colors.primary,
                labelColor: () => theme.colors.onSurfaceVariant,
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={{ borderRadius: 8, marginVertical: 8 }}
            />
          </View>
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardHMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Loan Distribution
          </Text>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={160}
            chartConfig={{
              color: () => theme.colors.primary,
              labelColor: () => theme.colors.onSurface,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"-15"}
            absolute
            style={{ marginVertical: 8 }}
          />
        </Card.Content>
      </Card>

      <Card
        style={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: cardHMargin,
          marginTop: cardMargin,
          marginBottom: cardMargin,
          padding: cardPadding,
          borderRadius: 16,
          elevation: 3,
        }}
      >
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Analysis & Insights
          </Text>
          <View style={styles.analysisRow}>
            <MaterialCommunityIcons
              name="account-star"
              size={28}
              color={theme.colors.primary}
              style={{ marginRight: 12 }}
            />
            <Text
              style={[styles.analysisText, { color: theme.colors.onSurface }]}
            >
              Top Borrower:{" "}
              <Text style={{ fontWeight: "bold" }}>John Smith</Text>
            </Text>
          </View>
          <View style={styles.analysisRow}>
            <MaterialCommunityIcons
              name="trending-up"
              size={28}
              color={theme.colors.secondary}
              style={{ marginRight: 12 }}
            />
            <Text
              style={[styles.analysisText, { color: theme.colors.onSurface }]}
            >
              Repayment Rate: <Text style={{ fontWeight: "bold" }}>92%</Text>
            </Text>
          </View>
          <View style={styles.analysisRow}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={28}
              color={theme.colors.error}
              style={{ marginRight: 12 }}
            />
            <Text
              style={[styles.analysisText, { color: theme.colors.onSurface }]}
            >
              Overdue Trend: <Text style={{ fontWeight: "bold" }}>Stable</Text>
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  timeRangeContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    borderRadius: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    marginTop: 4,
  },
  chartPlaceholder: {
    height: 200,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chartPlaceholderText: {
    fontSize: 32,
    fontFamily: "Roboto-Bold",
  },
  chartSubtext: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginTop: 8,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  paymentName: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
  },
  paymentDate: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    marginTop: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
  },
  divider: {
    height: 1,
  },
  spacer: {
    height: 20,
  },
  analysisRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  analysisText: {
    fontSize: 15,
    fontFamily: "Roboto-Regular",
  },
});
