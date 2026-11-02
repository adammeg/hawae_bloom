import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DecorativeBackdrop, Eyebrow, Page } from "@/components/ui";
import { SEXUAL_HEALTH_ARTICLES, type SexualHealthArticle, type SexualHealthAudience } from "@/src/data/sexual-health";
import { colors } from "@/src/theme/colors";

const AUDIENCES: Array<{ value: SexualHealthAudience; label: string; short: string; icon: "sparkles-outline" | "heart-outline" | "flower-outline" }> = [
  { value: "young", label: "Jeunes femmes", short: "Jeune", icon: "sparkles-outline" },
  { value: "all", label: "Toutes les étapes", short: "Toutes", icon: "heart-outline" },
  { value: "menopause", label: "Péri & ménopause", short: "Ménopause", icon: "flower-outline" },
];

const CATEGORIES = ["Tout", "Consentement", "Prévention", "Plaisir", "Douleur", "Corps", "Ménopause", "Relation"] as const;

export default function SexualHealthScreen() {
  const [audience, setAudience] = useState<SexualHealthAudience>("young");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tout");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const articles = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr-FR");
    return SEXUAL_HEALTH_ARTICLES.filter((article) => {
      const matchesAudience = article.audiences.includes(audience);
      const matchesCategory = category === "Tout" || article.category === category;
      const matchesQuery = !normalized || `${article.title} ${article.summary} ${article.body}`.toLocaleLowerCase("fr-FR").includes(normalized);
      return matchesAudience && matchesCategory && matchesQuery;
    });
  }, [audience, category, query]);

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}><Eyebrow>SEXOLOGIE & SANTÉ INTIME</Eyebrow><Text style={styles.title}>Mieux connaître votre corps,{`\n`}sans <Text style={styles.accent}>tabou.</Text></Text></View>
            <View style={styles.privateBadge}><Ionicons name="lock-closed" size={14} color={colors.teal} /><Text style={styles.privateText}>PRIVÉ</Text></View>
          </View>
          <Text style={styles.subtitle}>Des informations bienveillantes, inclusives et fondées sur les recommandations médicales. Aucun parcours ni aucune fréquence n’est imposé.</Text>

          <View style={styles.audiencePanel}>
            <Text style={styles.panelLabel}>JE SOUHAITE DES CONSEILS POUR</Text>
            <View style={styles.audienceRow}>
              {AUDIENCES.map((item) => {
                const active = audience === item.value;
                return <Pressable key={item.value} onPress={() => { setAudience(item.value); setExpanded(null); }} style={[styles.audienceButton, active && styles.audienceButtonActive]}><Ionicons name={item.icon} size={19} color={active ? colors.paper : colors.roseDeep} /><Text style={[styles.audienceText, active && styles.audienceTextActive]}>{item.short}</Text></Pressable>;
              })}
            </View>
          </View>

          <View style={styles.searchWrap}><Ionicons name="search-outline" size={18} color={colors.teal} /><TextInput value={query} onChangeText={setQuery} placeholder="Rechercher : douleur, désir, contraception…" placeholderTextColor={colors.muted} style={styles.searchInput} /><Text style={styles.resultCount}>{articles.length}</Text></View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {CATEGORIES.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categoryActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}
          </ScrollView>

          <View style={styles.featured}>
            <View style={styles.featuredIcon}><Ionicons name="heart-circle-outline" size={26} color={colors.paper} /></View>
            <View style={styles.featuredCopy}><Text style={styles.featuredTitle}>Votre confort et votre consentement passent avant tout.</Text><Text style={styles.featuredText}>La douleur, la peur ou la pression ne sont jamais le prix à payer pour une intimité.</Text></View>
          </View>

          <View style={styles.listHeader}><Text style={styles.listTitle}>{AUDIENCES.find((item) => item.value === audience)?.label}</Text><Text style={styles.updated}>SOURCES VÉRIFIÉES</Text></View>
          <View style={styles.list}>
            {articles.length ? articles.map((article) => <ArticleCard key={article.id} article={article} expanded={expanded === article.id} onToggle={() => setExpanded((current) => current === article.id ? null : article.id)} />) : <Card style={styles.empty}><Ionicons name="search-outline" size={24} color={colors.muted} /><Text style={styles.emptyTitle}>Aucun résultat</Text><Text style={styles.emptyText}>Essayez un autre mot ou affichez toutes les catégories.</Text></Card>}
          </View>

          <Card style={styles.consultCard}>
            <View style={styles.consultIcon}><Ionicons name="chatbubbles-outline" size={22} color={colors.teal} /></View>
            <View style={styles.consultCopy}><Text style={styles.consultTitle}>Préparer une consultation</Text><Text style={styles.consultText}>Notez depuis quand le changement existe, ce qui améliore ou aggrave, les médicaments, la douleur, votre ressenti et l’impact sur votre vie. Vous pouvez refuser ou interrompre un examen.</Text></View>
          </Card>

          <View style={styles.helpCard}>
            <Ionicons name="shield-outline" size={25} color={colors.paper} />
            <Text style={styles.helpTitle}>Violence, contrainte ou danger ?</Text>
            <Text style={styles.helpText}>Vous n’êtes pas responsable. En danger immédiat : 17 ou 112. Le 3919 écoute et oriente ; ce n’est pas un numéro d’urgence.</Text>
            <View style={styles.helpActions}><Pressable onPress={() => void Linking.openURL("tel:112")} style={styles.emergencyButton}><Ionicons name="call" size={16} color={colors.danger} /><Text style={styles.emergencyText}>Urgence 112</Text></Pressable><Pressable onPress={() => void Linking.openURL("tel:3919")} style={styles.supportButton}><Ionicons name="call-outline" size={16} color={colors.paper} /><Text style={styles.supportText}>Écoute 3919</Text></Pressable></View>
          </View>

          <Text style={styles.disclaimer}>Informations générales uniquement. Une douleur intense, un saignement important, un malaise, une agression récente ou une exposition au VIH nécessitent un avis professionnel sans attendre.</Text>
        </ScrollView>
      </SafeAreaView>
    </Page>
  );
}

