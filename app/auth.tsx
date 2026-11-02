import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, type Href } from "expo-router";
import { useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "@/components/brand";
import { DecorativeBackdrop, LoadingView, Page } from "@/components/ui";
import { useAuth } from "@/src/state/auth-context";
import { useCycle } from "@/src/state/cycle-context";
import { colors, shadows } from "@/src/theme/colors";

type Mode = "login" | "register";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen() {
  const auth = useAuth();
  const { settings, updateSettings } = useCycle();
  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!auth.hydrated) return <LoadingView />;
  if (auth.user) {
    const destination = (settings.onboardingComplete ? "/(tabs)" : "/welcome") as Href;
    return <Redirect href={destination} />;
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setPassword("");
  }

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    setError("");

    if (mode === "register" && firstName.trim().length < 2) {
      setError("Indiquez votre prénom.");
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Saisissez une adresse e-mail valide.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "register") {
        const name = firstName.trim();
        await auth.signUp({ firstName: name, email: normalizedEmail, password });
        updateSettings({ firstName: name });
        router.replace("/welcome" as Href);
      } else {
        await auth.signIn(normalizedEmail, password);
        router.replace((settings.onboardingComplete ? "/(tabs)" : "/welcome") as Href);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandRow}>
              <BrandMark />
              <View style={styles.secureBadge}>
                <Ionicons name="shield-checkmark" size={14} color={colors.teal} />
                <Text style={styles.secureText}>ESPACE PRIVÉ</Text>
              </View>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons name="heart" size={31} color={colors.roseDeep} />
            </View>

            <View style={styles.panel}>
              <Text style={styles.eyebrow}>HAWAEMD PATIENTE</Text>
              <Text style={styles.title}>
                {mode === "login" ? "Heureuse de vous\nretrouver." : "Créons votre espace\nbien-être."}
              </Text>
              <Text style={styles.subtitle}>
                {mode === "login"
                  ? "Connectez-vous pour retrouver votre calendrier et vos conseils."
                  : "Un espace personnel, féminin et confidentiel pour prendre soin de vous."}
              </Text>

              <View style={styles.switcher}>
                <Pressable onPress={() => changeMode("login")} style={[styles.switchButton, mode === "login" && styles.switchButtonActive]}>
                  <Text style={[styles.switchText, mode === "login" && styles.switchTextActive]}>Connexion</Text>
                </Pressable>
                <Pressable onPress={() => changeMode("register")} style={[styles.switchButton, mode === "register" && styles.switchButtonActive]}>
                  <Text style={[styles.switchText, mode === "register" && styles.switchTextActive]}>Créer un compte</Text>
                </Pressable>
              </View>

              {mode === "register" ? (
                <AuthField
                  icon="person-outline"
                  label="PRÉNOM"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Votre prénom"
                  autoCapitalize="words"
                  textContentType="givenName"
                />
              ) : null}

              <AuthField
                icon="mail-outline"
                label="ADRESSE E-MAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="vous@exemple.com"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>MOT DE PASSE</Text>
                <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
                  <Ionicons name="lock-closed-outline" size={19} color={colors.teal} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="8 caractères minimum"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType={mode === "register" ? "newPassword" : "password"}
                    returnKeyType="done"
                    onSubmitEditing={() => void submit()}
                    style={styles.input}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    onPress={() => setShowPassword((value) => !value)}
                    hitSlop={10}
                  >
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={17} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={submitting}
                onPress={() => void submit()}
                style={({ pressed }) => [styles.submit, (pressed || submitting) && styles.submitPressed]}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.paper} />
                ) : (
                  <>
                    <Text style={styles.submitText}>{mode === "login" ? "Me connecter" : "Créer mon espace"}</Text>
                    <Ionicons name={mode === "login" ? "arrow-forward" : "sparkles-outline"} size={18} color={colors.paper} />
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.privacyRow}>
              <Ionicons name="lock-closed-outline" size={15} color={colors.teal} />
              <Text style={styles.privacyText}>Vos informations restent protégées sur cet appareil.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Page>
  );
}

function AuthField({
  icon,
  label,
  ...inputProps
}: ComponentProps<typeof TextInput> & {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={19} color={colors.teal} />
        <TextInput {...inputProps} placeholderTextColor={colors.muted} style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 30 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  secureBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, backgroundColor: colors.tealMist, borderWidth: 1, borderColor: colors.tealSoft, paddingHorizontal: 9, paddingVertical: 6 },
  secureText: { color: colors.teal, fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  heroIcon: { alignSelf: "center", width: 76, height: 76, marginTop: 27, marginBottom: -27, borderRadius: 38, zIndex: 2, alignItems: "center", justifyContent: "center", backgroundColor: colors.roseSoft, borderWidth: 7, borderColor: "rgba(255,255,255,0.75)" },
  panel: { paddingTop: 44, paddingHorizontal: 20, paddingBottom: 20, borderRadius: 28, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  eyebrow: { textAlign: "center", color: colors.roseDeep, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  title: { marginTop: 8, textAlign: "center", color: colors.ink, fontSize: 27, lineHeight: 32, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { marginTop: 9, marginHorizontal: 8, textAlign: "center", color: colors.inkSoft, fontSize: 11, lineHeight: 17 },
  switcher: { flexDirection: "row", marginTop: 20, marginBottom: 5, padding: 4, borderRadius: 14, backgroundColor: colors.cream },
  switchButton: { flex: 1, minHeight: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  switchButtonActive: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, ...shadows.card, shadowOpacity: 0.04 },
  switchText: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  switchTextActive: { color: colors.teal },
  fieldBlock: { marginTop: 14 },
  label: { marginBottom: 6, color: colors.ink, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  inputWrap: { height: 51, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cream, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 9 },
  inputWrapError: { borderColor: "#E5A9B6" },
  input: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: "700" },
  errorBox: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 12, backgroundColor: "#FFF1F4" },
  errorText: { flex: 1, color: colors.danger, fontSize: 10, lineHeight: 14, fontWeight: "700" },
  submit: { minHeight: 50, marginTop: 16, borderRadius: 15, backgroundColor: colors.teal, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  submitPressed: { opacity: 0.76 },
  submitText: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  privacyRow: { marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  privacyText: { color: colors.muted, fontSize: 9, fontWeight: "700" },
});
