import { router } from "expo-router";
import HomeScreen from "../../components/screens/HomeScreen";
import { JSX } from "react";

interface NavigationParams {
    loan?: unknown;
    [key: string]: unknown;
}

interface Navigation {
    navigate: (screen: string, params?: NavigationParams) => void;
}

export default function Home(): JSX.Element {
    return (
        <HomeScreen
            navigation={{
                navigate: (screen: string, params?: NavigationParams) => {
                    if (screen === "LoanDetails" && params?.loan) {
                        router.push({
                            pathname: "/loan-details",
                            params: { loan: JSON.stringify(params.loan) },
                        });
                    }
                },
            } as Navigation}
        />
    );
}
