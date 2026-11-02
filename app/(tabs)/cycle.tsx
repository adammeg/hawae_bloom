import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton, Card, DecorativeBackdrop, Eyebrow, Page } from "@/components/ui";
import {
  buildMonthGrid,
  formatMonth,
  formatShortDate,
  getCyclePhase,
  toIsoDate,
  type CyclePhase,
} from "@/src/lib/dates";
import { isChronologicalProtocol, pregnancyProgress } from "@/src/lib/care-timeline";
import { formatFrenchInputDate, localDateKey, parseFrenchDate } from "@/src/lib/reminders";
import { useCycle, type CycleSettings } from "@/src/state/cycle-context";
import { colors } from "@/src/theme/colors";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const phaseColors: Record<Exclude<CyclePhase, null>, { bg: string; text: string; border?: string }> = {
  period: { bg: colors.rose, text: colors.paper },
  predicted: { bg: colors.roseSoft, text: colors.roseDeep, border: colors.rose },
  fertile: { bg: colors.tealSoft, text: colors.teal },
  ovulation: { bg: colors.gold, text: colors.paper },
};

export default function CycleScreen() {
  const { settings, markPeriodStart, updateSettings } = useCycle();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(settings.lastPeriodStart);
  const cells = useMemo(() => buildMonthGrid(month), [month]);
  const today = toIsoDate(new Date());

  function moveMonth(direction: -1 | 1) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  if (settings.careMode !== "cycle") {
    return (
      <CareJourney settings={settings} onUpdate={updateSettings} />
    );
  }

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Eyebrow>MON CYCLE</Eyebrow>
          <Text style={styles.title}>Votre calendrier,{"\n"}<Text style={styles.titleAccent}>simple et rassurant.</Text></Text>
          <Text style={styles.subtitle}>Touchez une date pour la sélectionner, puis indiquez le début de vos règles.</Text>

          <Card style={styles.calendarCard}>
            <View style={styles.monthNav}>
              <Pressable accessibilityRole="button" accessibilityLabel="Mois précédent" onPress={() => moveMonth(-1)} style={styles.navButton}>
                <Ionicons name="chevron-back" size={20} color={colors.teal} />
              </Pressable>
              <Text style={styles.monthTitle}>{formatMonth(month)}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Mois suivant" onPress={() => moveMonth(1)} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={20} color={colors.teal} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}
            </View>

            <View style={styles.grid}>
              {cells.map((cell) => {
                const phase = getCyclePhase(cell.date, settings.lastPeriodStart, settings.cycleLength, settings.periodLength);
                const tone = phase ? phaseColors[phase] : null;
                const isSelected = selected === cell.iso;
                const isToday = today === cell.iso;
                const isFuture = cell.iso > today;
                return (
                  <Pressable
                    key={cell.iso}
                    accessibilityRole="button"
                    accessibilityLabel={formatShortDate(cell.date)}
                    accessibilityState={{ selected: isSelected, disabled: isFuture }}
                    disabled={isFuture}
                    onPress={() => setSelected(cell.iso)}
                    style={styles.dayCell}
                  >
                    <View style={[
                      styles.dayCircle,
                      tone && { backgroundColor: tone.bg, borderColor: tone.border ?? tone.bg },
                      isToday && !tone && styles.todayCircle,
                      isSelected && styles.selectedCircle,
                    ]}>
                      <Text style={[
                        styles.dayText,
                        !cell.inMonth && styles.outsideText,
                        isFuture && styles.futureText,
                        tone && { color: tone.text },
                        isToday && !tone && styles.todayText,
                      ]}>{cell.date.getDate()}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.legend}>
              <Legend color={colors.rose} label="Règles" />
              <Legend color={colors.roseSoft} border={colors.rose} label="Prévues" />
              <Legend color={colors.tealSoft} label="Fertilité" />
              <Legend color={colors.gold} label="Ovulation" />
            </View>
          </Card>

          <Card style={styles.selectedCard}>
            <View style={styles.selectedIcon}>
              <Ionicons name="calendar-clear-outline" size={22} color={colors.roseDeep} />
            </View>
            <View style={styles.selectedCopy}>
              <Text style={styles.selectedLabel}>DATE SÉLECTIONNÉE</Text>
              <Text style={styles.selectedDate}>{formatShortDate(selected)}</Text>
            </View>
          </Card>

          <View style={styles.action}>
            <ActionButton
              label="Définir comme début des règles"
              icon="water-outline"
              onPress={() => markPeriodStart(selected)}
            />
          </View>

          <FollowUpLinks />

          <Card style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={21} color={colors.teal} />
            <Text style={styles.infoText}>Les dates de fertilité et d’ovulation sont des estimations. Elles ne remplacent ni une contraception ni un avis médical.</Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Page>
  );
}

function CareJourney({ settings, onUpdate }: { settings: CycleSettings; onUpdate: (patch: Partial<CycleSettings>) => void }) {
  const isPregnancy = settings.careMode === "pregnancy";
  const progress = pregnancyProgress(settings.lastPeriodStart);
  const [pregnancyDate, setPregnancyDate] = useState(formatFrenchInputDate(new Date(`${settings.lastPeriodStart}T12:00:00`)));
  const [protocolType, setProtocolType] = useState(settings.pmaProtocolType);
  const [treatmentDate, setTreatmentDate] = useState(formatFrenchInputDate(new Date(`${settings.pmaTreatmentStart}T12:00:00`)));
  const [procedureDate, setProcedureDate] = useState(formatFrenchInputDate(new Date(`${settings.pmaProcedureDate}T12:00:00`)));
  const [resultDate, setResultDate] = useState(formatFrenchInputDate(new Date(`${settings.pmaResultDate}T12:00:00`)));
  const procedureLabel = protocolType === "iiu" ? "Insémination" : protocolType === "tec" ? "Transfert embryonnaire" : "Ponction / transfert";
  const steps = isPregnancy
    ? [
        ["1er trimestre", "Première consultation, déclaration, bilan initial et première échographie."],
        ["2e trimestre", "Suivi mensuel, deuxième échographie et préparation à la naissance."],
        ["3e trimestre", "Suivi mensuel, troisième échographie, anesthésie et préparation du retour."],
      ]
    : [
        ["1. Protocole à configurer", "Ajoutez les dates prescrites par votre centre pour activer la chronologie."],
        ["2. Traitement programmé", "Le protocole est enregistré et le début du traitement approche."],
        ["3. Traitement en cours", "Traitement et surveillance selon les prescriptions de l’équipe."],
        [`4. ${procedureLabel}`, "Étape procédurale prévue aujourd’hui selon votre calendrier."],
        ["5. Attente du résultat", "Période comprise entre la procédure et le contrôle biologique."],
        ["6. Résultat et suivi", "Le contrôle prévu est atteint ; poursuivez selon les consignes du centre."],
      ];

  function savePregnancyDating() {
    const parsed = parseFrenchDate(pregnancyDate);
    if (!parsed || parsed > new Date() || Date.now() - parsed.getTime() > 320 * 86_400_000) return Alert.alert("Date à vérifier", "Indiquez une date de dernières règles cohérente au format JJ/MM/AAAA.");
    onUpdate({ lastPeriodStart: localDateKey(parsed) });
    Alert.alert("Datation mise à jour", "La semaine d’aménorrhée, le trimestre et la date prévue d’accouchement ont été recalculés.");
  }

  function savePmaTimeline() {
    const treatment = parseFrenchDate(treatmentDate); const procedure = parseFrenchDate(procedureDate); const result = parseFrenchDate(resultDate);
    if (!treatment || !procedure || !result) return Alert.alert("Dates à vérifier", "Utilisez le format JJ/MM/AAAA pour les trois dates.");
    const treatmentIso = localDateKey(treatment); const procedureIso = localDateKey(procedure); const resultIso = localDateKey(result);
    if (!isChronologicalProtocol(treatmentIso, procedureIso, resultIso)) return Alert.alert("Chronologie incorrecte", "La procédure doit suivre le début du traitement et précéder le contrôle biologique.");
    onUpdate({ pmaTimelineEnabled: true, pmaProtocolType: protocolType, pmaTreatmentStart: treatmentIso, pmaProcedureDate: procedureIso, pmaResultDate: resultIso });
    Alert.alert("Protocole synchronisé", "L’étape PMA s’actualisera automatiquement selon ces dates.");
  }

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Eyebrow>{isPregnancy ? "MON SUIVI DE GROSSESSE" : "MON PARCOURS PMA"}</Eyebrow>
          <Text style={styles.title}>{isPregnancy ? "Vos grandes étapes," : "Un parcours lisible,"}{"\n"}<Text style={styles.titleAccent}>{isPregnancy ? "trimestre par trimestre." : "étape par étape."}</Text></Text>
          <Text style={styles.subtitle}>{isPregnancy ? "Le calendrier exact est défini avec votre médecin ou votre sage-femme." : "Chaque parcours est personnalisé par l’équipe de votre centre de PMA."}</Text>

          {isPregnancy ? <Card style={styles.timelineCard}><View style={styles.timelineHero}><View><Text style={styles.timelineEyebrow}>ÂGE GESTATIONNEL CALCULÉ</Text><Text style={styles.timelineValue}>{progress.weeks} SA + {progress.extraDays} j</Text></View><View style={styles.trimesterBadge}><Text style={styles.trimesterBadgeText}>T{progress.trimester}</Text></View></View><Text style={styles.dueDate}>DPA estimée : {formatShortDate(progress.estimatedDueDate)}</Text><Text style={styles.timelineLabel}>PREMIER JOUR DES DERNIÈRES RÈGLES</Text><TextInput value={pregnancyDate} onChangeText={setPregnancyDate} keyboardType="numbers-and-punctuation" placeholder="JJ/MM/AAAA" placeholderTextColor={colors.muted} style={styles.timelineInput} /><Pressable onPress={savePregnancyDating} style={styles.timelineSave}><Text style={styles.timelineSaveText}>Recalculer la grossesse</Text></Pressable></Card> : <Card style={styles.timelineCard}><Text style={styles.timelineTitle}>Synchroniser mon protocole</Text><View style={styles.protocolTypes}>{(["fiv", "tec", "iiu"] as const).map((item) => <Pressable key={item} onPress={() => setProtocolType(item)} style={[styles.protocolType, protocolType === item && styles.protocolTypeActive]}><Text style={[styles.protocolTypeText, protocolType === item && styles.protocolTypeTextActive]}>{item === "fiv" ? "FIV / ICSI" : item.toUpperCase()}</Text></Pressable>)}</View><ProtocolDate label="Début du traitement" value={treatmentDate} onChange={setTreatmentDate} /><ProtocolDate label={procedureLabel} value={procedureDate} onChange={setProcedureDate} /><ProtocolDate label="Contrôle β-hCG / résultat" value={resultDate} onChange={setResultDate} /><Pressable onPress={savePmaTimeline} style={styles.timelineSave}><Text style={styles.timelineSaveText}>{settings.pmaTimelineEnabled ? "Mettre à jour le protocole" : "Activer la synchronisation"}</Text></Pressable></Card>}

          <View style={styles.journeyList}>
            {steps.map(([title, description], index) => {
              const active = isPregnancy ? index + 1 === progress.trimester : index + 1 === settings.pmaStage;
              return (
                  <Card key={title} style={[styles.journeyCard, active && styles.journeyCardActive]}>
                    <View style={[styles.journeyDot, active && styles.journeyDotActive]}><Ionicons name={active ? "checkmark" : isPregnancy ? "heart-outline" : "ellipse-outline"} size={17} color={active ? colors.paper : colors.roseDeep} /></View>
                    <View style={styles.journeyCopy}><Text style={[styles.journeyTitle, active && styles.journeyTitleActive]}>{title}</Text><Text style={styles.journeyText}>{description}</Text>{!isPregnancy && active ? <Text style={styles.stageHint}>Étape calculée automatiquement</Text> : null}</View>
                  </Card>
              );
            })}
          </View>

          <FollowUpLinks />

          <Card style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={21} color={colors.teal} />
            <Text style={styles.infoText}>Ces étapes sont des repères généraux issus des recommandations françaises. Suivez toujours le calendrier et les prescriptions de votre équipe.</Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Page>
  );
}

function ProtocolDate({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <View style={styles.protocolDate}><Text style={styles.timelineLabel}>{label.toUpperCase()}</Text><TextInput value={value} onChangeText={onChange} keyboardType="numbers-and-punctuation" placeholder="JJ/MM/AAAA" placeholderTextColor={colors.muted} style={styles.timelineInput} /></View>;
}

function FollowUpLinks() {
  const { settings } = useCycle();
  return (
    <View style={styles.followLinks}>
      <Pressable onPress={() => router.push("/measurements")} style={styles.followLink}><Ionicons name="analytics-outline" size={21} color={colors.teal} /><Text style={styles.followLinkTitle}>Mes courbes</Text><Text style={styles.followLinkText}>{settings.careMode === "pregnancy" ? "Poids, tension et glycémie" : "Poids, tension et hormones"}</Text></Pressable>
      <Pressable onPress={() => router.push("/(tabs)/symptoms")} style={styles.followLink}><Ionicons name="pulse-outline" size={21} color={colors.roseDeep} /><Text style={styles.followLinkTitle}>Mes symptômes</Text><Text style={styles.followLinkText}>Journal quotidien</Text></Pressable>
    </View>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border?: string }) {
  return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color, borderColor: border ?? color }]} /><Text style={styles.legendText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  title: { marginTop: 8, color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -1 },
  titleAccent: { color: colors.roseDeep },
  subtitle: { marginTop: 10, color: colors.inkSoft, fontSize: 13, lineHeight: 20, maxWidth: 340 },
  calendarCard: { marginTop: 22, padding: 14 },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
  monthTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  navButton: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.tealMist },
  weekRow: { flexDirection: "row", marginBottom: 5 },
  weekday: { width: `${100 / 7}%`, textAlign: "center", color: colors.muted, fontSize: 10, fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "transparent" },
  dayText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  outsideText: { color: "#C4CECC" },
  futureText: { opacity: 0.62 },
  todayCircle: { borderColor: colors.teal },
  todayText: { color: colors.teal, fontWeight: "900" },
  selectedCircle: { borderWidth: 2.5, borderColor: colors.plum, transform: [{ scale: 1.05 }] },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 13, marginTop: 9 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  legendText: { color: colors.inkSoft, fontSize: 9, fontWeight: "700" },
  selectedCard: { marginTop: 16, flexDirection: "row", alignItems: "center", shadowOpacity: 0 },
  selectedIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" },
  selectedCopy: { marginLeft: 12 },
  selectedLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.9 },
  selectedDate: { marginTop: 3, color: colors.ink, fontSize: 16, fontWeight: "900" },
  action: { marginTop: 13 },
  infoCard: { marginTop: 17, flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: colors.tealMist, shadowOpacity: 0 },
  infoText: { flex: 1, color: colors.inkSoft, fontSize: 10, lineHeight: 16 },
  journeySelector: { marginTop: 20, flexDirection: "row", gap: 7 },
  journeySelectorButton: { flex: 1, minHeight: 45, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  journeySelectorActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  journeySelectorText: { textAlign: "center", color: colors.inkSoft, fontSize: 9, fontWeight: "900" },
  journeySelectorTextActive: { color: colors.paper },
  timelineCard: { marginTop: 20, shadowOpacity: 0.04 }, timelineHero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, timelineEyebrow: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.7 }, timelineValue: { marginTop: 4, color: colors.roseDeep, fontSize: 24, fontWeight: "900" }, trimesterBadge: { width: 45, height: 45, borderRadius: 15, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" }, trimesterBadgeText: { color: colors.roseDeep, fontSize: 15, fontWeight: "900" }, dueDate: { marginTop: 6, color: colors.teal, fontSize: 10, fontWeight: "800" }, timelineTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" }, timelineLabel: { marginTop: 12, marginBottom: 5, color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.65 }, timelineInput: { minHeight: 43, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream, paddingHorizontal: 11, color: colors.ink, fontSize: 11, fontWeight: "800" }, timelineSave: { marginTop: 13, minHeight: 44, borderRadius: 13, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" }, timelineSaveText: { color: colors.paper, fontSize: 10, fontWeight: "900" }, protocolTypes: { marginTop: 12, flexDirection: "row", gap: 6 }, protocolType: { flex: 1, minHeight: 37, borderRadius: 11, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, protocolTypeActive: { backgroundColor: colors.roseDeep, borderColor: colors.roseDeep }, protocolTypeText: { color: colors.inkSoft, fontSize: 8, fontWeight: "900" }, protocolTypeTextActive: { color: colors.paper }, protocolDate: { marginTop: 1 },
  journeyList: { marginTop: 18, gap: 10 },
  journeyCard: { flexDirection: "row", alignItems: "center", shadowOpacity: 0.045 },
  journeyCardActive: { borderColor: colors.rose, backgroundColor: colors.roseSoft },
  journeyDot: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.blush, alignItems: "center", justifyContent: "center" },
  journeyDotActive: { backgroundColor: colors.roseDeep },
  journeyCopy: { flex: 1, marginLeft: 12 },
  journeyTitle: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  journeyTitleActive: { color: colors.roseDeep },
  journeyText: { marginTop: 4, color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
  stageHint: { marginTop: 6, color: colors.teal, fontSize: 8, fontWeight: "900" },
  followLinks: { marginTop: 17, flexDirection: "row", gap: 10 },
  followLink: { flex: 1, minHeight: 105, padding: 14, borderRadius: 19, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border },
  followLinkTitle: { marginTop: 10, color: colors.ink, fontSize: 11, fontWeight: "900" },
  followLinkText: { marginTop: 3, color: colors.muted, fontSize: 8 },
});
