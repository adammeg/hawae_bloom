import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { LoadingView } from "@/components/ui";
import { useAuth } from "@/src/state/auth-context";
import { useCycle } from "@/src/state/cycle-context";
import { usePreferences } from "@/src/state/preferences-context";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";

const icons = {
  index: ["home-outline", "home"],
  cycle: ["calendar-outline", "calendar"],
  symptoms: ["pulse-outline", "pulse"],
  appointments: ["time-outline", "time"],
  messages: ["chatbubble-outline", "chatbubble"],
  "sexual-health": ["female-outline", "female"],
  doctors: ["medkit-outline", "medkit"],
  tips: ["sparkles-outline", "sparkles"],
  profile: ["person-outline", "person"],
} as const;

export default function TabsLayout() {
  const auth = useAuth();
  const cycle = useCycle();
  const { t, resolvedTheme } = usePreferences();
  const patientData = usePatientData();

  if (!auth.hydrated || !cycle.hydrated || !patientData.hydrated) return <LoadingView />;
  if (!auth.user) return <Redirect href="/auth" />;
  if (!cycle.settings.onboardingComplete) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [styles.bar, resolvedTheme === "dark" && styles.barDark],
        tabBarIcon: ({ color, focused }) => {
          const pair = icons[route.name as keyof typeof icons] ?? icons.index;
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons name={pair[focused ? 1 : 0]} size={20} color={focused ? colors.teal : color} />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: t("home") }} />
      <Tabs.Screen name="cycle" options={{ title: t("followUp") }} />
      <Tabs.Screen name="symptoms" options={{ title: t("journal") }} />
      <Tabs.Screen name="appointments" options={{ title: t("appointments") }} />
      <Tabs.Screen name="messages" options={{ title: t("messages") }} />
      <Tabs.Screen name="sexual-health" options={{ title: t("sexology") }} />
      <Tabs.Screen name="doctors" options={{ href: null }} />
      <Tabs.Screen name="tips" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 74,
    paddingTop: 8,
    paddingBottom: 9,
    backgroundColor: colors.paper,
    borderTopColor: colors.border,
  },
  barDark: { backgroundColor: "#173536", borderTopColor: "#29494A" },
  label: { fontSize: 8, fontWeight: "800" },
  iconWrap: { width: 32, height: 27, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  iconWrapActive: { backgroundColor: colors.tealSoft },
});
