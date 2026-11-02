import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "@/components/brand";
import { ActionButton, Card, DecorativeBackdrop, Eyebrow, IconBadge, Page, SectionTitle } from "@/components/ui";
import { CARE_MODE_CONTENT, tipsForMode } from "@/src/data/care-content";
import { daysBetween, formatShortDate, fromIsoDate, getNextPeriodStart } from "@/src/lib/dates";
import { pregnancyProgress } from "@/src/lib/care-timeline";
import { isReminderDueOn, localDateKey } from "@/src/lib/reminders";
import { useCycle, type CycleSettings } from "@/src/state/cycle-context";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";

export default function HomeScreen() {
  const { settings } = useCycle();
  const { data, toggleReminder } = usePatientData();
  const displayName = settings.firstName || "vous";
  const modeContent = CARE_MODE_CONTENT[settings.careMode];
  const tips = tipsForMode(settings.careMode, settings.pregnancyTrimester);
  const featuredTip = tips.find((tip) => tip.featured) ?? tips[0];
  const nextAppointment = data.appointments.filter((item) => item.status === "upcoming" && new Date(item.startsAt).getTime() > Date.now()).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const todayKey = localDateKey();
  const todayReminders = data.reminders.filter((item) => isReminderDueOn(item)).sort((a, b) => a.time.localeCompare(b.time));
  const remainingReminders = todayReminders.filter((item) => item.lastCompletedDate !== todayKey).length;
  const dayLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topbar}>
            <BrandMark />
            <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir mon profil" onPress={() => router.push("/(tabs)/profile")} style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
            </Pressable>
          </View>

          <View style={styles.welcome}>
            <Eyebrow>BONJOUR {displayName.toUpperCase()}</Eyebrow>
            <Text style={styles.title}>{modeContent.title.split(",")[0]},{`\n`}<Text style={styles.titleRose}>{modeContent.title.split(",").slice(1).join(",").trim()}</Text></Text>
            <Text style={styles.subtitle}>{modeContent.subtitle}</Text>
          </View>

          <View style={styles.dayBanner}>
            <View style={styles.dayIcon}><Ionicons name="sunny-outline" size={21} color={colors.gold} /></View>
            <View style={styles.dayCopy}><Text style={styles.dayEyebrow}>VOTRE JOURNÉE</Text><Text style={styles.dayTitle}>{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}</Text></View>
            <Text style={styles.dayCount}>{remainingReminders} rappel{remainingReminders > 1 ? "s" : ""}</Text>
          </View>

          <ModeHero settings={settings} />

          <View style={styles.section}>
            <SectionTitle title="Prochain rendez-vous" />
            {nextAppointment ? (
              <Pressable onPress={() => router.push("/(tabs)/appointments")}>
                <Card style={styles.nextAppointment}>
                  <View style={styles.appointmentIcon}><Ionicons name="calendar-outline" size={21} color={colors.roseDeep} /></View>
                  <View style={styles.appointmentCopy}><Text style={styles.appointmentDoctor}>{nextAppointment.doctorName}</Text><Text style={styles.appointmentMeta}>{new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(nextAppointment.startsAt))} · {nextAppointment.clinic}</Text></View>
                  <Ionicons name="chevron-forward" size={18} color={colors.teal} />
                </Card>
              </Pressable>
            ) : <Pressable onPress={() => router.push("/(tabs)/appointments")}><Card style={styles.emptyAppointment}><Text style={styles.emptyAppointmentText}>Aucun rendez-vous à venir · en prendre un</Text></Card></Pressable>}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}><SectionTitle title="Rappels du jour" /><Pressable onPress={() => router.push("/reminders")}><Text style={styles.manageReminders}>Gérer</Text></Pressable></View>
            <Card style={styles.remindersCard}>
              {todayReminders.map((reminder, index) => {
                const completed = reminder.lastCompletedDate === todayKey;
                return (
                <View key={reminder.id}>
                  <Pressable onPress={() => toggleReminder(reminder.id)} style={styles.reminderRow}>
                    <View style={[styles.reminderCheck, completed && styles.reminderCheckDone]}>{completed ? <Ionicons name="checkmark" size={15} color={colors.paper} /> : null}</View>
                    <View style={styles.reminderCopy}><Text style={[styles.reminderTitle, completed && styles.reminderTitleDone]}>{reminder.title}</Text><Text style={styles.reminderTime}>{reminder.time}</Text></View>
                  </Pressable>
                  {index < todayReminders.length - 1 ? <View style={styles.reminderDivider} /> : null}
                </View>
              );})}
              {!todayReminders.length ? <Pressable onPress={() => router.push("/reminders")} style={styles.emptyReminder}><Ionicons name="add-circle-outline" size={19} color={colors.teal} /><Text style={styles.emptyReminderText}>Programmer un rappel</Text></Pressable> : null}
            </Card>
          </View>

          {featuredTip ? (
            <View style={styles.section}>
              <SectionTitle title="Votre repère du jour" />
              <Card style={styles.tipCard}>
                <IconBadge name={settings.careMode === "pma" ? "flask-outline" : settings.careMode === "pregnancy" ? "heart-outline" : "leaf-outline"} tone="rose" />
                <View style={styles.tipBody}>
                  <Text style={styles.tipCategory}>{featuredTip.category}</Text>
                  <Text style={styles.tipTitle}>{featuredTip.title}</Text>
                  <Text style={styles.tipSummary}>{featuredTip.summary}</Text>
                </View>
                <Pressable onPress={() => router.push("/(tabs)/tips")} style={styles.roundArrow}><Ionicons name="arrow-forward" size={17} color={colors.teal} /></Pressable>
              </Card>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="Mes essentiels" />
            <View style={styles.quickGrid}>
              <Pressable onPress={() => router.push("/(tabs)/doctors")} style={styles.quickCard}>
                <IconBadge name="medkit-outline" />
                <Text style={styles.quickTitle}>Trouver une spécialiste</Text>
                <Text style={styles.quickText}>Gynécologie, obstétrique ou fertilité</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/tips")} style={styles.quickCard}>
                <IconBadge name="sparkles-outline" tone="gold" />
                <Text style={styles.quickTitle}>Conseils vérifiés</Text>
                <Text style={styles.quickText}>Des sources officielles adaptées au mode {modeContent.label.toLowerCase()}</Text>
              </Pressable>
            </View>
          </View>

          <Card style={styles.reassurance}>
            <Ionicons name="medical-outline" size={23} color={colors.teal} />
            <View style={styles.reassuranceCopy}>
              <Text style={styles.reassuranceTitle}>Un accompagnement, pas un diagnostic</Text>
              <Text style={styles.reassuranceText}>Votre médecin, sage-femme ou centre de PMA reste votre référence pour toute décision médicale.</Text>
            </View>
          </Card>

          <View style={styles.lastAction}><ActionButton label="Changer mon mode" icon="options-outline" secondary onPress={() => router.push("/(tabs)/profile")} /></View>
        </ScrollView>
      </SafeAreaView>
    </Page>
  );
}

