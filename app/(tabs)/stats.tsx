"use client";

import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Card, SegmentedButtons } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

type TimeRange = "week" | "month" | "year";

export default function StatsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.timeRangeContainer}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
          buttons={[
            {
              value: "week",
              label: "Week",
            },
            {
              value: "month",
              label: "Month",
            },
            {
              value: "year",
              label: "Year",
            },
          ]}
          style={[
            styles.segmentedButtons,
            { backgroundColor: theme.colors.surface },
          ]}
        />
      </View>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
                $17,500
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
                $1,500
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
                $2,500
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

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
              $875
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

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
              $500
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
              $250
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
              $1,000
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
    borderRadius: 8,
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
});
