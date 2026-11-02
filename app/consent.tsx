import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DecorativeBackdrop, Eyebrow, LoadingView, Page } from "@/components/ui";
import { useAuth } from "@/src/state/auth-context";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";

const ITEMS = [
  { key: "documents", icon: "document-text-outline", title: "Dossier et documents", description: "Partager les informations en lecture seule et vos pièces jointes." },
  { key: "measurements", icon: "analytics-outline", title: "Mesures", description: "Partager vos courbes de poids, tension, glycémie et bilan hormonal." },
  { key: "symptoms", icon: "pulse-outline", title: "Journal de symptômes", description: "Permettre à l’équipe de consulter vos entrées récentes." },
] as const;

export default function ConsentScreen() {
  const auth = useAuth();
  const { data, updateConsent } = usePatientData();
  if (!auth.hydrated) return <LoadingView />;
  if (!auth.user) return <Redirect href="/auth" />;
  return <Page><DecorativeBackdrop /><SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.teal} /></Pressable><Eyebrow>CONSENTEMENT</Eyebrow><Text style={styles.title}>Vous gardez le{`\n`}contrôle de vos <Text style={styles.accent}>données.</Text></Text><Text style={styles.subtitle}>Chaque autorisation est facultative, modifiable et horodatée. Le partage réel sera activé lors de la connexion à l’API HawaeMD.</Text>
    <Card style={styles.master}><View style={styles.masterIcon}><Ionicons name="people-outline" size={23} color={colors.teal} /></View><View style={styles.copy}><Text style={styles.itemTitle}>Autoriser mon équipe de soins</Text><Text style={styles.itemDescription}>Active le cadre général de partage.</Text></View><Switch value={data.consent.careTeam} onValueChange={(careTeam) => updateConsent({ careTeam })} trackColor={{ false: colors.border, true: colors.tealSoft }} thumbColor={data.consent.careTeam ? colors.teal : colors.muted} /></Card>
    <Text style={styles.sectionLabel}>DONNÉES PARTAGÉES</Text>{ITEMS.map((item) => <Card key={item.key} style={[styles.item, !data.consent.careTeam && styles.disabled]}><View style={styles.itemIcon}><Ionicons name={item.icon} size={21} color={colors.roseDeep} /></View><View style={styles.copy}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemDescription}>{item.description}</Text></View><Switch disabled={!data.consent.careTeam} value={data.consent[item.key]} onValueChange={(value) => updateConsent({ [item.key]: value })} trackColor={{ false: colors.border, true: colors.roseSoft }} thumbColor={data.consent[item.key] ? colors.roseDeep : colors.muted} /></Card>)}
    <View style={styles.audit}><Ionicons name="time-outline" size={17} color={colors.teal} /><Text style={styles.auditText}>{data.consent.updatedAt ? `Dernière modification : ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.consent.updatedAt))}` : "Aucun consentement enregistré pour le moment."}</Text></View>
    <Card style={styles.notice}><Ionicons name="shield-checkmark-outline" size={22} color={colors.teal} /><Text style={styles.noticeText}>Retirer un consentement empêche les nouveaux partages. Les données déjà intégrées à un dossier médical peuvent rester soumises aux obligations légales de conservation.</Text></Card>
  </ScrollView></SafeAreaView></Page>;
}
const styles = StyleSheet.create({ safe: { flex: 1 }, content: { padding: 20, paddingBottom: 36 }, back: { width: 40, height: 40, marginBottom: 22, borderRadius: 14, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, title: { marginTop: 8, color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: "900" }, accent: { color: colors.roseDeep }, subtitle: { marginTop: 9, color: colors.inkSoft, fontSize: 12, lineHeight: 18 }, master: { marginTop: 20, flexDirection: "row", alignItems: "center", backgroundColor: colors.tealMist }, masterIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.tealSoft, alignItems: "center", justifyContent: "center" }, copy: { flex: 1, marginHorizontal: 11 }, itemTitle: { color: colors.ink, fontSize: 11, fontWeight: "900" }, itemDescription: { marginTop: 3, color: colors.muted, fontSize: 8, lineHeight: 12 }, sectionLabel: { marginTop: 23, marginBottom: 9, color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, item: { marginBottom: 9, flexDirection: "row", alignItems: "center", shadowOpacity: 0.03 }, itemIcon: { width: 41, height: 41, borderRadius: 13, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" }, disabled: { opacity: 0.5 }, audit: { marginTop: 11, padding: 11, borderRadius: 13, backgroundColor: colors.cream, flexDirection: "row", alignItems: "center", gap: 7 }, auditText: { flex: 1, color: colors.inkSoft, fontSize: 8, lineHeight: 12 }, notice: { marginTop: 16, flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.tealMist, shadowOpacity: 0 }, noticeText: { flex: 1, marginLeft: 10, color: colors.inkSoft, fontSize: 9, lineHeight: 14 } });
