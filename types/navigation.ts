import type { NavigatorScreenParams } from "@react-navigation/native";
import type { Loan } from "./loan";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  LoanDetails: { loan: Loan };
  AddLoan: undefined;
};

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
  Profile: undefined;
};

export type HomeScreenNavigationProp = {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
};

export type LoanDetailsScreenNavigationProp = {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
  route: {
    params: {
      loan: Loan;
    };
  };
};

export type ProfileScreenNavigationProp = {
  navigation: {
    navigate: (screen: string) => void;
    reset: (params: { index: number; routes: { name: string }[] }) => void;
  };
};
