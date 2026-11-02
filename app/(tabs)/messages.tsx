import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "@/components/brand";
import { DecorativeBackdrop, Page } from "@/components/ui";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";

export default function MessagesScreen() {
  const { data, sendMessage } = usePatientData();
  const [draft, setDraft] = useState("");

  function submit() {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  }

  return (
    <Page>
      <DecorativeBackdrop />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.header}>
            <View><BrandMark compact /><Text style={styles.title}>Messagerie</Text><Text style={styles.subtitle}>Équipe HawaeMD · réponse non urgente</Text></View>
            <View style={styles.online}><View style={styles.onlineDot} /><Text style={styles.onlineText}>DISPONIBLE</Text></View>
          </View>

          <View style={styles.urgentBanner}><Ionicons name="alert-circle-outline" size={18} color={colors.danger} /><Text style={styles.urgentText}>Cette messagerie n’est pas surveillée en continu. Pour une urgence, appelez le 15 ou le 112.</Text></View>

          <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
            {data.messages.map((message) => {
              const mine = message.sender === "patient";
              return (
                <View key={message.id} style={[styles.messageRow, mine && styles.messageRowMine]}>
                  {!mine ? <View style={styles.teamAvatar}><Ionicons name="medical" size={17} color={colors.teal} /></View> : null}
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTeam]}>
                    <Text style={[styles.body, mine && styles.bodyMine]}>{message.body}</Text>
                    <Text style={[styles.time, mine && styles.timeMine]}>{new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.sentAt))}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput value={draft} onChangeText={setDraft} placeholder="Écrire un message…" placeholderTextColor={colors.muted} multiline style={styles.input} />
            <Pressable accessibilityLabel="Envoyer le message" onPress={submit} style={[styles.send, !draft.trim() && styles.sendDisabled]}><Ionicons name="send" size={19} color={colors.paper} /></Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Page>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }, title: { marginTop: 15, color: colors.ink, fontSize: 25, fontWeight: "900" }, subtitle: { marginTop: 3, color: colors.muted, fontSize: 9 }, online: { marginBottom: 3, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "center", gap: 5 }, onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.teal }, onlineText: { color: colors.teal, fontSize: 7, fontWeight: "900" },
  urgentBanner: { marginHorizontal: 20, padding: 10, borderRadius: 13, backgroundColor: "#FFF1F4", flexDirection: "row", gap: 7, alignItems: "center" }, urgentText: { flex: 1, color: colors.danger, fontSize: 8, lineHeight: 12, fontWeight: "700" }, messages: { flexGrow: 1, padding: 20, gap: 12 }, messageRow: { flexDirection: "row", alignItems: "flex-end", maxWidth: "88%" }, messageRowMine: { alignSelf: "flex-end", justifyContent: "flex-end" }, teamAvatar: { width: 31, height: 31, marginRight: 7, borderRadius: 11, backgroundColor: colors.tealSoft, alignItems: "center", justifyContent: "center" }, bubble: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 17 }, bubbleTeam: { backgroundColor: colors.paper, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: colors.border }, bubbleMine: { backgroundColor: colors.teal, borderBottomRightRadius: 5 }, body: { color: colors.ink, fontSize: 11, lineHeight: 17 }, bodyMine: { color: colors.paper }, time: { marginTop: 5, color: colors.muted, fontSize: 7, textAlign: "right" }, timeMine: { color: "#BFE0DC" },
  composer: { padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.paper, flexDirection: "row", alignItems: "flex-end", gap: 8 }, input: { flex: 1, minHeight: 45, maxHeight: 100, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 16, backgroundColor: colors.cream, color: colors.ink, fontSize: 11 }, send: { width: 45, height: 45, borderRadius: 15, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" }, sendDisabled: { opacity: 0.4 },
});
