import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { Text } from "react-native-paper";

// Minimalistic design constants
const TAB_CONTAINER_MARGIN = 16;
const TAB_BAR_HEIGHT = 48;
const TAB_BORDER_RADIUS = 12;
const INDICATOR_HEIGHT = 3;

interface LoanTabsProps {
  loanTab: "active" | "paid";
  setLoanTab: (tab: "active" | "paid") => void;
  scrollRef: React.RefObject<any>;
  theme: any;
}

export const LoanTabs: React.FC<LoanTabsProps> = ({
  loanTab,
  setLoanTab,
  scrollRef,
  theme,
}) => (
  <View style={styles.container}>
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outline,
        },
      ]}
    >
      {/* Active Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => {
          setLoanTab("active");
          scrollRef.current?.scrollTo({ x: 0, animated: true });
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                loanTab === "active"
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
              fontWeight: loanTab === "active" ? "600" : "400",
            },
          ]}
        >
          Active
        </Text>
        {loanTab === "active" && (
          <Animatable.View
            animation="fadeInUp"
            duration={200}
            style={[
              styles.activeIndicator,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        )}
      </TouchableOpacity>

      {/* Paid Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => {
          setLoanTab("paid");
          scrollRef.current?.scrollTo({
            x: Dimensions.get("window").width,
            animated: true,
          });
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                loanTab === "paid"
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
              fontWeight: loanTab === "paid" ? "600" : "400",
            },
          ]}
        >
          Paid
        </Text>
        {loanTab === "paid" && (
          <Animatable.View
            animation="fadeInUp"
            duration={200}
            style={[
              styles.activeIndicator,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TAB_CONTAINER_MARGIN,
  },
  tabBar: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontFamily: "Roboto-Medium",
    fontSize: 16,
    textAlign: "center",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_HEIGHT / 2,
  },
});
