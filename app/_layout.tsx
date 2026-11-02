import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { AuthProvider } from "@/src/state/auth-context";
import { CycleProvider } from "@/src/state/cycle-context";
import { PatientDataProvider } from "@/src/state/patient-data-context";
import { PreferencesProvider, usePreferences } from "@/src/state/preferences-context";
import { colors } from "@/src/theme/colors";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PreferencesProvider><RootProviders /></PreferencesProvider>
    </SafeAreaProvider>
  );
}

function RootProviders() {
  const { resolvedTheme } = usePreferences();
  return (
    <AuthProvider>
      <CycleProvider>
        <PatientDataProvider>
          <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: resolvedTheme === "dark" ? "#102526" : colors.cream } }} />
        </PatientDataProvider>
      </CycleProvider>
    </AuthProvider>
  );
}
