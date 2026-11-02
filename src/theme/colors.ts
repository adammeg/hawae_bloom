import { Appearance, Platform } from "react-native";

const light = {
  teal: "#0A5C5C", tealDeep: "#073E42", tealSoft: "#DDF1EE", tealMist: "#EFF8F6",
  rose: "#D87992", roseDeep: "#A94866", roseSoft: "#F9E8ED", blush: "#F5DCE3",
  plum: "#56364D", gold: "#C7A65A", cream: "#FBF8F3", paper: "#FFFFFF",
  ink: "#193B3B", inkSoft: "#557070", muted: "#829595", border: "#E5ECE9",
  danger: "#C94D67", shadow: "#153E3E",
};

const dark: typeof light = {
  teal: "#6FC7BF", tealDeep: "#0D292A", tealSoft: "#214948", tealMist: "#173536",
  rose: "#E58CA5", roseDeep: "#F0A6BA", roseSoft: "#412D36", blush: "#4A3039",
  plum: "#E8D6E0", gold: "#D9B968", cream: "#102526", paper: "#173536",
  ink: "#F3FAF8", inkSoft: "#BCD0CD", muted: "#8FA8A5", border: "#29494A",
  danger: "#FF8FA4", shadow: "#000000",
};

function selectedColorScheme(): "light" | "dark" {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("hawae-patient-preferences-v1");
      if (raw) {
        const stored = JSON.parse(raw) as { theme?: "light" | "dark" | "system" };
        if (stored.theme === "light" || stored.theme === "dark") return stored.theme;
      }
    } catch {
      // The browser can block localStorage in private or restricted contexts.
    }
  }
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

const activeScheme = selectedColorScheme();

export const colors = activeScheme === "dark" ? dark : light;

export const shadows = {
  card: Platform.OS === "web"
    ? { boxShadow: activeScheme === "dark" ? "0 8px 18px rgba(0,0,0,0.18)" : "0 8px 18px rgba(21,62,62,0.08)" }
    : {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: activeScheme === "dark" ? 0.18 : 0.08,
        shadowRadius: 18,
        elevation: 3,
      },
};
