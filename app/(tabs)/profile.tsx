import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "@/components/brand";
import { CareModeSelector } from "@/components/care-mode-selector";
import { Card, DecorativeBackdrop, Eyebrow, Page } from "@/components/ui";
import { formatShortDate } from "@/src/lib/dates";
import { useAuth } from "@/src/state/auth-context";
import { useCycle } from "@/src/state/cycle-context";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings, reset } = useCycle();
  const { resetPatientData } = usePatientData();

  function confirmLogout() {
    Alert.alert(
      "Se déconnecter",
      "Vous pourrez vous reconnecter avec votre adresse e-mail et votre mot de passe.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: () => void signOut().then(() => router.replace("/auth" as Href)),
        },
      ],
    );
  }

  function confirmReset() {
    Alert.alert(
      "Réinitialiser mes données",
      "Votre prénom, votre mode d’accompagnement et vos préférences seront remis à zéro sur cet appareil.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Réinitialiser", style: "destructive", onPress: () => void Promise.all([reset(), resetPatientData()]).then(() => router.replace("/welcome" as Href)) },
      ],
    );
  }

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topbar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
              <Ionicons name="arrow-back" size={20} color={colors.teal} />
            </Pressable>
            <BrandMark compact />
          </View>

          <View style={styles.heading}>
            <Eyebrow>MON ESPACE</Eyebrow>
            <Text style={styles.title}>Vos préférences,{`\n`}tout en <Text style={styles.titleAccent}>douceur.</Text></Text>
          </View>

          <Card style={styles.identityCard}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(settings.firstName || "V").slice(0, 1).toUpperCase()}</Text></View>
            <View style={styles.identityCopy}>
              <Text style={styles.inputLabel}>MON PRÉNOM</Text>
              <TextInput
                value={settings.firstName}
                onChangeText={(firstName) => updateSettings({ firstName })}
                style={styles.nameInput}
                placeholder="Votre prénom"
                placeholderTextColor={colors.muted}
              />
            </View>
          </Card>

          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={16} color={colors.teal} />
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          <Text style={styles.sectionLabel}>MON ACCOMPAGNEMENT</Text>
          <Card style={styles.modeCard}>
            <Text style={styles.modeHint}>L’accueil et les conseils s’adaptent immédiatement à votre choix.</Text>
            <View style={styles.modeSelector}>
              <CareModeSelector value={settings.careMode} onChange={(careMode) => updateSettings({ careMode })} />
            </View>
          </Card>

          {settings.careMode === "cycle" ? (
            <>
              <Text style={styles.sectionLabel}>PARAMÈTRES DU CYCLE</Text>
              <Card style={styles.settingsCard}>
            <Stepper
              icon="repeat-outline"
              label="Durée du cycle"
              hint="Entre deux débuts de règles"
              value={settings.cycleLength}
              unit="jours"
              min={20}
              max={45}
              onChange={(cycleLength) => updateSettings({ cycleLength })}
            />
            <View style={styles.divider} />
            <Stepper
              icon="water-outline"
              label="Durée des règles"
              hint="Votre durée habituelle"
              value={settings.periodLength}
              unit="jours"
              min={2}
              max={10}
              onChange={(periodLength) => updateSettings({ periodLength })}
            />
            <View style={styles.divider} />
            <View style={styles.dateRow}>
              <View style={styles.settingIcon}><Ionicons name="calendar-outline" size={19} color={colors.roseDeep} /></View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>Dernier début des règles</Text>
                <Text style={styles.settingHint}>Modifiable depuis le calendrier</Text>
              </View>
              <Text style={styles.dateValue}>{formatShortDate(settings.lastPeriodStart)}</Text>
            </View>
              </Card>
            </>
          ) : null}

          <Text style={styles.sectionLabel}>MON ESPACE SANTÉ</Text>
          <Card style={styles.menuList}>
            <ProfileLink icon="alarm-outline" label="Mes rappels" hint="Médicaments, rendez-vous et examens" onPress={() => router.push("/reminders" as Href)} />
            <View style={styles.divider} />
            <ProfileLink icon="folder-open-outline" label="Mon dossier" hint="Lecture seule et pièces jointes" onPress={() => router.push("/record" as Href)} />
            <View style={styles.divider} />
            <ProfileLink icon="analytics-outline" label="Mes courbes" hint="Poids, tension, glycémie et hormones" onPress={() => router.push("/measurements" as Href)} />
            <View style={styles.divider} />
            <ProfileLink icon="shield-checkmark-outline" label="Consentement de partage" hint="Choisir les données autorisées" onPress={() => router.push("/consent" as Href)} />
            <View style={styles.divider} />
            <ProfileLink icon="settings-outline" label="Réglages" hint="Langue, thème et notifications" onPress={() => router.push("/settings" as Href)} />
          </Card>

          <Text style={styles.sectionLabel}>CONFIDENTIALITÉ</Text>
          <Card style={styles.privacyCard}>
            <View style={styles.privacyIcon}><Ionicons name="lock-closed-outline" size={22} color={colors.teal} /></View>
            <View style={styles.privacyCopy}>
              <Text style={styles.privacyTitle}>Stockage local</Text>
              <Text style={styles.privacyText}>Vos informations de suivi sont enregistrées uniquement sur cet appareil dans cette première version.</Text>
            </View>
          </Card>

          <Pressable accessibilityRole="button" onPress={confirmReset} style={styles.resetButton}>
            <Ionicons name="refresh-outline" size={18} color={colors.danger} />
            <Text style={styles.resetText}>Réinitialiser mes données</Text>
          </Pressable>

          <Pressable accessibilityRole="button" onPress={confirmLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color={colors.teal} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>

          <Text style={styles.version}>HawaeMD Patiente · version 0.1</Text>
        </ScrollView>
      </SafeAreaView>
    </Page>
  );
}

