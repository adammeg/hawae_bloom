import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "@/components/brand";
import { CareModeSelector } from "@/components/care-mode-selector";
import { ActionButton, DecorativeBackdrop, LoadingView, Page } from "@/components/ui";
import { addDays, formatShortDate, toIsoDate } from "@/src/lib/dates";
import { formatFrenchInputDate, localDateKey, parseFrenchDate } from "@/src/lib/reminders";
import { useAuth } from "@/src/state/auth-context";
import { useCycle } from "@/src/state/cycle-context";
import { colors, shadows } from "@/src/theme/colors";
import type { CareMode } from "@/src/types/content";

const DATE_OPTIONS = [
  { offset: 0, label: "Aujourd’hui" },
  { offset: -3, label: "Il y a 3 jours" },
  { offset: -7, label: "Il y a 7 jours" },
] as const;

export default function WelcomeScreen() {
  const { user, hydrated: authHydrated } = useAuth();
  const { settings, updateSettings } = useCycle();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState(settings.firstName || user?.firstName || "");
  const [careMode, setCareMode] = useState<CareMode>(settings.careMode);
  const [periodStart, setPeriodStart] = useState(settings.lastPeriodStart);
  const [pregnancyDate, setPregnancyDate] = useState(formatFrenchInputDate(new Date(`${settings.lastPeriodStart}T12:00:00`)));

  if (!authHydrated) return <LoadingView />;
  if (!user) return <Redirect href="/auth" />;

  function finish() {
    const parsedPregnancyDate = careMode === "pregnancy" ? parseFrenchDate(pregnancyDate) : null;
    if (careMode === "pregnancy" && (!parsedPregnancyDate || parsedPregnancyDate > new Date())) {
      Alert.alert("Date à vérifier", "Indiquez la date du premier jour des dernières règles au format JJ/MM/AAAA.");
      return;
    }
    updateSettings({
      firstName: firstName.trim(),
      careMode,
      lastPeriodStart: parsedPregnancyDate ? localDateKey(parsedPregnancyDate) : periodStart,
      onboardingComplete: true,
    });
    router.replace("/(tabs)");
  }

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.topbar}>
              <BrandMark />
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>{step}/3</Text></View>
            </View>

            <View style={styles.heroMark}>
              <View style={styles.heroRing}>
                <Ionicons name={step === 1 ? "heart" : step === 2 ? "options" : "sparkles"} size={33} color={colors.roseDeep} />
              </View>
            </View>

            <View style={styles.panel}>
              {step === 1 ? (
                <>
                  <Text style={styles.eyebrow}>BIENVENUE DANS VOTRE ESPACE</Text>
                  <Text style={styles.title}>Une application pensée{`\n`}pour <Text style={styles.titleAccent}>vous.</Text></Text>
                  <Text style={styles.subtitle}>Votre accompagnement s’adaptera à votre situation et pourra être modifié à tout moment.</Text>
                  <Text style={styles.label}>COMMENT SOUHAITEZ-VOUS ÊTRE APPELÉE ?</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="person-outline" size={19} color={colors.teal} />
                    <TextInput value={firstName} onChangeText={setFirstName} placeholder="Votre prénom" placeholderTextColor={colors.muted} autoCapitalize="words" style={styles.input} maxLength={40} />
                  </View>
                  <View style={styles.action}><ActionButton label="Continuer" onPress={() => setStep(2)} /></View>
                </>
              ) : step === 2 ? (
                <>
                  <Text style={styles.eyebrow}>VOTRE ACCOMPAGNEMENT</Text>
                  <Text style={styles.title}>Quel parcours souhaitez-vous <Text style={styles.titleAccent}>suivre ?</Text></Text>
                  <Text style={styles.subtitle}>Nous personnaliserons l’accueil, les repères et les conseils selon votre choix.</Text>
                  <View style={styles.modeList}><CareModeSelector value={careMode} onChange={setCareMode} /></View>
                  <NavigationRow onBack={() => setStep(1)} onNext={() => setStep(3)} />
                </>
              ) : (
                <>
                  <Text style={styles.eyebrow}>{careMode === "pregnancy" ? "VOTRE GROSSESSE" : careMode === "pma" ? "VOTRE PROTOCOLE" : "VOTRE CYCLE"}</Text>
                  <Text style={styles.title}>
                    {careMode === "pregnancy" ? <>Datons votre <Text style={styles.titleAccent}>grossesse.</Text></> : careMode === "pma" ? <>Votre calendrier sera <Text style={styles.titleAccent}>personnalisé.</Text></> : <>Quand vos dernières règles ont-elles <Text style={styles.titleAccent}>commencé ?</Text></>}
                  </Text>
                  <Text style={styles.subtitle}>
                    {careMode === "pregnancy" ? "La semaine d’aménorrhée, le trimestre et la date prévue d’accouchement seront calculés automatiquement." : careMode === "pma" ? "Renseignez ensuite les dates prescrites depuis l’onglet Suivi pour synchroniser automatiquement l’étape du parcours." : "Cette date permet de préparer vos premières estimations et peut être modifiée plus tard."}
                  </Text>

                  {careMode === "pregnancy" ? (
                    <View style={styles.pregnancyDateBlock}><Text style={styles.label}>PREMIER JOUR DES DERNIÈRES RÈGLES</Text><View style={styles.inputWrap}><Ionicons name="calendar-outline" size={19} color={colors.teal} /><TextInput value={pregnancyDate} onChangeText={setPregnancyDate} keyboardType="numbers-and-punctuation" placeholder="JJ/MM/AAAA" placeholderTextColor={colors.muted} style={styles.input} /></View></View>
                  ) : careMode === "cycle" ? (
                    <View style={styles.dateOptions}>
                      {DATE_OPTIONS.map((option) => {
                        const date = toIsoDate(addDays(new Date(), option.offset));
                        const active = periodStart === date;
                        return (
                          <Pressable key={option.offset} onPress={() => setPeriodStart(date)} style={[styles.dateOption, active && styles.dateOptionActive]}>
                            <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioCenter} /> : null}</View>
                            <View style={styles.dateCopy}><Text style={styles.dateLabel}>{option.label}</Text><Text style={styles.dateValue}>{formatShortDate(date)}</Text></View>
                            <Ionicons name="calendar-outline" size={18} color={active ? colors.roseDeep : colors.muted} />
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : <View style={styles.protocolInfo}><Ionicons name="calendar-outline" size={22} color={colors.teal} /><Text style={styles.protocolInfoText}>Vous pourrez saisir le début du traitement, la date de ponction/transfert/insémination et la date du contrôle biologique.</Text></View>}

                  <View style={styles.actionRow}>
                    <Pressable onPress={() => setStep(2)} style={styles.backButton}><Ionicons name="arrow-back" size={19} color={colors.teal} /></Pressable>
                    <View style={styles.finishButton}><ActionButton label="Découvrir mon espace" icon="sparkles-outline" onPress={finish} /></View>
                  </View>
                </>
              )}
            </View>

            <View style={styles.privacy}><Ionicons name="shield-checkmark-outline" size={16} color={colors.teal} /><Text style={styles.privacyText}>Conseils généraux · votre équipe médicale reste votre référence.</Text></View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Page>
  );
}

function NavigationRow({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <View style={styles.actionRow}>
      <Pressable onPress={onBack} style={styles.backButton}><Ionicons name="arrow-back" size={19} color={colors.teal} /></Pressable>
      <View style={styles.finishButton}><ActionButton label="Continuer" onPress={onNext} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 30 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepBadge: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border },
  stepBadgeText: { color: colors.teal, fontSize: 10, fontWeight: "900" },
  heroMark: { alignItems: "center", marginTop: 28, marginBottom: -31, zIndex: 2 },
  heroRing: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", backgroundColor: colors.roseSoft, borderWidth: 8, borderColor: "rgba(255,255,255,0.72)" },
  panel: { paddingTop: 49, paddingHorizontal: 20, paddingBottom: 20, borderRadius: 28, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  eyebrow: { textAlign: "center", color: colors.roseDeep, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  title: { marginTop: 9, textAlign: "center", color: colors.ink, fontSize: 26, lineHeight: 32, fontWeight: "900", letterSpacing: -0.8 },
  titleAccent: { color: colors.roseDeep },
  subtitle: { marginTop: 9, textAlign: "center", color: colors.inkSoft, fontSize: 11, lineHeight: 17 },
  label: { marginTop: 22, color: colors.ink, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  inputWrap: { marginTop: 7, height: 51, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 9 },
  input: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: "700" },
  action: { marginTop: 15 },
  modeList: { marginTop: 18 },
  actionRow: { marginTop: 15, flexDirection: "row", gap: 9 },
  backButton: { width: 49, height: 49, borderRadius: 15, borderWidth: 1, borderColor: colors.tealSoft, backgroundColor: colors.tealMist, alignItems: "center", justifyContent: "center" },
  finishButton: { flex: 1 },
  trimesterRow: { marginTop: 20, flexDirection: "row", gap: 8 },
  trimester: { flex: 1, minHeight: 78, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" },
  trimesterActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  trimesterNumber: { color: colors.ink, fontSize: 23, fontWeight: "900" },
  trimesterNumberActive: { color: colors.paper },
  trimesterText: { marginTop: 2, color: colors.muted, fontSize: 8, fontWeight: "800" },
  trimesterTextActive: { color: colors.tealSoft },
  pregnancyDateBlock: { marginTop: 4 }, protocolInfo: { marginTop: 18, padding: 14, borderRadius: 16, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "center", gap: 10 }, protocolInfoText: { flex: 1, color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
  dateOptions: { marginTop: 18, gap: 8 },
  dateOption: { minHeight: 61, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream, paddingHorizontal: 13, flexDirection: "row", alignItems: "center" },
  dateOptionActive: { borderColor: colors.rose, backgroundColor: colors.roseSoft },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.muted, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: colors.roseDeep },
  radioCenter: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.roseDeep },
  dateCopy: { flex: 1, marginLeft: 10 },
  dateLabel: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  dateValue: { marginTop: 2, color: colors.muted, fontSize: 9 },
  privacy: { marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  privacyText: { color: colors.muted, fontSize: 8, fontWeight: "700" },
});
