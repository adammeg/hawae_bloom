import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/theme/colors";

export default function NotFound() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Cette page s’est égarée.</Text>
      <Link href="/" style={styles.link}>Retour à mon espace</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream, gap: 12 },
  title: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  link: { color: colors.teal, fontWeight: "800" },
});
