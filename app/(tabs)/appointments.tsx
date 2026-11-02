import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DecorativeBackdrop, Eyebrow, Page } from "@/components/ui";
import { scheduleAppointmentReminder } from "@/src/lib/notifications";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";

const AVAILABLE_SLOTS = [
  { days: 7, hour: 9, minute: 30, doctorName: "Dr Lina Haddad", specialty: "Gynécologie", clinic: "Centre HawaeMD" },
  { days: 9, hour: 14, minute: 0, doctorName: "Dr Sarah Benali", specialty: "Gynécologie-obstétrique", clinic: "Cabinet HawaeMD" },
  { days: 12, hour: 11, minute: 15, doctorName: "Dr Myriam El Amrani", specialty: "Médecine de la reproduction", clinic: "Centre Fertilité HawaeMD" },
] as const;

function slotDate(days: number, hour: number, minute: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function AppointmentsScreen() {
  const { data, addAppointment, cancelAppointment } = usePatientData();
  const [booking, setBooking] = useState(false);
  const upcoming = data.appointments.filter((item) => item.status === "upcoming").sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const history = data.appointments.filter((item) => item.status !== "upcoming");

  function book(slot: (typeof AVAILABLE_SLOTS)[number]) {
    const startsAt = slotDate(slot.days, slot.hour, slot.minute).toISOString();
    addAppointment({ doctorName: slot.doctorName, specialty: slot.specialty, clinic: slot.clinic, startsAt });
    if (data.notificationsEnabled) {
      void scheduleAppointmentReminder({ id: `appointment-${Date.now()}`, status: "upcoming", startsAt, doctorName: slot.doctorName, specialty: slot.specialty, clinic: slot.clinic });
    }
    setBooking(false);
    Alert.alert("Rendez-vous confirmé", `${slot.doctorName}\n${formatDate(startsAt)}`);
  }

  function confirmCancellation(id: string) {
    Alert.alert("Annuler ce rendez-vous ?", "Cette action sera transmise au cabinet lorsque l’API sera connectée.", [
      { text: "Conserver", style: "cancel" },
      { text: "Annuler le rendez-vous", style: "destructive", onPress: () => cancelAppointment(id) },
    ]);
  }

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headingRow}>
            <View><Eyebrow>MES RENDEZ-VOUS</Eyebrow><Text style={styles.title}>Votre suivi,{`\n`}bien <Text style={styles.accent}>organisé.</Text></Text></View>
            <Pressable onPress={() => setBooking((value) => !value)} style={styles.addButton}><Ionicons name={booking ? "close" : "add"} size={23} color={colors.paper} /></Pressable>
          </View>

          {booking ? (
            <View style={styles.bookingPanel}>
              <Text style={styles.panelTitle}>Choisir un créneau</Text>
              <Text style={styles.panelHint}>Créneaux de démonstration en attente de l’API HawaeMD.</Text>
              {AVAILABLE_SLOTS.map((slot) => (
                <Pressable key={`${slot.doctorName}-${slot.days}`} onPress={() => book(slot)} style={styles.slot}>
                  <View style={styles.slotIcon}><Ionicons name="calendar-outline" size={19} color={colors.roseDeep} /></View>
                  <View style={styles.slotCopy}><Text style={styles.slotDoctor}>{slot.doctorName}</Text><Text style={styles.slotMeta}>{slot.specialty} · {formatDate(slotDate(slot.days, slot.hour, slot.minute))}</Text></View>
                  <Ionicons name="chevron-forward" size={18} color={colors.teal} />
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>À VENIR</Text>
          <View style={styles.list}>
            {upcoming.length ? upcoming.map((appointment) => (
              <Card key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.dateBadge}><Text style={styles.dateDay}>{new Date(appointment.startsAt).getDate()}</Text><Text style={styles.dateMonth}>{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(appointment.startsAt)).toUpperCase()}</Text></View>
                <View style={styles.appointmentCopy}><Text style={styles.doctor}>{appointment.doctorName}</Text><Text style={styles.specialty}>{appointment.specialty}</Text><Text style={styles.meta}>{formatDate(appointment.startsAt)} · {appointment.clinic}</Text></View>
                <Pressable accessibilityLabel="Annuler le rendez-vous" onPress={() => confirmCancellation(appointment.id)} style={styles.cancel}><Ionicons name="close" size={18} color={colors.danger} /></Pressable>
              </Card>
            )) : <Text style={styles.empty}>Aucun rendez-vous à venir.</Text>}
          </View>

          {history.length ? <><Text style={styles.sectionLabel}>HISTORIQUE</Text>{history.map((appointment) => <Card key={appointment.id} style={styles.historyCard}><Ionicons name={appointment.status === "cancelled" ? "close-circle-outline" : "checkmark-circle-outline"} size={21} color={colors.muted} /><View style={styles.historyCopy}><Text style={styles.historyDoctor}>{appointment.doctorName}</Text><Text style={styles.historyMeta}>{appointment.status === "cancelled" ? "Annulé" : "Terminé"} · {formatDate(appointment.startsAt)}</Text></View></Card>)}</> : null}
        </ScrollView>
      </SafeAreaView>
    </Page>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20, paddingBottom: 36 },
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { marginTop: 7, color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: "900", letterSpacing: -0.8 }, accent: { color: colors.roseDeep },
  addButton: { width: 47, height: 47, borderRadius: 16, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  bookingPanel: { marginTop: 20, padding: 15, borderRadius: 23, backgroundColor: colors.tealDeep }, panelTitle: { color: colors.paper, fontSize: 17, fontWeight: "900" }, panelHint: { marginTop: 4, marginBottom: 10, color: "#BBD2CF", fontSize: 9 },
  slot: { marginTop: 8, padding: 11, borderRadius: 15, backgroundColor: colors.paper, flexDirection: "row", alignItems: "center" }, slotIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" }, slotCopy: { flex: 1, marginLeft: 10 }, slotDoctor: { color: colors.ink, fontSize: 11, fontWeight: "900" }, slotMeta: { marginTop: 3, color: colors.muted, fontSize: 8, lineHeight: 12 },
  sectionLabel: { marginTop: 24, marginBottom: 9, color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, list: { gap: 10 },
  appointmentCard: { flexDirection: "row", alignItems: "center", padding: 13 }, dateBadge: { width: 49, height: 55, borderRadius: 15, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" }, dateDay: { color: colors.roseDeep, fontSize: 20, fontWeight: "900" }, dateMonth: { color: colors.roseDeep, fontSize: 7, fontWeight: "900" }, appointmentCopy: { flex: 1, marginLeft: 11 }, doctor: { color: colors.ink, fontSize: 13, fontWeight: "900" }, specialty: { marginTop: 2, color: colors.teal, fontSize: 9, fontWeight: "800" }, meta: { marginTop: 4, color: colors.muted, fontSize: 8, lineHeight: 12 }, cancel: { width: 35, height: 35, borderRadius: 12, backgroundColor: "#FFF1F4", alignItems: "center", justifyContent: "center" }, empty: { paddingVertical: 18, textAlign: "center", color: colors.muted, fontSize: 11 },
  historyCard: { marginBottom: 9, flexDirection: "row", alignItems: "center", shadowOpacity: 0.03 }, historyCopy: { marginLeft: 10 }, historyDoctor: { color: colors.ink, fontSize: 11, fontWeight: "800" }, historyMeta: { marginTop: 3, color: colors.muted, fontSize: 9 },
});
