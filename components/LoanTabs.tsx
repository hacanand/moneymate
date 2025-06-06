import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";

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
  <View style={styles.loanTabChipsContainer}>
    <Chip
      mode={loanTab === "active" ? "flat" : "outlined"}
      selected={loanTab === "active"}
      onPress={() => {
        setLoanTab("active");
        scrollRef.current?.scrollTo({ x: 0, animated: true });
      }}
      style={[
        styles.loanTabChip,
        loanTab === "active" && styles.selectedLoanTabChip,
      ]}
      textStyle={
        loanTab === "active"
          ? styles.selectedChipText
          : { color: theme.colors.onSurface }
      }
    >
      Active Loans
    </Chip>
    <Chip
      mode={loanTab === "paid" ? "flat" : "outlined"}
      selected={loanTab === "paid"}
      onPress={() => {
        setLoanTab("paid");
        scrollRef.current?.scrollTo({
          x: Dimensions.get("window").width,
          animated: true,
        });
      }}
      style={[
        styles.loanTabChip,
        loanTab === "paid" && styles.selectedLoanTabChip,
      ]}
      textStyle={
        loanTab === "paid"
          ? styles.selectedChipText
          : { color: theme.colors.onSurface }
      }
    >
      Paid Loans
    </Chip>
  </View>
);

const styles = StyleSheet.create({
  loanTabChipsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  loanTabChip: {
    marginHorizontal: 4,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  selectedLoanTabChip: {
    backgroundColor: "#2E7D32",
  },
  selectedChipText: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Medium",
    fontSize: 14,
  },
});
