import { router, useLocalSearchParams } from "expo-router";
import LoanDetailsScreen from "../components/screens/LoanDetailsScreen";
import type { Loan } from "../types/loan";

export default function LoanDetails() {
  const params = useLocalSearchParams<{ loan: string }>();
  const loan = params.loan ? (JSON.parse(params.loan as string) as Loan) : null;

  if (!loan) {
    router.back();
    return null;
  }

  return (
    <LoanDetailsScreen
      route={{ params: { loan } }}
      navigation={{
        navigate: () => {},
      }}
    />
  );
}
