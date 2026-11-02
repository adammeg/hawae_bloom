import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/theme/colors";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row} accessibilityLabel="HawaeMD Patiente">
      <View style={[styles.mark, compact && styles.markCompact]}>
        <Text style={[styles.h, compact && styles.hCompact]}>H</Text>
        <View style={styles.dot} />
      </View>
      {!compact ? (
        <View>
          <Text style={styles.name}>
            Hawae<Text style={styles.nameRose}>MD</Text>
          </Text>
          <Text style={styles.caption}>MON ESPACE SANTÉ</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  markCompact: { width: 36, height: 36, borderRadius: 12 },
  h: { color: colors.paper, fontWeight: "900", fontSize: 21 },
  hCompact: { fontSize: 17 },
  dot: {
    position: "absolute",
    right: 7,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.rose,
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
  name: { color: colors.tealDeep, fontSize: 20, fontWeight: "900", letterSpacing: -0.6 },
  nameRose: { color: colors.rose },
  caption: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 1.4 },
});
