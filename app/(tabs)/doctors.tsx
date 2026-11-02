import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DecorativeBackdrop, Eyebrow, Page } from "@/components/ui";
import { listDoctors } from "@/src/data/doctors";
import type { Doctor } from "@/src/types/content";
import { colors } from "@/src/theme/colors";

const FILTERS = ["Tous", "Gynécologie", "Obstétrique", "Fertilité"] as const;

export default function DoctorsScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tous");

  useEffect(() => {
    void listDoctors().then(setDoctors);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return doctors.filter((doctor) => {
      const matchesFilter = filter === "Tous" || doctor.specialty === filter;
      const haystack = `${doctor.name} ${doctor.city} ${doctor.clinic}`.toLocaleLowerCase("fr");
      return matchesFilter && (!normalized || haystack.includes(normalized));
    });
  }, [doctors, filter, query]);

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Eyebrow>ANNUAIRE HAWAEMD</Eyebrow>
          <Text style={styles.title}>Trouvez la spécialiste{`\n`}qui vous <Text style={styles.titleAccent}>correspond.</Text></Text>
          <Text style={styles.subtitle}>Une sélection de professionnelles pour vous accompagner avec écoute et expertise.</Text>

          <View style={styles.search}>
            <Ionicons name="search-outline" size={19} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Nom, ville ou clinique"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              returnKeyType="search"
              accessibilityLabel="Rechercher un médecin"
            />
            {query ? (
              <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel="Effacer la recherche">
                <Ionicons name="close-circle" size={19} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {FILTERS.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === item }}
                onPress={() => setFilter(item)}
                style={[styles.filter, filter === item && styles.filterActive]}
              >
                <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{filtered.length} médecin{filtered.length > 1 ? "s" : ""}</Text>
            <View style={styles.staticBadge}><View style={styles.staticDot} /><Text style={styles.staticText}>APERÇU</Text></View>
          </View>

          <View style={styles.list}>
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
            {!filtered.length ? (
              <Card style={styles.empty}>
                <Ionicons name="search-outline" size={30} color={colors.rose} />
                <Text style={styles.emptyTitle}>Aucun résultat</Text>
                <Text style={styles.emptyText}>Essayez une autre spécialité ou une autre ville.</Text>
              </Card>
            ) : null}
          </View>

          <Card style={styles.apiNote}>
            <Ionicons name="cloud-done-outline" size={22} color={colors.teal} />
            <View style={styles.apiCopy}>
              <Text style={styles.apiTitle}>Prête pour l’annuaire HawaeMD</Text>
              <Text style={styles.apiText}>Les profils sont statiques pour le moment. Ils seront synchronisés dès que l’API sera disponible.</Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Page>
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card style={styles.doctorCard}>
      <View style={styles.doctorTop}>
        <View style={[styles.doctorAvatar, { backgroundColor: `${doctor.accent}20` }]}>
          <Text style={[styles.doctorInitials, { color: doctor.accent }]}>{doctor.initials}</Text>
          <View style={[styles.availableDot, { borderColor: colors.paper }]} />
        </View>
        <View style={styles.doctorIdentity}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.gold} />
            <Text style={styles.rating}>{doctor.rating}</Text>
            <Text style={styles.language}>· {doctor.languages.join(" · ")}</Text>
          </View>
        </View>
      </View>
      <View style={styles.doctorDetails}>
        <View style={styles.detailRow}><Ionicons name="location-outline" size={15} color={colors.teal} /><Text style={styles.detailText}>{doctor.clinic} · {doctor.city}</Text></View>
        <View style={styles.detailRow}><Ionicons name="calendar-outline" size={15} color={colors.roseDeep} /><Text style={styles.availability}>{doctor.nextAvailability}</Text></View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => Alert.alert("Bientôt disponible", "La prise de rendez-vous sera activée avec l’API HawaeMD.")}
        style={({ pressed }) => [styles.bookButton, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.bookText}>Voir le profil</Text>
        <Ionicons name="arrow-forward" size={17} color={colors.paper} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  title: { marginTop: 8, color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -1 },
  titleAccent: { color: colors.roseDeep },
  subtitle: { marginTop: 10, color: colors.inkSoft, fontSize: 13, lineHeight: 20, maxWidth: 340 },
  search: { marginTop: 21, height: 52, borderRadius: 17, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, color: colors.ink, fontSize: 14 },
  filters: { paddingTop: 13, paddingBottom: 4, gap: 8 },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  filterText: { color: colors.inkSoft, fontSize: 11, fontWeight: "800" },
  filterTextActive: { color: colors.paper },
  resultHeader: { marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  staticBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.roseSoft },
  staticDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.rose },
  staticText: { color: colors.roseDeep, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  list: { marginTop: 12, gap: 13 },
  doctorCard: { padding: 15 },
  doctorTop: { flexDirection: "row", alignItems: "center" },
  doctorAvatar: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  doctorInitials: { fontSize: 18, fontWeight: "900" },
  availableDot: { position: "absolute", width: 12, height: 12, borderRadius: 6, backgroundColor: "#35AF79", borderWidth: 2, right: -1, bottom: 2 },
  doctorIdentity: { flex: 1, marginLeft: 12 },
  doctorName: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  specialty: { marginTop: 2, color: colors.teal, fontSize: 11, fontWeight: "800" },
  ratingRow: { marginTop: 5, flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { color: colors.ink, fontSize: 11, fontWeight: "900" },
  language: { flex: 1, color: colors.muted, fontSize: 9 },
  doctorDetails: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 7 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  detailText: { flex: 1, color: colors.inkSoft, fontSize: 11 },
  availability: { color: colors.roseDeep, fontSize: 11, fontWeight: "800" },
  bookButton: { marginTop: 13, height: 43, borderRadius: 14, backgroundColor: colors.teal, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  bookText: { color: colors.paper, fontSize: 12, fontWeight: "900" },
  empty: { alignItems: "center", paddingVertical: 28 },
  emptyTitle: { marginTop: 9, color: colors.ink, fontSize: 15, fontWeight: "900" },
  emptyText: { marginTop: 4, color: colors.muted, fontSize: 11 },
  apiNote: { marginTop: 19, backgroundColor: colors.tealMist, shadowOpacity: 0, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  apiCopy: { flex: 1 },
  apiTitle: { color: colors.tealDeep, fontSize: 12, fontWeight: "900" },
  apiText: { marginTop: 3, color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
});
