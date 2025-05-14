import { router } from "expo-router";
import LoginScreen from "../components/screens/LoginScreen";

export default function Page() {
  return (
    <LoginScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === "Register") {
            router.push("/register");
          }
        },
        reset: (params: { index: number; routes: { name: string }[] }) => {
          if (params.routes[0].name === "Main") {
            router.replace("/(tabs)");
          }
        },
      }}
    />
  );
}
