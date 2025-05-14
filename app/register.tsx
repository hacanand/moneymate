import { router } from "expo-router";
import RegisterScreen from "../components/screens/RegisterScreen";

export default function Register() {
  return (
    <RegisterScreen
      navigation={{
        navigate: (screen: string) => {
          if (screen === "Login") {
            router.push("/");
          }
        },
      }}
    />
  );
}
