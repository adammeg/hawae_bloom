import { getLocales } from "expo-localization";
import { Appearance, DevSettings, I18nManager, Platform, useColorScheme, type ColorSchemeName } from "react-native";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLocalValue, setLocalValue } from "@/src/lib/local-storage";

const STORAGE_KEY = "hawae-patient-preferences-v1";
export type AppLanguage = "fr" | "ar" | "en";
export type ThemeMode = "light" | "dark" | "system";

const STRINGS = {
  fr: { home: "Aujourd’hui", followUp: "Suivi", journal: "Journal", appointments: "RDV", messages: "Messages", sexology: "Sexologie", settings: "Réglages" },
  ar: { home: "اليوم", followUp: "المتابعة", journal: "اليومية", appointments: "المواعيد", messages: "الرسائل", sexology: "الصحة الجنسية", settings: "الإعدادات" },
  en: { home: "Today", followUp: "Follow-up", journal: "Journal", appointments: "Visits", messages: "Messages", sexology: "Sexual health", settings: "Settings" },
} as const;

type TranslationKey = keyof typeof STRINGS.fr;
type PreferencesContextValue = {
  language: AppLanguage;
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  isRTL: boolean;
  hydrated: boolean;
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: ThemeMode) => void;
  t: (key: TranslationKey) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function deviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode;
  return code === "ar" || code === "en" ? code : "fr";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [language, setLanguageState] = useState<AppLanguage>(deviceLanguage);
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void getLocalValue(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      const stored = JSON.parse(raw) as { language?: AppLanguage; theme?: ThemeMode };
      if (stored.language === "fr" || stored.language === "ar" || stored.language === "en") setLanguageState(stored.language);
      if (stored.theme === "light" || stored.theme === "dark" || stored.theme === "system") setThemeState(stored.theme);
    }).catch(() => undefined).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void setLocalValue(STORAGE_KEY, JSON.stringify({ language, theme }));
  }, [hydrated, language, theme]);

  useEffect(() => {
    const rtl = language === "ar";
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.dir = rtl ? "rtl" : "ltr";
      document.documentElement.lang = language;
    } else {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(rtl);
    }
  }, [language]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Appearance.setColorScheme(theme === "system" ? (systemScheme ?? "light") : theme as ColorSchemeName);
    }
  }, [theme, systemScheme]);

  const reloadInterface = useCallback(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") window.location.reload();
    else DevSettings.reload();
  }, []);
  const setLanguage = useCallback((value: AppLanguage) => {
    if (value === language) return;
    setLanguageState(value);
    void setLocalValue(STORAGE_KEY, JSON.stringify({ language: value, theme })).finally(reloadInterface);
  }, [language, theme, reloadInterface]);
  const setTheme = useCallback((value: ThemeMode) => {
    if (value === theme) return;
    setThemeState(value);
    if (Platform.OS !== "web") {
      Appearance.setColorScheme(value === "system" ? (systemScheme ?? "light") : value);
    }
    void setLocalValue(STORAGE_KEY, JSON.stringify({ language, theme: value })).finally(reloadInterface);
  }, [language, theme, systemScheme, reloadInterface]);
  const resolvedTheme = theme === "system" ? (systemScheme === "dark" ? "dark" : "light") : theme;
  const t = useCallback((key: TranslationKey) => STRINGS[language][key], [language]);
  const value = useMemo(() => ({ language, theme, resolvedTheme, isRTL: language === "ar", hydrated, setLanguage, setTheme, t }), [language, theme, resolvedTheme, hydrated, setLanguage, setTheme, t]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside PreferencesProvider");
  return value;
}