function ArticleCard({ article, expanded, onToggle }: { article: SexualHealthArticle; expanded: boolean; onToggle: () => void }) {
  return (
    <Card style={styles.articleCard}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={onToggle}>
        <View style={styles.articleHeader}><View style={styles.articleIcon}><Ionicons name={article.icon} size={21} color={colors.roseDeep} /></View><View style={styles.articleHeading}><Text style={styles.articleCategory}>{article.category}</Text><Text style={styles.articleTitle}>{article.title}</Text></View><Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.teal} /></View>
        <Text style={styles.articleSummary}>{article.summary}</Text>
      </Pressable>
      {expanded ? <View style={styles.expanded}><Text style={styles.articleBody}>{article.body}</Text><View style={styles.points}>{article.keyPoints.map((point) => <View key={point} style={styles.point}><View style={styles.pointDot} /><Text style={styles.pointText}>{point}</Text></View>)}</View><Pressable accessibilityRole="link" onPress={() => void Linking.openURL(article.sourceUrl)} style={styles.source}><Ionicons name="open-outline" size={14} color={colors.teal} /><Text style={styles.sourceText}>{article.sourceLabel}</Text></Pressable></View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20, paddingBottom: 42 }, headingRow: { flexDirection: "row", alignItems: "flex-start" }, headingCopy: { flex: 1 }, privateBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "center", gap: 4 }, privateText: { color: colors.teal, fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  title: { marginTop: 8, color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: "900", letterSpacing: -0.8 }, accent: { color: colors.roseDeep }, subtitle: { marginTop: 10, color: colors.inkSoft, fontSize: 12, lineHeight: 19 },
  audiencePanel: { marginTop: 19, padding: 13, borderRadius: 20, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border }, panelLabel: { marginBottom: 9, color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.9 }, audienceRow: { flexDirection: "row", gap: 7 }, audienceButton: { flex: 1, minHeight: 62, paddingHorizontal: 4, borderRadius: 14, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", gap: 5 }, audienceButtonActive: { backgroundColor: colors.teal }, audienceText: { textAlign: "center", color: colors.inkSoft, fontSize: 8, fontWeight: "900" }, audienceTextActive: { color: colors.paper },
  searchWrap: { marginTop: 13, height: 49, paddingHorizontal: 13, borderRadius: 15, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 8 }, searchInput: { flex: 1, color: colors.ink, fontSize: 11 }, resultCount: { minWidth: 25, textAlign: "center", paddingVertical: 4, borderRadius: 999, color: colors.roseDeep, backgroundColor: colors.roseSoft, fontSize: 8, fontWeight: "900" },
  categories: { paddingVertical: 12, gap: 7 }, category: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border }, categoryActive: { backgroundColor: colors.roseSoft, borderColor: colors.rose }, categoryText: { color: colors.inkSoft, fontSize: 8, fontWeight: "800" }, categoryTextActive: { color: colors.roseDeep },
  featured: { padding: 16, borderRadius: 21, backgroundColor: colors.roseDeep, flexDirection: "row", alignItems: "center" }, featuredIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }, featuredCopy: { flex: 1, marginLeft: 12 }, featuredTitle: { color: colors.paper, fontSize: 12, lineHeight: 16, fontWeight: "900" }, featuredText: { marginTop: 4, color: "#F8DEE5", fontSize: 9, lineHeight: 14 },
  listHeader: { marginTop: 23, marginBottom: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, listTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" }, updated: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: 0.7 }, list: { gap: 10 }, articleCard: { shadowOpacity: 0.035 }, articleHeader: { flexDirection: "row", alignItems: "center" }, articleIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" }, articleHeading: { flex: 1, marginLeft: 11 }, articleCategory: { color: colors.roseDeep, fontSize: 7, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 }, articleTitle: { marginTop: 3, color: colors.ink, fontSize: 12, lineHeight: 16, fontWeight: "900" }, articleSummary: { marginTop: 10, color: colors.inkSoft, fontSize: 10, lineHeight: 16 }, expanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }, articleBody: { color: colors.ink, fontSize: 10, lineHeight: 17 }, points: { marginTop: 10, gap: 6 }, point: { flexDirection: "row", alignItems: "flex-start" }, pointDot: { width: 6, height: 6, marginTop: 5, marginRight: 7, borderRadius: 3, backgroundColor: colors.teal }, pointText: { flex: 1, color: colors.inkSoft, fontSize: 9, lineHeight: 14 }, source: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "center", gap: 5 }, sourceText: { color: colors.teal, fontSize: 8, fontWeight: "900" },
  empty: { alignItems: "center", paddingVertical: 25 }, emptyTitle: { marginTop: 8, color: colors.ink, fontSize: 12, fontWeight: "900" }, emptyText: { marginTop: 4, color: colors.muted, fontSize: 9 }, consultCard: { marginTop: 18, flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.tealMist, shadowOpacity: 0 }, consultIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.tealSoft, alignItems: "center", justifyContent: "center" }, consultCopy: { flex: 1, marginLeft: 11 }, consultTitle: { color: colors.teal, fontSize: 11, fontWeight: "900" }, consultText: { marginTop: 4, color: colors.inkSoft, fontSize: 9, lineHeight: 14 },
  helpCard: { marginTop: 15, padding: 18, borderRadius: 23, backgroundColor: colors.tealDeep }, helpTitle: { marginTop: 10, color: colors.paper, fontSize: 15, fontWeight: "900" }, helpText: { marginTop: 6, color: "#D7E8E5", fontSize: 10, lineHeight: 16 }, helpActions: { marginTop: 13, flexDirection: "row", gap: 8 }, emergencyButton: { flex: 1, height: 42, borderRadius: 13, backgroundColor: colors.paper, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }, emergencyText: { color: colors.danger, fontSize: 9, fontWeight: "900" }, supportButton: { flex: 1, height: 42, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.13)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }, supportText: { color: colors.paper, fontSize: 9, fontWeight: "900" }, disclaimer: { marginTop: 16, textAlign: "center", color: colors.muted, fontSize: 8, lineHeight: 13 },
});
