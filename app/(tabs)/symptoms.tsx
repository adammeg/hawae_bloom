import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DecorativeBackdrop, Eyebrow, Page } from "@/components/ui";
import { careContextLabel, combinedSymptomAssessment, symptomsForSettings, SYMPTOM_SOURCES, type SymptomCategory } from "@/src/data/symptoms";
import { useCycle } from "@/src/state/cycle-context";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";

const DURATIONS = ["Aujourd’hui", "2–3 jours", "4–7 jours", "> 1 semaine"];

export default function SymptomsScreen() {
  const { settings } = useCycle();
  const { data, addSymptom } = usePatientData();
  const symptoms = useMemo(() => symptomsForSettings(settings), [settings]);
  const categories = useMemo(() => Array.from(new Set(symptoms.map((item) => item.category))), [symptoms]);
  const [category, setCategory] = useState<SymptomCategory | "Tous">("Tous");
  const [selectedId, setSelectedId] = useState(symptoms[0]?.id ?? "");
  const [associatedIds, setAssociatedIds] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [duration, setDuration] = useState(DURATIONS[0]!);
  const [notes, setNotes] = useState("");
  const selected = symptoms.find((item) => item.id === selectedId) ?? symptoms[0]!;
  const visibleSymptoms = category === "Tous" ? symptoms : symptoms.filter((item) => item.category === category);
  const selectedSymptoms = [selected, ...symptoms.filter((item) => associatedIds.includes(item.id) && item.id !== selected.id)];
  const assessment = combinedSymptomAssessment(selectedSymptoms, severity);
  const previewLevel = assessment.level;
  const context = careContextLabel(settings);

  function chooseCategory(next: SymptomCategory | "Tous") {
    setCategory(next);
    const first = next === "Tous" ? symptoms[0] : symptoms.find((item) => item.category === next);
    if (first) setSelectedId(first.id);
  }

  function choosePrimary(id: string) {
    setSelectedId(id);
    setAssociatedIds((current) => current.filter((item) => item !== id));
  }

  function toggleAssociated(id: string) {
    setAssociatedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function save() {
    const { level, reasons } = combinedSymptomAssessment(selectedSymptoms, severity);
    addSymptom({ symptom: selected.label, associatedSymptoms: selectedSymptoms.slice(1).map((item) => item.label), alertReasons: reasons, severity, duration, notes: notes.trim(), careContext: context, guidance: selected.guidance, alertLevel: level });
    setNotes("");
    setAssociatedIds([]);
    if (level === "urgent") {
      const destination = settings.careMode === "pregnancy" ? "votre maternité" : settings.careMode === "pma" ? "votre centre de PMA" : "un service médical";
      Alert.alert("Avis médical immédiat", `${reasons[0] ? `${reasons[0]}\n\n` : ""}Contactez ${destination} ou les urgences sans attendre.`, [
        { text: "Fermer", style: "cancel" },
        { text: "Appeler le 15", onPress: () => void Linking.openURL("tel:15") },
      ]);
    } else if (level === "contact") {
      Alert.alert("Contact médical conseillé", "Contactez votre professionnelle de santé ou votre équipe de suivi, surtout si le symptôme persiste, s’aggrave ou vous inquiète.");
    }
  }

  return <Page><DecorativeBackdrop /><SafeAreaView style={styles.safe} edges={["top"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <Eyebrow>JOURNAL DE SYMPTÔMES</Eyebrow>
    <Text style={styles.title}>Écoutez votre corps,{`\n`}selon votre <Text style={styles.accent}>parcours.</Text></Text>
    <Text style={styles.subtitle}>Les symptômes proposés et les niveaux de vigilance s’adaptent automatiquement à votre mode de suivi.</Text>

    <View style={styles.contextBanner}><View style={styles.contextIcon}><Ionicons name={settings.careMode === "pregnancy" ? "heart-outline" : settings.careMode === "pma" ? "flask-outline" : "calendar-outline"} size={20} color={colors.roseDeep} /></View><View style={styles.contextCopy}><Text style={styles.contextLabel}>CONTEXTE ACTIF</Text><Text style={styles.contextTitle}>{context}</Text><Text style={styles.contextText}>{settings.careMode === "pregnancy" ? `Signes adaptés au ${settings.pregnancyTrimester}${settings.pregnancyTrimester === 1 ? "er" : "e"} trimestre` : settings.careMode === "pma" ? "Signes adaptés à l’étape actuelle du protocole" : "Cycle, douleurs, saignements et santé intime"}</Text></View></View>

    <Card style={styles.formCard}>
      <Text style={styles.label}>CATÉGORIE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>{(["Tous", ...categories] as const).map((item) => <Pressable key={item} onPress={() => chooseCategory(item)} style={[styles.categoryButton, category === item && styles.categoryActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}</ScrollView>

      <Text style={[styles.label, styles.symptomLabel]}>QUE RESSENTEZ-VOUS ?</Text>
      <View style={styles.chips}>{visibleSymptoms.map((symptom) => <Pressable key={symptom.id} onPress={() => choosePrimary(symptom.id)} style={[styles.chip, selected.id === symptom.id && styles.chipActive]}><Text style={[styles.chipText, selected.id === symptom.id && styles.chipTextActive]}>{symptom.label}</Text></Pressable>)}</View>

      <Text style={[styles.label, styles.associatedLabel]}>SIGNES ASSOCIÉS — PLUSIEURS CHOIX POSSIBLES</Text>
      <View style={styles.chips}>{symptoms.filter((item) => item.id !== selected.id).map((symptom) => { const active = associatedIds.includes(symptom.id); return <Pressable key={symptom.id} onPress={() => toggleAssociated(symptom.id)} style={[styles.associatedChip, active && styles.associatedChipActive]}><Ionicons name={active ? "checkmark-circle" : "add-circle-outline"} size={14} color={active ? colors.paper : colors.teal} /><Text style={[styles.associatedText, active && styles.associatedTextActive]}>{symptom.label}</Text></Pressable>; })}</View>

      <View style={[styles.guidance, previewLevel === "urgent" && styles.guidanceUrgent, previewLevel === "contact" && styles.guidanceContact]}>
        <Ionicons name={previewLevel === "urgent" ? "warning" : previewLevel === "contact" ? "alert-circle-outline" : "information-circle-outline"} size={19} color={previewLevel === "urgent" ? colors.danger : previewLevel === "contact" ? colors.gold : colors.teal} />
        <View style={styles.guidanceCopy}><Text style={[styles.guidanceLevel, previewLevel === "urgent" && styles.guidanceLevelUrgent]}>{previewLevel === "urgent" ? "AVIS IMMÉDIAT" : previewLevel === "contact" ? "CONTACT CONSEILLÉ" : "À NOTER DANS LE JOURNAL"}</Text><Text style={styles.guidanceText}>{selected.guidance}</Text>{assessment.reasons.map((reason) => <Text key={reason} style={styles.reasonText}>• {reason}</Text>)}</View>
      </View>

      <View style={styles.severityHeader}><Text style={styles.label}>INTENSITÉ RESSENTIE</Text><Text style={styles.severityValue}>{severity}/10</Text></View>
      <View style={styles.scale}>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <Pressable key={value} onPress={() => setSeverity(value)} style={[styles.scaleItem, value <= severity && styles.scaleItemActive, previewLevel === "urgent" && value <= severity && styles.scaleItemDanger]}><Text style={[styles.scaleText, value <= severity && styles.scaleTextActive]}>{value}</Text></Pressable>)}</View>

      <Text style={[styles.label, styles.durationLabel]}>DEPUIS QUAND ?</Text>
      <View style={styles.durationRow}>{DURATIONS.map((item) => <Pressable key={item} onPress={() => setDuration(item)} style={[styles.durationButton, duration === item && styles.durationActive]}><Text style={[styles.durationText, duration === item && styles.durationTextActive]}>{item}</Text></Pressable>)}</View>

      <Text style={[styles.label, styles.notesLabel]}>PRÉCISIONS FACULTATIVES</Text>
      <TextInput value={notes} onChangeText={setNotes} placeholder="Début, fréquence, quantité, facteurs déclenchants, autres signes…" placeholderTextColor={colors.muted} multiline style={styles.notes} />
      <Pressable onPress={save} style={styles.saveButton}><Text style={styles.saveText}>Ajouter au journal</Text><Ionicons name="checkmark" size={19} color={colors.paper} /></Pressable>
    </Card>

    <View style={styles.safety}><Ionicons name="call-outline" size={20} color={colors.danger} /><Text style={styles.safetyText}>Douleur thoracique, difficulté à respirer, perte de connaissance, hémorragie, douleur brutale intense ou urgence ressentie : appelez le 15/112. Le score d’intensité ne remplace jamais votre ressenti.</Text></View>

    <Text style={styles.sectionLabel}>ENTRÉES RÉCENTES</Text>
    <View style={styles.list}>{data.symptoms.length ? data.symptoms.map((entry) => <Card key={entry.id} style={styles.entryCard}>
      <View style={[styles.entryIcon, entry.alertLevel === "urgent" && styles.entryIconDanger, entry.alertLevel === "contact" && styles.entryIconContact]}><Ionicons name={entry.alertLevel === "none" ? "leaf-outline" : "alert-outline"} size={20} color={entry.alertLevel === "urgent" ? colors.danger : entry.alertLevel === "contact" ? colors.gold : colors.teal} /></View>
      <View style={styles.entryCopy}><View style={styles.entryTop}><Text style={styles.entryTitle}>{entry.symptom}</Text>{entry.alertLevel !== "none" ? <Text style={[styles.alertBadge, entry.alertLevel === "urgent" && styles.alertBadgeUrgent]}>{entry.alertLevel === "urgent" ? "URGENT" : "À CONTACTER"}</Text> : null}</View><Text style={styles.entryMeta}>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(entry.createdAt))} · Intensité {entry.severity}/10{entry.duration ? ` · ${entry.duration}` : ""}</Text>{entry.associatedSymptoms?.length ? <Text style={styles.entryAssociated}>Associé à : {entry.associatedSymptoms.join(", ")}</Text> : null}{entry.careContext ? <Text style={styles.entryContext}>{entry.careContext}</Text> : null}{entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}</View>
    </Card>) : <Text style={styles.empty}>Votre journal est encore vide.</Text>}</View>

    <Text style={styles.sectionLabel}>RÉFÉRENCES DU MODE ACTIF</Text>
    <Card style={styles.sourcesCard}><Text style={styles.sourcesIntro}>Repères construits à partir de recommandations officielles. Ils orientent le niveau de vigilance mais ne posent aucun diagnostic.</Text>{SYMPTOM_SOURCES[settings.careMode].map((source, index) => <View key={source.url}>{index ? <View style={styles.sourceDivider} /> : null}<Pressable onPress={() => void Linking.openURL(source.url)} style={styles.sourceRow}><Ionicons name="open-outline" size={16} color={colors.teal} /><Text style={styles.sourceText}>{source.label}</Text><Ionicons name="chevron-forward" size={15} color={colors.muted} /></Pressable></View>)}</Card>
  </ScrollView></SafeAreaView></Page>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20, paddingBottom: 40 }, title: { marginTop: 8, color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: "900", letterSpacing: -0.8 }, accent: { color: colors.roseDeep }, subtitle: { marginTop: 9, color: colors.inkSoft, fontSize: 12, lineHeight: 18 },
  contextBanner: { marginTop: 17, padding: 13, borderRadius: 18, backgroundColor: colors.roseSoft, borderWidth: 1, borderColor: colors.blush, flexDirection: "row", alignItems: "center" }, contextIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center" }, contextCopy: { flex: 1, marginLeft: 10 }, contextLabel: { color: colors.roseDeep, fontSize: 7, fontWeight: "900", letterSpacing: 0.8 }, contextTitle: { marginTop: 2, color: colors.ink, fontSize: 13, fontWeight: "900" }, contextText: { marginTop: 2, color: colors.inkSoft, fontSize: 8 },
  formCard: { marginTop: 13 }, label: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.9 }, categoryRow: { paddingTop: 9, paddingBottom: 2, gap: 7 }, categoryButton: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream }, categoryActive: { backgroundColor: colors.teal, borderColor: colors.teal }, categoryText: { color: colors.inkSoft, fontSize: 8, fontWeight: "800" }, categoryTextActive: { color: colors.paper }, symptomLabel: { marginTop: 17 },
  chips: { marginTop: 9, flexDirection: "row", flexWrap: "wrap", gap: 7 }, chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border }, chipActive: { backgroundColor: colors.roseSoft, borderColor: colors.rose }, chipText: { color: colors.inkSoft, fontSize: 9, fontWeight: "800" }, chipTextActive: { color: colors.roseDeep },
  associatedLabel: { marginTop: 17 }, associatedChip: { maxWidth: "100%", paddingHorizontal: 9, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.tealMist, borderWidth: 1, borderColor: colors.tealSoft, flexDirection: "row", alignItems: "center", gap: 4 }, associatedChipActive: { backgroundColor: colors.teal, borderColor: colors.teal }, associatedText: { color: colors.teal, fontSize: 8, fontWeight: "800" }, associatedTextActive: { color: colors.paper },
  guidance: { marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "flex-start", gap: 8 }, guidanceContact: { backgroundColor: "#FBF5E7" }, guidanceUrgent: { backgroundColor: "#FFF1F4" }, guidanceCopy: { flex: 1 }, guidanceLevel: { color: colors.teal, fontSize: 7, fontWeight: "900", letterSpacing: 0.7 }, guidanceLevelUrgent: { color: colors.danger }, guidanceText: { marginTop: 4, color: colors.inkSoft, fontSize: 9, lineHeight: 14 }, reasonText: { marginTop: 5, color: colors.ink, fontSize: 8, lineHeight: 12, fontWeight: "800" },
  severityHeader: { marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, severityValue: { color: colors.roseDeep, fontSize: 13, fontWeight: "900" }, scale: { marginTop: 9, flexDirection: "row", gap: 3 }, scaleItem: { flex: 1, height: 32, borderRadius: 8, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" }, scaleItemActive: { backgroundColor: colors.teal }, scaleItemDanger: { backgroundColor: colors.danger }, scaleText: { color: colors.muted, fontSize: 8, fontWeight: "800" }, scaleTextActive: { color: colors.paper },
  durationLabel: { marginTop: 19 }, durationRow: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 6 }, durationButton: { width: "48%", flexGrow: 1, minHeight: 35, borderRadius: 11, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, durationActive: { borderColor: colors.teal, backgroundColor: colors.tealMist }, durationText: { color: colors.muted, fontSize: 8, fontWeight: "800" }, durationTextActive: { color: colors.teal }, notesLabel: { marginTop: 19 }, notes: { marginTop: 7, minHeight: 80, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream, color: colors.ink, fontSize: 11, textAlignVertical: "top" }, saveButton: { marginTop: 13, minHeight: 48, borderRadius: 14, backgroundColor: colors.teal, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, saveText: { color: colors.paper, fontSize: 12, fontWeight: "900" },
  safety: { marginTop: 14, padding: 13, borderRadius: 16, backgroundColor: "#FFF1F4", flexDirection: "row", alignItems: "flex-start", gap: 9 }, safetyText: { flex: 1, color: colors.danger, fontSize: 9, lineHeight: 14, fontWeight: "700" }, sectionLabel: { marginTop: 23, marginBottom: 9, color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, list: { gap: 9 },
  entryCard: { flexDirection: "row", alignItems: "flex-start", shadowOpacity: 0.035 }, entryIcon: { width: 41, height: 41, borderRadius: 13, backgroundColor: colors.tealMist, alignItems: "center", justifyContent: "center" }, entryIconDanger: { backgroundColor: "#FFF1F4" }, entryIconContact: { backgroundColor: "#FBF5E7" }, entryCopy: { flex: 1, marginLeft: 10 }, entryTop: { flexDirection: "row", alignItems: "flex-start", gap: 6 }, entryTitle: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: "900" }, alertBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: "#FBF5E7", color: colors.gold, fontSize: 6, fontWeight: "900" }, alertBadgeUrgent: { backgroundColor: "#FFF1F4", color: colors.danger }, entryMeta: { marginTop: 3, color: colors.muted, fontSize: 8 }, entryAssociated: { marginTop: 4, color: colors.inkSoft, fontSize: 8, lineHeight: 12, fontWeight: "700" }, entryContext: { marginTop: 4, color: colors.roseDeep, fontSize: 8, fontWeight: "800" }, entryNotes: { marginTop: 6, color: colors.inkSoft, fontSize: 10, lineHeight: 15 }, empty: { padding: 18, textAlign: "center", color: colors.muted, fontSize: 11 },
  sourcesCard: { shadowOpacity: 0.03 }, sourcesIntro: { color: colors.inkSoft, fontSize: 9, lineHeight: 14 }, sourceRow: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 8 }, sourceText: { flex: 1, color: colors.teal, fontSize: 9, fontWeight: "800" }, sourceDivider: { height: 1, backgroundColor: colors.border },
});
