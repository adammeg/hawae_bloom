import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/theme/colors";
import type { CareMode } from "@/src/types/content";

const OPTIONS = [
  { value: "cycle", icon: "calendar-outline", title: "Cycle & gynécologie", description: "Règles, prévention et suivi gynécologique" },
  { value: "pregnancy", icon: "heart-outline", title: "Grossesse", description: "Repères et suivi par trimestre" },
  { value: "pma", icon: "flask-outline", title: "Parcours PMA", description: "Bilan, traitement et accompagnement" },
] as const;

export function CareModeSelector({ value, onChange }: { value: CareMode; onChange: (mode: CareMode) => void }) {
  return (
    <View style={styles.list}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <View style={[styles.icon, selected && styles.iconSelected]}>
              <Ionicons name={option.icon} size={21} color={selected ? colors.paper : colors.roseDeep} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.title, selected && styles.titleSelected]}>{option.title}</Text>
              <Text style={styles.description}>{option.description}</Text>
            </View>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioCenter} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 9 },
  option: { minHeight: 72, padding: 11, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream, flexDirection: "row", alignItems: "center" },
  optionSelected: { borderColor: colors.rose, backgroundColor: colors.roseSoft },
  icon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.blush, alignItems: "center", justifyContent: "center" },
  iconSelected: { backgroundColor: colors.roseDeep },
  copy: { flex: 1, marginLeft: 11 },
  title: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  titleSelected: { color: colors.roseDeep },
  description: { marginTop: 3, color: colors.muted, fontSize: 9, lineHeight: 13 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.muted, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: colors.roseDeep },
  radioCenter: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.roseDeep },
});