function Stepper({
  icon,
  label,
  hint,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  icon: "repeat-outline" | "water-outline";
  label: string;
  hint: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <View style={styles.settingIcon}><Ionicons name={icon} size={19} color={colors.roseDeep} /></View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{label}</Text>
        <Text style={styles.settingHint}>{hint}</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Diminuer ${label}`} disabled={value <= min} onPress={() => onChange(value - 1)} style={styles.stepButton}>
          <Ionicons name="remove" size={16} color={value <= min ? colors.border : colors.teal} />
        </Pressable>
        <View style={styles.stepValue}><Text style={styles.stepNumber}>{value}</Text><Text style={styles.stepUnit}>{unit}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Augmenter ${label}`} disabled={value >= max} onPress={() => onChange(value + 1)} style={styles.stepButton}>
          <Ionicons name="add" size={16} color={value >= max ? colors.border : colors.teal} />
        </Pressable>
      </View>
    </View>
  );
}

function ProfileLink({ icon, label, hint, onPress }: { icon: "alarm-outline" | "folder-open-outline" | "analytics-outline" | "shield-checkmark-outline" | "settings-outline"; label: string; hint: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.profileLink}>
      <View style={styles.profileLinkIcon}><Ionicons name={icon} size={19} color={colors.teal} /></View>
      <View style={styles.profileLinkCopy}><Text style={styles.profileLinkTitle}>{label}</Text><Text style={styles.profileLinkHint}>{hint}</Text></View>
      <Ionicons name="chevron-forward" size={17} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  heading: { marginTop: 28 },
  title: { marginTop: 8, color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -1 },
  titleAccent: { color: colors.roseDeep },
  identityCard: { marginTop: 21, flexDirection: "row", alignItems: "center" },
  avatar: { width: 58, height: 58, borderRadius: 20, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.roseDeep, fontSize: 22, fontWeight: "900" },
  identityCopy: { flex: 1, marginLeft: 13 },
  inputLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  nameInput: { marginTop: 2, paddingVertical: 3, color: colors.ink, fontSize: 19, fontWeight: "900", borderBottomWidth: 1, borderBottomColor: colors.border },
  emailRow: { marginTop: 9, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  emailText: { color: colors.inkSoft, fontSize: 11, fontWeight: "700" },
  modeCard: { shadowOpacity: 0.045 },
  modeHint: { color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
  modeSelector: { marginTop: 11 },
  sectionLabel: { marginTop: 24, marginBottom: 9, color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  settingsCard: { paddingVertical: 6, shadowOpacity: 0.045 },
  menuList: { paddingVertical: 4, shadowOpacity: 0.035 },
  profileLink: { minHeight: 65, flexDirection: "row", alignItems: "center" },
  profileLinkIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: colors.tealMist, alignItems: "center", justifyContent: "center" },
  profileLinkCopy: { flex: 1, marginLeft: 10 },
  profileLinkTitle: { color: colors.ink, fontSize: 11, fontWeight: "900" },
  profileLinkHint: { marginTop: 3, color: colors.muted, fontSize: 8 },
  stepperRow: { minHeight: 76, flexDirection: "row", alignItems: "center" },
  settingIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" },
  settingCopy: { flex: 1, marginLeft: 10 },
  settingTitle: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  settingHint: { marginTop: 3, color: colors.muted, fontSize: 9 },
  divider: { height: 1, backgroundColor: colors.border },
  stepper: { flexDirection: "row", alignItems: "center", borderRadius: 13, backgroundColor: colors.tealMist, overflow: "hidden" },
  stepButton: { width: 32, height: 42, alignItems: "center", justifyContent: "center" },
  stepValue: { minWidth: 39, alignItems: "center" },
  stepNumber: { color: colors.teal, fontSize: 14, fontWeight: "900" },
  stepUnit: { color: colors.muted, fontSize: 7, fontWeight: "700" },
  dateRow: { minHeight: 76, flexDirection: "row", alignItems: "center" },
  dateValue: { color: colors.roseDeep, fontSize: 11, fontWeight: "900" },
  privacyCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.tealMist, shadowOpacity: 0 },
  privacyIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.tealSoft, alignItems: "center", justifyContent: "center" },
  privacyCopy: { flex: 1, marginLeft: 11 },
  privacyTitle: { color: colors.tealDeep, fontSize: 12, fontWeight: "900" },
  privacyText: { marginTop: 4, color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
  resetButton: { marginTop: 18, minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: "#F0CED5", backgroundColor: "#FFF6F7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  resetText: { color: colors.danger, fontSize: 12, fontWeight: "900" },
  logoutButton: { marginTop: 10, minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: colors.tealSoft, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoutText: { color: colors.teal, fontSize: 12, fontWeight: "900" },
  version: { marginTop: 19, textAlign: "center", color: colors.muted, fontSize: 9 },
});