function ModeHero({ settings }: { settings: CycleSettings }) {
  if (settings.careMode === "pregnancy") {
    const progress = pregnancyProgress(settings.lastPeriodStart);
    return (
      <View style={styles.modeHero}>
        <View style={styles.modeIcon}><Ionicons name="heart" size={36} color={colors.roseDeep} /></View>
        <View style={styles.modeCopy}>
          <Text style={styles.modeLabel}>VOTRE REPÈRE ACTUEL</Text>
          <Text style={styles.modeTitle}>{progress.weeks} SA + {progress.extraDays} j · T{progress.trimester}</Text>
          <Text style={styles.modeText}>DPA estimée le {formatShortDate(progress.estimatedDueDate)}.</Text>
          <Pressable onPress={() => router.push("/(tabs)/tips")} style={styles.modeLink}><Text style={styles.modeLinkText}>Voir mon suivi</Text><Ionicons name="arrow-forward" size={15} color={colors.tealSoft} /></Pressable>
        </View>
      </View>
    );
  }

  if (settings.careMode === "pma") {
    return (
      <View style={styles.modeHero}>
        <View style={styles.modeIcon}><Ionicons name="flask" size={36} color={colors.roseDeep} /></View>
        <View style={styles.modeCopy}>
          <Text style={styles.modeLabel}>VOTRE PARCOURS</Text>
          <Text style={styles.modeTitle}>Étape {settings.pmaStage} sur 6</Text>
          <Text style={styles.modeText}>Bilan, consentement, tentative et suivi : gardez des repères fiables.</Text>
          <Pressable onPress={() => router.push("/(tabs)/tips")} style={styles.modeLink}><Text style={styles.modeLinkText}>Voir les étapes</Text><Ionicons name="arrow-forward" size={15} color={colors.tealSoft} /></Pressable>
        </View>
      </View>
    );
  }

  const nextPeriod = getNextPeriodStart(settings.lastPeriodStart, settings.cycleLength);
  const daysUntil = Math.max(0, daysBetween(new Date(), nextPeriod));
  const elapsed = Math.max(0, daysBetween(fromIsoDate(settings.lastPeriodStart), new Date()));
  const cycleDay = (elapsed % settings.cycleLength) + 1;
  return (
    <View style={styles.modeHero}>
      <View style={styles.cycleCircle}><Text style={styles.cycleSmall}>JOUR DU CYCLE</Text><Text style={styles.cycleDay}>{cycleDay}</Text><Text style={styles.cycleMeta}>sur {settings.cycleLength} jours</Text></View>
      <View style={styles.modeCopy}>
        <Text style={styles.modeLabel}>PROCHAINES RÈGLES ESTIMÉES</Text>
        <Text style={styles.modeTitle}>{formatShortDate(nextPeriod)}</Text>
        <Text style={styles.modeText}>Dans environ {daysUntil} jour{daysUntil > 1 ? "s" : ""}.</Text>
        <Pressable onPress={() => router.push("/(tabs)/cycle")} style={styles.modeLink}><Text style={styles.modeLinkText}>Voir mon calendrier</Text><Ionicons name="arrow-forward" size={15} color={colors.tealSoft} /></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 34 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 },
  avatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.blush },
  avatarText: { color: colors.roseDeep, fontSize: 17, fontWeight: "900" },
  welcome: { marginTop: 30 },
  title: { marginTop: 8, color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -1 },
  titleRose: { color: colors.roseDeep },
  subtitle: { marginTop: 10, color: colors.inkSoft, fontSize: 13, lineHeight: 20 },
  dayBanner: { marginTop: 18, padding: 12, borderRadius: 17, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" },
  dayIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: "#F7F0DE", alignItems: "center", justifyContent: "center" },
  dayCopy: { flex: 1, marginLeft: 10 }, dayEyebrow: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: 0.8 }, dayTitle: { marginTop: 3, color: colors.ink, fontSize: 11, fontWeight: "900" }, dayCount: { color: colors.roseDeep, fontSize: 9, fontWeight: "900" },
  modeHero: { marginTop: 24, minHeight: 180, borderRadius: 28, backgroundColor: colors.tealDeep, padding: 19, flexDirection: "row", alignItems: "center" },
  modeIcon: { width: 106, height: 106, borderRadius: 53, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", borderWidth: 8, borderColor: "rgba(255,255,255,0.12)" },
  cycleCircle: { width: 106, height: 106, borderRadius: 53, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center" },
  cycleSmall: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  cycleDay: { color: colors.roseDeep, fontSize: 35, lineHeight: 39, fontWeight: "900" },
  cycleMeta: { color: colors.inkSoft, fontSize: 9, fontWeight: "700" },
  modeCopy: { flex: 1, paddingLeft: 16 },
  modeLabel: { color: "#BBD2CF", fontSize: 8, fontWeight: "900", letterSpacing: 0.6, lineHeight: 12 },
  modeTitle: { marginTop: 5, color: colors.paper, fontSize: 20, lineHeight: 24, fontWeight: "900" },
  modeText: { marginTop: 6, color: "#D7E8E5", fontSize: 10, lineHeight: 15 },
  modeLink: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  modeLinkText: { color: colors.tealSoft, fontSize: 10, fontWeight: "900" },
  section: { marginTop: 27 },
  sectionHeading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }, manageReminders: { marginTop: 3, color: colors.teal, fontSize: 11, fontWeight: "900" },
  nextAppointment: { flexDirection: "row", alignItems: "center", shadowOpacity: 0.04 }, appointmentIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" }, appointmentCopy: { flex: 1, marginLeft: 11 }, appointmentDoctor: { color: colors.ink, fontSize: 12, fontWeight: "900" }, appointmentMeta: { marginTop: 4, color: colors.muted, fontSize: 8, lineHeight: 12 }, emptyAppointment: { alignItems: "center", backgroundColor: colors.tealMist, shadowOpacity: 0 }, emptyAppointmentText: { color: colors.teal, fontSize: 10, fontWeight: "900" },
  remindersCard: { paddingVertical: 5, shadowOpacity: 0.035 }, reminderRow: { minHeight: 56, flexDirection: "row", alignItems: "center" }, reminderCheck: { width: 23, height: 23, borderRadius: 8, borderWidth: 1.5, borderColor: colors.teal, alignItems: "center", justifyContent: "center" }, reminderCheckDone: { backgroundColor: colors.teal }, reminderCopy: { flex: 1, marginLeft: 10 }, reminderTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" }, reminderTitleDone: { color: colors.muted, textDecorationLine: "line-through" }, reminderTime: { marginTop: 3, color: colors.muted, fontSize: 8 }, reminderDivider: { height: 1, backgroundColor: colors.border },
  emptyReminder: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, emptyReminderText: { color: colors.teal, fontSize: 10, fontWeight: "900" },
  tipCard: { flexDirection: "row", alignItems: "center", padding: 14 },
  tipBody: { flex: 1, paddingHorizontal: 12 },
  tipCategory: { color: colors.roseDeep, fontSize: 8, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.55 },
  tipTitle: { marginTop: 4, color: colors.ink, fontSize: 14, fontWeight: "900" },
  tipSummary: { marginTop: 4, color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
  roundArrow: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.tealMist, alignItems: "center", justifyContent: "center" },
  quickGrid: { flexDirection: "row", gap: 11 },
  quickCard: { flex: 1, backgroundColor: colors.paper, borderRadius: 21, borderWidth: 1, borderColor: colors.border, padding: 15, minHeight: 158 },
  quickTitle: { marginTop: 15, color: colors.ink, fontSize: 13, fontWeight: "900", lineHeight: 18 },
  quickText: { marginTop: 5, color: colors.muted, fontSize: 10, lineHeight: 15 },
  reassurance: { marginTop: 24, flexDirection: "row", alignItems: "center", backgroundColor: colors.tealMist, shadowOpacity: 0 },
  reassuranceCopy: { flex: 1, marginLeft: 12 },
  reassuranceTitle: { color: colors.tealDeep, fontSize: 12, fontWeight: "900" },
  reassuranceText: { marginTop: 3, color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
  lastAction: { marginTop: 15 },
});
