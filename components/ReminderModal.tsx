import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import Modal from "react-native-modalbox";
import { Button, Text, TextInput } from "react-native-paper";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminderMessage: string;
  setReminderMessage: (v: string) => void;
  onSend: () => void;
  theme: any;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  reminderMessage,
  setReminderMessage,
  onSend,
  theme,
}) => (
  <Modal
    style={[styles.modal, { backgroundColor: theme.colors.surface }]}
    position="center"
    isOpen={isOpen}
    onClosed={onClose}
    backdropPressToClose={false}
    swipeToClose={false}
    animationDuration={200}
    backdrop={true}
    backdropOpacity={0.5}
    coverScreen={true}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={60}
    >
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
          Send Payment Reminder
        </Text>
        {/* <Button onPress={onClose} icon="close" compact>
        Close
      </Button> */}
      </View>
      <View style={styles.modalContent}>
        <TextInput
          label="Message"
          value={reminderMessage}
          onChangeText={setReminderMessage}
          mode="outlined"
          style={[
            styles.messageInput,
            { backgroundColor: theme.colors.surface },
          ]}
          multiline
          numberOfLines={5}
          textColor={theme.colors.onSurface}
        />
      </View>
      <View style={styles.modalActions}>
        <Button
          mode="outlined"
          onPress={onClose}
          style={styles.cancelButton}
          textColor={theme.colors.primary}
        >
          Cancel
        </Button>
        <Button mode="contained" onPress={onSend} style={styles.saveButton}>
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  modal: {
    width: 320,
    maxWidth: "90%",
    height: 300,
    maxHeight: 360,
    borderRadius: 20,
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -150, // Half of height
    marginLeft: -160, // Half of width
  },
  modalHeader: {
    // flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
  },
  modalContent: {
    flex: 1,
  },
  messageInput: {
    height: 120,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#2E7D32",
  },
  container: {
    padding: 20,
    justifyContent: "space-between",
    // No flex: 1 here
  },
});
