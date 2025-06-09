import React from "react";
import { View } from "react-native";
import { Card, List, Text, TouchableRipple } from "react-native-paper";

interface PaymentHistorySectionProps {
  paymentHistory: any[];
  onAddPayment: () => void;
  theme: any;
}

export const PaymentHistorySection: React.FC<PaymentHistorySectionProps> = ({
  paymentHistory,
  onAddPayment,
  theme,
}) => (
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Roboto-Bold",
            color: theme.colors.onSurface,
          }}
        >
          Payment History
        </Text>
        <TouchableRipple onPress={onAddPayment} borderless>
          <Text style={{ color: theme.colors.primary, fontSize: 24 }}>＋</Text>
        </TouchableRipple>
      </View>
      {paymentHistory.map((payment) => (
        <List.Item
          key={payment.id}
          title={`₹${payment.amount.toLocaleString()}`}
          description={`Method: ${payment.method}`}
          right={(props) => (
            <Text {...props} style={{ color: theme.colors.onSurfaceVariant }}>
              {new Date(payment.date).toLocaleDateString()}
            </Text>
          )}
          style={{ paddingLeft: 0 }}
          titleStyle={{
            fontFamily: "Roboto-Medium",
            color: theme.colors.onSurface,
          }}
          descriptionStyle={{
            fontFamily: "Roboto-Regular",
            color: theme.colors.onSurfaceVariant,
          }}
        />
      ))}
    </Card.Content>
  </Card>
);
