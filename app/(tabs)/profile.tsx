import { router } from "expo-router";
import ProfileScreen from "../../components/screens/ProfileScreen";

export default function Profile() {
  return (
    <ProfileScreen
      navigation={{
        navigate: () => {},
        reset: (params) => {
          if (params.routes[0].name === "Login") {
            router.replace("/");
          }
        },
      }}
    />
  );
}
