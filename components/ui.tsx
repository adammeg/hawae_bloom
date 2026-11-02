import type { ComponentProps, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, shadows } from "@/src/theme/colors";
import { usePreferences } from "@/src/state/preferences-context";

export function Page({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { resolvedTheme } = usePreferences();
  return <View style={[styles.page, resolvedTheme === "dark" && styles.pageDark, style]}>{children}</View>;
}

export function DecorativeBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.roseOrb} />
      <View style={styles.tealOrb} />
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { resolvedTheme } = usePreferences();
  return <View style={[styles.card, resolvedTheme === "dark" && styles.cardDark, style]}>{children}</View>;
}

export function IconBadge({
  name,
  tone = "teal",
}: {
  name: ComponentProps<typeof Ionicons>["name"];
  tone?: "teal" | "rose" | "gold";
}) {
  const toneColor = tone === "rose" ? colors.rose : tone === "gold" ? colors.gold : colors.teal;
  const backgroundColor = tone === "rose" ? colors.roseSoft : tone === "gold" ? "#F7F0DE" : colors.tealSoft;
  return (
    <View style={[styles.iconBadge, { backgroundColor }]}>
      <Ionicons name={name} size={20} color={toneColor} />
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  icon = "arrow-forward",
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>["name"];
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
      <Ionicons name={icon} size={18} color={secondary ? colors.teal : colors.paper} />
    </Pressable>
  );
}

export function LoadingView() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.rose} />
      <Text style={styles.loadingText}>Votre espace se prépare…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  pageDark: { backgroundColor: "#102526" },
  roseOrb: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.roseSoft,
    top: -120,
    right: -100,
    opacity: 0.82,
  },
  tealOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.tealSoft,
    bottom: 70,
    left: -110,
    opacity: 0.7,
  },
  eyebrow: { color: colors.roseDeep, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", letterSpacing: -0.35 },
  sectionAction: { color: colors.teal, fontSize: 12, fontWeight: "800" },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.card,
  },
  cardDark: { backgroundColor: "#173536", borderColor: "#29494A" },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    minHeight: 48,
    borderRadius: 15,
    paddingHorizontal: 17,
    backgroundColor: colors.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  buttonSecondary: { backgroundColor: colors.tealMist, borderWidth: 1, borderColor: colors.tealSoft },
  buttonText: { color: colors.paper, fontSize: 14, fontWeight: "800" },
  buttonTextSecondary: { color: colors.teal },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  loading: { flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: colors.inkSoft, fontSize: 13, fontWeight: "700" },
});
