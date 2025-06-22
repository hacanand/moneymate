"use client";

import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  DataTable,
  Divider,
  FAB,
  Text,
} from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";
import { useLoanStats } from "../../utils/useLoanStats";

// Shared card/section padding for visual consistency
const cardPadding = 12;
const cardMargin = 8;
const cardHMargin = 16;

export default function StatsScreen() {
  const { theme } = useTheme();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const screenWidth = Dimensions.get("window").width - 30; // padding
  const [refreshing, setRefreshing] = useState(false);
  const [showCacheInfo, setShowCacheInfo] = useState(false);

  // Only pass the userId once we know the user is loaded and signed in
  const userId = isUserLoaded && isSignedIn ? user?.id : undefined;

  const { stats, loading, error, refreshStats, lastUpdated, isFromCache } =
    useLoanStats({
      userId: userId || "", // Use empty string if no user
      refreshInterval: 2 * 60 * 1000, // 2 minutes
      autoRefresh: userId ? true : false, // Only auto-refresh if we have a user
    });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshStats();
    } catch (err) {
      Alert.alert("Error", "Failed to refresh statistics");
    } finally {
      setRefreshing(false);
    }
  };

  // Function to toggle cache info visibility
  const toggleCacheInfo = () => {
    setShowCacheInfo(!showCacheInfo);
  };

  // Show loading indicator while user authentication is loading
  if (!isUserLoaded) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Loading authentication...
        </Text>
      </View>
    );
  }

  // Show sign in message if user is not signed in
  if (isUserLoaded && !isSignedIn) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <MaterialCommunityIcons
          name="account-alert"
          size={48}
          color={theme.colors.error}
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Authentication required
        </Text>
        <Text
          style={[
            styles.errorSubText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Please sign in to view your loan statistics
        </Text>
      </View>
    );
  }

  if (loading && !stats) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Loading loan statistics...
        </Text>
        <Text
          style={[
            styles.loadingSubText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Fetching real-time data from database
        </Text>
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={theme.colors.error}
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <Text
          style={[
            styles.errorSubText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Unable to fetch statistics from database
        </Text>
        <Button
          mode="contained"
          onPress={handleRefresh}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  // Ensure we have data before rendering charts
  if (!stats) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <MaterialCommunityIcons
          name="database-off"
          size={48}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          No data available
        </Text>
        <Button
          mode="contained"
          onPress={handleRefresh}
          style={styles.retryButton}
        >
          Load Data
        </Button>
      </View>
    );
  }

  // Prepare chart data from real stats
  const pieData =
    stats?.statusDistribution?.map((item) => ({
      name: item.status,
      population: item.amount,
      color: item.color,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 14,
    })) || [];

  const monthlyInterestData = {
    labels:
      stats?.interestTrends?.slice(-6).map((item) => {
        const date = new Date(item.month);
        return date.toLocaleDateString("en", { month: "short" });
      }) || [],
    datasets: [
      {
        data: stats?.interestTrends
          ?.slice(-6)
          .map((item) => item.totalInterest) || [0],
        color: () => theme.colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const paymentHistoryData = {
    labels:
      stats?.paymentHistory?.slice(-7).map((item) => {
        const date = new Date(item.date);
        return date.toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        });
      }) || [],
    datasets: [
      {
        data: stats?.paymentHistory?.slice(-7).map((item) => item.amount) || [
          0,
        ],
        color: () => theme.colors.secondary,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Last Updated Info */}
        {lastUpdated && (
          <View style={styles.lastUpdatedContainer}>
            <View style={styles.cacheStatusRow}>
              <MaterialCommunityIcons
                name={isFromCache ? "database-check" : "cloud-download"}
                size={16}
                color={
                  isFromCache ? theme.colors.secondary : theme.colors.primary
                }
              />
              <Text
                style={[
                  styles.lastUpdatedText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {isFromCache ? "From cache • " : "Fresh data • "}
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            </View>
            {loading && (
              <View style={styles.loadingIndicatorRow}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.refreshingText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Updating...
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Summary Statistics */}
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
                  ₹
                  {stats?.summary.totalActiveLoanAmount.toLocaleString() || "0"}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Active ({stats?.summary.totalActiveLoans || 0} loans)
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
                  ₹{stats?.summary.totalPaidLoanAmount.toLocaleString() || "0"}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Paid ({stats?.summary.totalPaidLoans || 0} loans)
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
                  ₹
                  {stats?.summary.totalOverdueLoanAmount.toLocaleString() ||
                    "0"}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Overdue ({stats?.summary.totalOverdueLoans || 0} loans)
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Key Metrics */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Key Metrics
            </Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text
                  style={[styles.metricValue, { color: theme.colors.primary }]}
                >
                  ₹{stats?.summary.totalInterestEarned.toFixed(2) || "0"}
                </Text>
                <Text
                  style={[
                    styles.metricLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Total Interest Earned
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text
                  style={[
                    styles.metricValue,
                    { color: theme.colors.secondary },
                  ]}
                >
                  {stats?.summary.repaymentRate.toFixed(1) || "0"}%
                </Text>
                <Text
                  style={[
                    styles.metricLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Repayment Rate
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text
                  style={[styles.metricValue, { color: theme.colors.primary }]}
                >
                  ₹{stats?.summary.averageLoanAmount.toFixed(0) || "0"}
                </Text>
                <Text
                  style={[
                    styles.metricLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Average Loan Size
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Interest Trends Chart */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Interest Earned Trends (Last 6 Months)
            </Text>
            {monthlyInterestData.datasets[0].data.some((val) => val > 0) ? (
              <View
                style={{ width: "100%", overflow: "hidden", borderRadius: 8 }}
              >
                <LineChart
                  data={monthlyInterestData}
                  width={screenWidth - cardPadding * 2}
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
            ) : (
              <View
                style={[
                  styles.noDataContainer,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.noDataText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No interest data available yet
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Payment History Chart */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Recent Payment Activity (Last 7 Days)
            </Text>
            {paymentHistoryData.datasets[0].data.some((val) => val > 0) ? (
              <View
                style={{ width: "100%", overflow: "hidden", borderRadius: 8 }}
              >
                <LineChart
                  data={paymentHistoryData}
                  width={screenWidth - cardPadding * 2}
                  height={180}
                  chartConfig={{
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    color: () => theme.colors.secondary,
                    labelColor: () => theme.colors.onSurfaceVariant,
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: theme.colors.secondary,
                    },
                  }}
                  bezier
                  style={{ borderRadius: 8, marginVertical: 8 }}
                />
              </View>
            ) : (
              <View
                style={[
                  styles.noDataContainer,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.noDataText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No recent payment activity
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Loan Distribution Pie Chart */}
        {pieData.length > 0 && (
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <Text
                style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              >
                Loan Amount Distribution
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
        )}

        {/* Loans Given Per Month */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Loans Given Per Month
            </Text>
            {stats.monthlyData &&
            stats.monthlyData.some((item) => item.loansGiven > 0) ? (
              <View
                style={{ width: "100%", overflow: "hidden", borderRadius: 8 }}
              >
                <BarChart
                  data={{
                    labels: stats.monthlyData.slice(-6).map((item) => {
                      const date = new Date(item.month);
                      return date.toLocaleDateString("en", { month: "short" });
                    }),
                    datasets: [
                      {
                        data: stats.monthlyData
                          .slice(-6)
                          .map((item) => item.loansGiven),
                      },
                    ],
                  }}
                  width={screenWidth - cardPadding * 2}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    color: () => theme.colors.primary,
                    labelColor: () => theme.colors.onSurfaceVariant,
                  }}
                  style={{ borderRadius: 8, marginVertical: 8 }}
                />
              </View>
            ) : (
              <View
                style={[
                  styles.noDataContainer,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.noDataText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No loan data available
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Upcoming Payments Table */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Upcoming Payments
            </Text>
            {stats?.upcomingPayments && stats.upcomingPayments.length > 0 ? (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Borrower</DataTable.Title>
                  <DataTable.Title numeric>Amount</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                </DataTable.Header>
                {stats.upcomingPayments.slice(0, 5).map((payment, index) => (
                  <DataTable.Row key={payment.id}>
                    <DataTable.Cell>
                      <View>
                        <Text
                          style={[
                            styles.borrowerName,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {payment.borrowerName}
                        </Text>
                        <Text
                          style={[
                            styles.dueDate,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text
                        style={[
                          styles.paymentAmount,
                          { color: theme.colors.primary },
                        ]}
                      >
                        ₹{payment.amount.toFixed(0)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="outlined"
                        style={{
                          backgroundColor: payment.isOverdue
                            ? theme.colors.errorContainer
                            : theme.colors.surfaceVariant,
                        }}
                        textStyle={{
                          color: payment.isOverdue
                            ? theme.colors.error
                            : theme.colors.onSurfaceVariant,
                        }}
                      >
                        {payment.isOverdue
                          ? `${payment.daysOverdue} days overdue`
                          : "Due"}
                      </Chip>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            ) : (
              <View
                style={[
                  styles.noDataContainer,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.noDataText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No upcoming payments
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Top Borrowers */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Top Borrowers
            </Text>
            {stats?.topBorrowers && stats.topBorrowers.length > 0 ? (
              stats.topBorrowers.map((borrower, index) => (
                <View key={index}>
                  <View style={styles.borrowerRow}>
                    <View style={styles.borrowerInfo}>
                      <Text
                        style={[
                          styles.borrowerName,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        {borrower.borrowerName}
                      </Text>
                      <Text
                        style={[
                          styles.borrowerDetails,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        Active loans: {borrower.activeLoans} • Repayment:{" "}
                        {borrower.repaymentRate.toFixed(1)}%
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.borrowerAmount,
                        { color: theme.colors.primary },
                      ]}
                    >
                      ₹{borrower.totalBorrowed.toLocaleString()}
                    </Text>
                  </View>
                  {index < stats.topBorrowers.length - 1 && (
                    <Divider style={{ marginVertical: 8 }} />
                  )}
                </View>
              ))
            ) : (
              <View
                style={[
                  styles.noDataContainer,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.noDataText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No borrower data available
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Analysis & Insights */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
                <Text style={{ fontWeight: "bold" }}>
                  {stats?.topBorrowers?.[0]?.borrowerName || "No data"}
                </Text>
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
                Repayment Rate:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {stats?.summary.repaymentRate.toFixed(1) || "0"}%
                </Text>
              </Text>
            </View>
            <View style={styles.analysisRow}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={28}
                color={
                  stats?.summary.totalOverdueLoans > 0
                    ? theme.colors.error
                    : theme.colors.secondary
                }
                style={{ marginRight: 12 }}
              />
              <Text
                style={[styles.analysisText, { color: theme.colors.onSurface }]}
              >
                Overdue Status:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {stats?.summary.totalOverdueLoans > 0
                    ? `${stats.summary.totalOverdueLoans} loans overdue`
                    : "All loans current"}
                </Text>
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Spacer at the bottom for FAB clearance */}
        <View style={styles.spacer} />
        <View style={styles.spacer} />
      </ScrollView>

      {/* Floating refresh button - sticky */}
      <FAB
        icon="refresh"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={refreshStats}
        loading={loading}
        disabled={loading}
      />

      {/* Cache Info Modal - could be implemented if needed */}
      {showCacheInfo && (
        <Card
          style={[
            styles.card,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Cache Information
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Last updated: {lastUpdated?.toLocaleString()}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Data source: {isFromCache ? "Cache" : "Fresh data"}
            </Text>
            <Button
              onPress={toggleCacheInfo}
              mode="text"
              style={{ marginTop: 10 }}
            >
              Hide Details
            </Button>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
  },
  errorSubText: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
  },
  lastUpdatedContainer: {
    padding: 12,
    alignItems: "center",
  },
  cacheStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    marginLeft: 8,
  },
  loadingIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  refreshingText: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    marginLeft: 8,
  },
  card: {
    marginHorizontal: cardHMargin,
    marginVertical: cardMargin,
    padding: cardPadding,
    borderRadius: 16,
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
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    marginTop: 8,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Roboto-Regular",
    marginTop: 4,
    textAlign: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    marginTop: 4,
    textAlign: "center",
  },
  noDataContainer: {
    height: 120,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  borrowerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  borrowerInfo: {
    flex: 1,
  },
  borrowerName: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
  },
  borrowerDetails: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    marginTop: 2,
  },
  borrowerAmount: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
  },
  dueDate: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
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
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    elevation: 6,
    zIndex: 10,
  },
});
