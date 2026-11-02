import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton, Card, DecorativeBackdrop, Eyebrow, LoadingView, Page } from "@/components/ui";
import { cancelHealthReminder, enableLocalNotifications, scheduleHealthReminder } from "@/src/lib/notifications";
import { formatFrenchInputDate, localDateKey, parseFrenchDate, recurrenceDetail, REMINDER_FREQUENCY_LABELS, REMINDER_TYPE_LABELS, reminderDateTime } from "@/src/lib/reminders";
import { useAuth } from "@/src/state/auth-context";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";
import type { DailyReminder, ReminderFrequency, ReminderType } from "@/src/types/patient";

const TYPES: Array<{ value: ReminderType; icon: "calendar-outline" | "medical-outline" | "scan-outline" | "flask-outline" | "notifications-outline" }> = [
  { value: "medication", icon: "medical-outline" },
  { value: "appointment", icon: "calendar-outline" },
  { value: "ultrasound", icon: "scan-outline" },
  { value: "lab", icon: "flask-outline" },
  { value: "custom", icon: "notifications-outline" },
];
const FREQUENCIES: ReminderFrequency[] = ["once", "daily", "weekly", "monthly"];

export default function RemindersScreen() {
  const auth = useAuth();
  const { data, addReminder, updateReminder, deleteReminder, setNotificationsEnabled } = usePatientData();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const [type, setType] = useState<ReminderType>("medication");
  const [frequency, setFrequency] = useState<ReminderFrequency>("daily");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState("09:00");
  const [date, setDate] = useState(formatFrenchInputDate(tomorrow));
  const [saving, setSaving] = useState(false);

  if (!auth.hydrated) return <LoadingView />;
  if (!auth.user) return <Redirect href="/auth" />;

  async function ensureNotifications(): Promise<boolean> {
    if (data.notificationsEnabled) return true;
    const granted = await enableLocalNotifications();
    if (granted) setNotificationsEnabled(true);
    return granted;
  }

  async function saveReminder() {
    const parsedDate = parseFrenchDate(date);
    if (!title.trim()) return Alert.alert("Titre manquant", "Indiquez ce que vous souhaitez rappeler.");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return Alert.alert("Heure incorrecte", "Utilisez le format 24 h, par exemple 08:30.");
    if (!parsedDate) return Alert.alert("Date incorrecte", "Utilisez le format JJ/MM/AAAA.");
    const startDate = localDateKey(parsedDate);
    const draft: DailyReminder = { id: "draft", title: title.trim(), notes: notes.trim() || undefined, time, type, frequency, startDate, enabled: true };
    if (frequency === "once" && reminderDateTime(draft).getTime() <= Date.now()) return Alert.alert("Date passée", "Choisissez une date et une heure à venir.");

    setSaving(true);
    try {
      const { id: _draftId, ...reminderInput } = draft;
      const id = addReminder(reminderInput);
      const reminder = { ...draft, id };
      const notificationsGranted = await ensureNotifications();
      if (notificationsGranted) {
        const notificationId = await scheduleHealthReminder(reminder);
        if (notificationId) updateReminder(id, { notificationId });
      }
      setTitle(""); setNotes("");
      Alert.alert("Rappel ajouté", Platform.OS === "web" ? "Il apparaît dans votre suivi. Les alertes système seront actives sur l’application mobile." : "La notification a été programmée sur ce téléphone.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(reminder: DailyReminder, enabled: boolean) {
    if (!enabled) {
      await cancelHealthReminder(reminder.notificationId);
      updateReminder(reminder.id, { enabled: false, notificationId: undefined });
      return;
    }
    const granted = await ensureNotifications();
    const updated = { ...reminder, enabled: true };
    const notificationId = granted ? await scheduleHealthReminder(updated) : null;
    updateReminder(reminder.id, { enabled: true, notificationId: notificationId ?? undefined });
  }

  function confirmDelete(reminder: DailyReminder) {
    Alert.alert("Supprimer ce rappel ?", reminder.title, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => void cancelHealthReminder(reminder.notificationId).then(() => deleteReminder(reminder.id)) },
    ]);
  }

  return <Page><DecorativeBackdrop /><SafeAreaView style={styles.safe} edges={["top"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.teal} /></Pressable>
    <Eyebrow>MES RAPPELS</Eyebrow>
    <Text style={styles.title}>Votre santé,{`\n`}au bon <Text style={styles.accent}>moment.</Text></Text>
    <Text style={styles.intro}>Programmez vos médicaments, rendez-vous, échographies, analyses et examens. Vous gardez toujours le contrôle.</Text>

    <Text style={styles.sectionLabel}>NOUVEAU RAPPEL</Text>
    <Card>
      <Text style={styles.fieldLabel}>TYPE DE RAPPEL</Text>
      <View style={styles.typeGrid}>{TYPES.map((item) => <Pressable key={item.value} onPress={() => setType(item.value)} style={[styles.typeButton, type === item.value && styles.typeButtonActive]}><Ionicons name={item.icon} size={19} color={type === item.value ? colors.paper : colors.roseDeep} /><Text style={[styles.typeText, type === item.value && styles.typeTextActive]}>{REMINDER_TYPE_LABELS[item.value]}</Text></Pressable>)}</View>
      <Text style={styles.fieldLabel}>INTITULÉ</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder={type === "medication" ? "Ex. Acide folique" : type === "lab" ? "Ex. Prise de sang" : `Ex. ${REMINDER_TYPE_LABELS[type]}`} placeholderTextColor={colors.muted} style={styles.input} />
      <Text style={styles.fieldLabel}>{type === "medication" ? "DOSE OU CONSIGNE (FACULTATIF)" : "NOTE (FACULTATIF)"}</Text>
      <TextInput value={notes} onChangeText={setNotes} placeholder={type === "medication" ? "Ex. 1 comprimé après le repas" : "Lieu, préparation…"} placeholderTextColor={colors.muted} style={styles.input} />
      <Text style={styles.fieldLabel}>FRÉQUENCE</Text>
      <View style={styles.frequencyGrid}>{FREQUENCIES.map((item) => <Pressable key={item} onPress={() => setFrequency(item)} style={[styles.frequencyButton, frequency === item && styles.frequencyActive]}><Text style={[styles.frequencyText, frequency === item && styles.frequencyTextActive]}>{REMINDER_FREQUENCY_LABELS[item]}</Text></Pressable>)}</View>
      <View style={styles.dateRow}><View style={styles.dateField}><Text style={styles.fieldLabel}>DATE DE DÉBUT</Text><TextInput value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" placeholder="JJ/MM/AAAA" placeholderTextColor={colors.muted} style={styles.input} /></View><View style={styles.timeField}><Text style={styles.fieldLabel}>HEURE</Text><TextInput value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" placeholder="09:00" placeholderTextColor={colors.muted} style={styles.input} /></View></View>
      <Text style={styles.scheduleHint}>{frequency === "weekly" ? "Le jour de la semaine est calculé depuis la date de début." : frequency === "monthly" ? "Le jour du mois est calculé depuis la date de début." : "L’alerte utilisera l’heure locale de ce téléphone."}</Text>
      <ActionButton label={saving ? "Programmation…" : "Ajouter le rappel"} icon="notifications-outline" onPress={() => { if (!saving) void saveReminder(); }} />
    </Card>

    <Text style={styles.sectionLabel}>RAPPELS PROGRAMMÉS</Text>
    {data.reminders.length ? data.reminders.map((reminder) => <Card key={reminder.id} style={[styles.reminderCard, !reminder.enabled && styles.reminderPaused]}>
      <View style={styles.reminderIcon}><Ionicons name={TYPES.find((item) => item.value === reminder.type)?.icon ?? "notifications-outline"} size={21} color={colors.roseDeep} /></View>
      <View style={styles.reminderCopy}><Text style={styles.reminderType}>{REMINDER_TYPE_LABELS[reminder.type]}</Text><Text style={styles.reminderTitle}>{reminder.title}</Text>{reminder.notes ? <Text style={styles.reminderNotes}>{reminder.notes}</Text> : null}<Text style={styles.reminderMeta}>{reminder.time} · {recurrenceDetail(reminder)}</Text></View>
      <View style={styles.reminderActions}><Switch value={reminder.enabled} onValueChange={(value) => void toggleEnabled(reminder, value)} trackColor={{ false: colors.border, true: colors.tealSoft }} thumbColor={reminder.enabled ? colors.teal : colors.muted} /><Pressable accessibilityRole="button" accessibilityLabel={`Supprimer ${reminder.title}`} onPress={() => confirmDelete(reminder)} style={styles.delete}><Ionicons name="trash-outline" size={17} color={colors.danger} /></Pressable></View>
    </Card>) : <Card><Text style={styles.empty}>Aucun rappel programmé.</Text></Card>}

    <View style={styles.safety}><Ionicons name="shield-checkmark-outline" size={20} color={colors.teal} /><Text style={styles.safetyText}>Les rappels aident à suivre une prescription, mais ne la remplacent pas. Ne modifiez jamais un traitement sans l’avis de votre professionnelle de santé.</Text></View>
  </ScrollView></SafeAreaView></Page>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20, paddingBottom: 42 }, back: { width: 40, height: 40, marginBottom: 22, borderRadius: 14, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  title: { marginTop: 8, color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: "900" }, accent: { color: colors.roseDeep }, intro: { marginTop: 10, color: colors.inkSoft, fontSize: 12, lineHeight: 19 }, sectionLabel: { marginTop: 24, marginBottom: 9, color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, fieldLabel: { marginTop: 13, marginBottom: 7, color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, typeButton: { minHeight: 57, width: "31%", flexGrow: 1, padding: 8, borderRadius: 14, backgroundColor: colors.roseSoft, borderWidth: 1, borderColor: colors.blush, alignItems: "center", justifyContent: "center", gap: 4 }, typeButtonActive: { backgroundColor: colors.roseDeep, borderColor: colors.roseDeep }, typeText: { color: colors.inkSoft, fontSize: 8, fontWeight: "800", textAlign: "center" }, typeTextActive: { color: colors.paper },
  input: { minHeight: 46, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream, paddingHorizontal: 12, color: colors.ink, fontSize: 12 }, frequencyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, frequencyButton: { width: "47%", flexGrow: 1, minHeight: 39, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, frequencyActive: { backgroundColor: colors.teal, borderColor: colors.teal }, frequencyText: { color: colors.inkSoft, fontSize: 9, fontWeight: "800" }, frequencyTextActive: { color: colors.paper },
  dateRow: { flexDirection: "row", gap: 9 }, dateField: { flex: 1.45 }, timeField: { flex: 0.8 }, scheduleHint: { marginTop: 8, marginBottom: 14, color: colors.muted, fontSize: 8, lineHeight: 12 },
  reminderCard: { marginBottom: 9, flexDirection: "row", alignItems: "center", padding: 13, shadowOpacity: 0.035 }, reminderPaused: { opacity: 0.58 }, reminderIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" }, reminderCopy: { flex: 1, marginHorizontal: 10 }, reminderType: { color: colors.roseDeep, fontSize: 7, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6 }, reminderTitle: { marginTop: 3, color: colors.ink, fontSize: 11, fontWeight: "900" }, reminderNotes: { marginTop: 2, color: colors.inkSoft, fontSize: 8 }, reminderMeta: { marginTop: 4, color: colors.muted, fontSize: 8 }, reminderActions: { alignItems: "center", gap: 4 }, delete: { width: 30, height: 30, alignItems: "center", justifyContent: "center" }, empty: { color: colors.muted, fontSize: 10, textAlign: "center" },
  safety: { marginTop: 16, padding: 14, borderRadius: 17, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "flex-start", gap: 9 }, safetyText: { flex: 1, color: colors.inkSoft, fontSize: 9, lineHeight: 14 },
});
