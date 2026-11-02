import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DecorativeBackdrop, Eyebrow, Page } from "@/components/ui";
import { CARE_MODE_CONTENT, tipsForMode } from "@/src/data/care-content";
import { useCycle } from "@/src/state/cycle-context";
import type { CareTip } from "@/src/types/content";
import { colors } from "@/src/theme/colors";

const iconNames = { leaf: "leaf-outline", nutrition: "nutrition-outline", medical: "medkit-outline", heart: "heart-outline" } as const;

export default function TipsScreen() {
  const { settings } = useCycle();
  const [expanded, setExpanded] = useState<string | null>(null);
  const modeContent = CARE_MODE_CONTENT[settings.careMode];
  const tips = useMemo(
    () => tipsForMode(settings.careMode, settings.pregnancyTrimester),
    [settings.careMode, settings.pregnancyTrimester],
  );

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Eyebrow>{modeContent.eyebrow}</Eyebrow>
          <Text style={styles.title}>Des repères fiables,{`\n`}pour votre <Text style={styles.titleAccent}>parcours.</Text></Text>
          <Text style={styles.subtitle}>{modeContent.subtitle}</Text>

          {settings.careMode === "pregnancy" ? (
            <View style={styles.trimesterCard}>
              <Text style={styles.trimesterLabel}>JE SUIS AU</Text>
              <View style={styles.trimesterRow}>
                <View style={[styles.trimesterButton, styles.trimesterButtonActive]}><Text style={[styles.trimesterNumber, styles.trimesterNumberActive]}>{settings.pregnancyTrimester}</Text><Text style={[styles.trimesterText, styles.trimesterTextActive]}>trimestre calculé</Text></View>
                <View style={styles.trimesterAuto}><Ionicons name="calendar-outline" size={18} color={colors.teal} /><Text style={styles.trimesterAutoText}>Calculé depuis les dernières règles dans l’onglet Suivi</Text></View>
              </View>
            </View>
          ) : null}

          <View style={styles.featured}>
            <View style={styles.featuredDecor} />
            <View style={styles.featuredIcon}><Ionicons name="shield-checkmark" size={22} color={colors.paper} /></View>
            <Text style={styles.featuredEyebrow}>INFORMATIONS VÉRIFIÉES</Text>
            <Text style={styles.featuredTitle}>Votre situation reste unique.</Text>
            <Text style={styles.featuredText}>Ces repères proviennent de sources officielles. Ils préparent la discussion mais ne remplacent ni une consultation, ni une prescription.</Text>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{settings.careMode === "pregnancy" ? `Conseils du ${settings.pregnancyTrimester}${settings.pregnancyTrimester === 1 ? "er" : "e"} trimestre` : modeContent.label}</Text>
            <Text style={styles.count}>{tips.length} REPÈRES</Text>
          </View>

          <View style={styles.list}>
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} expanded={expanded === tip.id} onToggle={() => setExpanded((id) => id === tip.id ? null : tip.id)} />
            ))}
          </View>

          <Card style={styles.urgentCard}>
            <View style={styles.urgentIcon}><Ionicons name="call-outline" size={21} color={colors.danger} /></View>
            <View style={styles.urgentCopy}>
              <Text style={styles.urgentTitle}>Un symptôme vous inquiète ?</Text>
              <Text style={styles.urgentText}>Contactez votre professionnel, votre centre, votre maternité ou les urgences. N’attendez pas une réponse de l’application.</Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Page>
  );
}

function TipCard({ tip, expanded, onToggle }: { tip: CareTip; expanded: boolean; onToggle: () => void }) {
  return (
    <Card style={styles.tipCard}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={onToggle}>
        <View style={styles.tipHeader}>
          <View style={styles.tipIcon}><Ionicons name={iconNames[tip.icon]} size={21} color={colors.roseDeep} /></View>
          <View style={styles.tipHeading}><Text style={styles.tipCategory}>{tip.category}</Text><Text style={styles.tipTitle}>{tip.title}</Text></View>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.teal} />
        </View>
        <Text style={styles.tipSummary}>{tip.summary}</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.tipExpanded}>
          <Text style={styles.tipBody}>{tip.body}</Text>
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(tip.sourceUrl)} style={styles.sourceLink}>
            <Ionicons name="open-outline" size={14} color={colors.teal} />
            <Text style={styles.sourceText}>{tip.sourceLabel}</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  title: { marginTop: 8, color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -1 },
  titleAccent: { color: colors.roseDeep },
  subtitle: { marginTop: 10, color: colors.inkSoft, fontSize: 13, lineHeight: 20, maxWidth: 340 },
  trimesterCard: { marginTop: 21, backgroundColor: colors.paper, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 13 },
  trimesterLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginBottom: 9 },
  trimesterRow: { flexDirection: "row", gap: 8 },
  trimesterButton: { flex: 1, paddingVertical: 10, borderRadius: 13, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  trimesterButtonActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  trimesterNumber: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  trimesterNumberActive: { color: colors.paper },
  trimesterText: { color: colors.muted, fontSize: 8, fontWeight: "800", textTransform: "uppercase" },
  trimesterTextActive: { color: "#D7E8E5" },
  trimesterAuto: { flex: 2, minHeight: 56, paddingHorizontal: 11, borderRadius: 14, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "center", gap: 8 }, trimesterAutoText: { flex: 1, color: colors.inkSoft, fontSize: 8, lineHeight: 12, fontWeight: "700" },
  featured: { marginTop: 18, borderRadius: 24, backgroundColor: colors.roseDeep, padding: 19, overflow: "hidden" },
  featuredDecor: { position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.07)", right: -55, top: -70 },
  featuredIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  featuredEyebrow: { marginTop: 13, color: "#F5CCD7", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  featuredTitle: { marginTop: 6, color: colors.paper, fontSize: 20, lineHeight: 25, fontWeight: "900" },
  featuredText: { marginTop: 8, color: "#F8DEE5", fontSize: 11, lineHeight: 17 },
  listHeader: { marginTop: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  listTitle: { flex: 1, color: colors.ink, fontSize: 17, fontWeight: "900" },
  count: { marginLeft: 8, color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  list: { marginTop: 11, gap: 11 },
  tipCard: { shadowOpacity: 0.045 },
  tipHeader: { flexDirection: "row", alignItems: "center" },
  tipIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" },
  tipHeading: { flex: 1, marginLeft: 11 },
  tipCategory: { color: colors.roseDeep, fontSize: 8, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 },
  tipTitle: { marginTop: 3, color: colors.ink, fontSize: 14, fontWeight: "900" },
  tipSummary: { marginTop: 11, color: colors.inkSoft, fontSize: 11, lineHeight: 17 },
  tipExpanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  tipBody: { color: colors.ink, fontSize: 11, lineHeight: 18 },
  sourceLink: { alignSelf: "flex-start", marginTop: 11, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, backgroundColor: colors.tealMist },
  sourceText: { color: colors.teal, fontSize: 9, fontWeight: "900" },
  urgentCard: { marginTop: 18, flexDirection: "row", alignItems: "flex-start", backgroundColor: "#FFF4F5", borderColor: "#F4D5DA", shadowOpacity: 0 },
  urgentIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#FFE4E8", alignItems: "center", justifyContent: "center" },
  urgentCopy: { flex: 1, marginLeft: 11 },
  urgentTitle: { color: colors.danger, fontSize: 12, fontWeight: "900" },
  urgentText: { marginTop: 4, color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
});
