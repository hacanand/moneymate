"use client";

import type React from "react";
import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

type CustomAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
  onDismiss?: () => void;
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  onDismiss,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.centeredView}>
        <View
          style={[
            styles.modalView,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.dark ? "#000" : "#000",
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text
            style={[styles.modalText, { color: theme.colors.onSurfaceVariant }]}
          >
            {message}
          </Text>
          <View
            style={[
              styles.buttonContainer,
              {
                borderTopColor: theme.colors.surfaceVariant,
                flexDirection: buttons.length > 2 ? "column" : "row",
              },
            ]}
          >
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  buttons.length > 2 && styles.fullWidthButton,
                  index < buttons.length - 1 &&
                    buttons.length <= 2 && {
                      borderRightColor: theme.colors.surfaceVariant,
                      borderRightWidth: 1,
                    },
                  index < buttons.length - 1 &&
                    buttons.length > 2 && {
                      borderBottomColor: theme.colors.surfaceVariant,
                      borderBottomWidth: 1,
                    },
                ]}
                onPress={() => {
                  button.onPress ? button.onPress() : onDismiss && onDismiss();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color:
                        button.style === "destructive"
                          ? theme.colors.error
                          : button.style === "cancel"
                          ? theme.colors.primary
                          : theme.colors.primary,
                      fontWeight:
                        button.style === "cancel" ||
                        index === buttons.length - 1
                          ? "bold"
                          : "normal",
                    },
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Custom hook to use the alert
export const useCustomAlert = () => {
  const [visible, setVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<
    Omit<CustomAlertProps, "visible">
  >({
    title: "",
    message: "",
    buttons: [{ text: "OK" }],
  });

  const showAlert = (config: Omit<CustomAlertProps, "visible">) => {
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons?.map((button) => ({
        ...button,
        onPress: () => {
          button.onPress && button.onPress();
          hideAlert();
        },
      }))}
      onDismiss={hideAlert}
    />
  );

  return { showAlert, hideAlert, AlertComponent };
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: SCREEN_WIDTH - 80,
    borderRadius: 12,
    overflow: "hidden",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Roboto-Bold",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalText: {
    fontFamily: "Roboto-Regular",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    borderTopWidth: 1,
    flexDirection: "row",
  },
  button: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidthButton: {
    width: "100%",
  },
  buttonText: {
    fontFamily: "Roboto-Medium",
    fontSize: 16,
    textAlign: "center",
  },
});
