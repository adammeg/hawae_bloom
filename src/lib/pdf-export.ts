import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { CycleSettings } from "@/src/state/cycle-context";
import type { PatientData } from "@/src/types/patient";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]!);
}

export async function exportFollowUpPdf(settings: CycleSettings, data: PatientData): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.print();
    return;
  }

  const rows = data.measurements.map((item) => {
    const hormones = [
      item.lhMiUml !== undefined ? `LH ${item.lhMiUml} mUI/mL` : "",
      item.fshMiUml !== undefined ? `FSH ${item.fshMiUml} mUI/mL` : "",
      item.progesteroneNgMl !== undefined ? `Progestérone ${item.progesteroneNgMl} ng/mL` : "",
      item.estradiolPgMl !== undefined ? `Œstradiol ${item.estradiolPgMl} pg/mL` : "",
      item.prolactinNgMl !== undefined ? `Prolactinémie ${item.prolactinNgMl} ng/mL` : "",
    ].filter(Boolean).join(" · ");
    const glucoseContext = item.glucoseTiming === "fasting" ? "à jeun" : item.glucoseTiming === "1h" ? "à 1 h" : item.glucoseTiming === "2h" ? "à 2 h" : "autre";
    return `<tr><td>${new Date(item.measuredAt).toLocaleDateString("fr-FR")}</td><td>${item.weightKg ?? "—"}</td><td>${item.systolic && item.diastolic ? `${item.systolic}/${item.diastolic}` : "—"}</td><td>${item.glucoseMgDl !== undefined ? `${item.glucoseMgDl} (${glucoseContext})` : "—"}</td><td>${hormones || "—"}</td></tr>`;
  }).join("");
  const symptoms = data.symptoms.slice(0, 20).map((item) => `<li><strong>${escapeHtml(item.symptom)}</strong> · ${item.severity}/10 · ${new Date(item.createdAt).toLocaleDateString("fr-FR")}${item.notes ? ` — ${escapeHtml(item.notes)}` : ""}</li>`).join("");
  const appointments = data.appointments.filter((item) => item.status === "upcoming").map((item) => `<li>${escapeHtml(item.doctorName)} · ${new Date(item.startsAt).toLocaleString("fr-FR")}</li>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial;color:#193B3B;padding:28px}h1{color:#0A5C5C}h2{color:#A94866;margin-top:28px}.badge{display:inline-block;background:#F9E8ED;padding:7px 12px;border-radius:12px}table{width:100%;border-collapse:collapse;font-size:10px}td,th{border-bottom:1px solid #E5ECE9;padding:7px;text-align:left;vertical-align:top}li{margin:7px 0}.notice{margin-top:30px;padding:12px;background:#EFF8F6;font-size:11px}</style></head><body><h1>HawaeMD · Export du suivi</h1><p>Patiente : <strong>${escapeHtml(settings.firstName || "Non renseigné")}</strong></p><p class="badge">Mode : ${escapeHtml(settings.careMode)}</p><h2>Mesures</h2><table><thead><tr><th>Date</th><th>Poids (kg)</th><th>Tension (mmHg)</th><th>Glycémie (mg/dL)</th><th>Bilan hormonal</th></tr></thead><tbody>${rows || "<tr><td colspan='5'>Aucune mesure</td></tr>"}</tbody></table><h2>Symptômes récents</h2><ul>${symptoms || "<li>Aucune entrée</li>"}</ul><h2>Rendez-vous à venir</h2><ul>${appointments || "<li>Aucun rendez-vous</li>"}</ul><p class="notice">Document généré par la patiente. Ces informations ne remplacent pas le dossier médical ni l’avis d’un professionnel de santé.</p></body></html>`;
  const result = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", dialogTitle: "Exporter mon suivi HawaeMD" });
}
