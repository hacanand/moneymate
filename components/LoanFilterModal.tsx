import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modalbox";
import { Button, Chip, Text } from "react-native-paper";
import type { LoanStatus } from "../types/loan";

interface LoanFilterModalProps {
  filterModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  statusFilter: "all" | LoanStatus;
  setStatusFilter: (status: "all" | LoanStatus) => void;
  theme: any;
  filterModalRef: React.RefObject<any>;
}

export const LoanFilterModal: React.FC<LoanFilterModalProps> = ({
  filterModalOpen,
  setFilterModalOpen,
  statusFilter,
  setStatusFilter,
  theme,
  filterModalRef,
}) => (
  <Modal
    ref={filterModalRef}
    style={[styles.modal, { backgroundColor: theme.colors.surface }]}
    isOpen={filterModalOpen}
    onClosed={() => setFilterModalOpen(false)}
  >
    <View style={styles.modalHeader}>
      <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
        Filter Loans
      </Text>
      <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
        <MaterialCommunityIcons
          name="close"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    </View>
    <View style={styles.filterOptions}>
      <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>
        Status
      </Text>
      <View style={styles.statusButtons}>
        <Chip
          mode={statusFilter === "all" ? "flat" : "outlined"}
          selected={statusFilter === "all"}
          onPress={() => setStatusFilter("all")}
          style={[
            styles.statusChip,
            statusFilter === "all" && styles.selectedChip,
          ]}
          textStyle={
            statusFilter === "all"
              ? styles.selectedChipText
              : { color: theme.colors.onSurface }
          }
          selectedColor="#FFFFFF"
        >
          All
        </Chip>
        <Chip
          mode={statusFilter === "active" ? "flat" : "outlined"}
          selected={statusFilter === "active"}
          onPress={() => setStatusFilter("active")}
          style={[
            styles.statusChip,
            statusFilter === "active" && styles.selectedChip,
          ]}
          textStyle={
            statusFilter === "active"
              ? styles.selectedChipText
              : { color: theme.colors.onSurface }
          }
          selectedColor="#FFFFFF"
        >
          Active
        </Chip>
        <Chip
          mode={statusFilter === "paid" ? "flat" : "outlined"}
          selected={statusFilter === "paid"}
          onPress={() => setStatusFilter("paid")}
          style={[
            styles.statusChip,
            statusFilter === "paid" && styles.selectedChip,
          ]}
          textStyle={
            statusFilter === "paid"
              ? styles.selectedChipText
              : { color: theme.colors.onSurface }
          }
          selectedColor="#FFFFFF"
        >
          Paid
        </Chip>
      </View>
    </View>
    <View style={styles.modalActions}>
      <Button
        mode="outlined"
        onPress={() => setStatusFilter("all")}
        style={styles.resetButton}
        textColor={theme.colors.primary}
      >
        Reset Filters
      </Button>
      <Button
        mode="contained"
        onPress={() => setFilterModalOpen(false)}
        style={styles.applyButton}
        labelStyle={styles.buttonLabel}
      >
        Apply Filters
      </Button>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modal: {
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
  },
  filterOptions: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
    marginBottom: 10,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusChip: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: "#2E7D32",
  },
  selectedChipText: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Medium",
    fontSize: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#2E7D32",
  },
  buttonLabel: {
    fontFamily: "Roboto-Medium",
  },
});
