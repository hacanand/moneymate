import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

interface PaymentProofSectionProps {
  paymentProofUri?: string;
  paymentProofName?: string;
  paymentProofType?: string;
  downloading: boolean;
  onDownload: () => void;
  theme: any;
}

export const PaymentProofSection: React.FC<PaymentProofSectionProps> = ({
  paymentProofUri,
  paymentProofName,
  paymentProofType,
  downloading,
  onDownload,
  theme,
}) => {
  if (!paymentProofUri) return null;
  return (
    <Card
      style={{
        backgroundColor: theme.colors.surface,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
      }}
    >
      <Card.Content>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Roboto-Bold",
            color: theme.colors.onSurface,
          }}
        >
          Other Details
        </Text>
        <View style={{ marginTop: 16 }}>
          <Text
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
          >
            Payment Proof
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MaterialCommunityIcons
              name={
                paymentProofType === "application/pdf"
                  ? "file-pdf-box"
                  : "file-image"
              }
              size={32}
              color={theme.colors.primary}
            />
            <Text
              style={{
                marginLeft: 8,
                color: theme.colors.onSurfaceVariant,
                textDecorationLine: "underline",
              }}
            >
              {paymentProofName || "Payment Proof"}
            </Text>
          </View>
          <Button
            mode="outlined"
            icon={downloading ? undefined : "download"}
            loading={downloading}
            onPress={onDownload}
            style={{ marginTop: 4, alignSelf: "flex-start" }}
            disabled={!paymentProofUri || downloading}
          >
            {downloading ? "Downloading..." : "Download Payment Proof"}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};
