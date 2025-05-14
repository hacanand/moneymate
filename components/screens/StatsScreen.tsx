"use client";

 
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Card, SegmentedButtons } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
 

type TimeRange = "week" | "month" | "year";

const StatsScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  return (
    <ScrollView style={styles.container}>
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
          style={styles.segmentedButtons}
        />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Loan Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash-plus"
                size={24}
                color="#2E7D32"
              />
              <Text style={styles.statValue}>$17,500</Text>
              <Text style={styles.statLabel}>Active Loans</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash-check"
                size={24}
                color="#2196F3"
              />
              <Text style={styles.statValue}>$1,500</Text>
              <Text style={styles.statLabel}>Paid Loans</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash-remove"
                size={24}
                color="#F44336"
              />
              <Text style={styles.statValue}>$2,500</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Interest Earned</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>$875</Text>
            <Text style={styles.chartSubtext}>Total Interest</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Upcoming Payments</Text>
          <View style={styles.paymentItem}>
            <View>
              <Text style={styles.paymentName}>John Smith</Text>
              <Text style={styles.paymentDate}>Due: May 15, 2025</Text>
            </View>
            <Text style={styles.paymentAmount}>$500</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paymentItem}>
            <View>
              <Text style={styles.paymentName}>Sarah Johnson</Text>
              <Text style={styles.paymentDate}>Due: May 20, 2025</Text>
            </View>
            <Text style={styles.paymentAmount}>$250</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paymentItem}>
            <View>
              <Text style={styles.paymentName}>Michael Brown</Text>
              <Text style={styles.paymentDate}>Due: June 5, 2025</Text>
            </View>
            <Text style={styles.paymentAmount}>$1,000</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  timeRangeContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: "#FFFFFF",
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
    color: "#757575",
    marginTop: 4,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chartPlaceholderText: {
    fontSize: 32,
    fontFamily: "Roboto-Bold",
    color: "#2E7D32",
  },
  chartSubtext: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    color: "#757575",
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
    color: "#757575",
    marginTop: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    color: "#2E7D32",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  spacer: {
    height: 20,
  },
});

export default StatsScreen;
