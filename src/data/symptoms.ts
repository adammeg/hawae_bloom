import type { CycleSettings } from "@/src/state/cycle-context";
import type { CareMode } from "@/src/types/content";
import type { SymptomEntry } from "@/src/types/patient";

export type SymptomCategory = "Général" | "Douleur" | "Saignements" | "Digestif" | "Urinaire" | "Intime" | "Grossesse" | "PMA" | "Émotionnel";

export type SymptomDefinition = {
  id: string;
  label: string;
  category: SymptomCategory;
  modes: CareMode[];
  trimesters?: Array<1 | 2 | 3>;
  pmaStages?: Array<1 | 2 | 3 | 4 | 5 | 6>;
  baseLevel?: SymptomEntry["alertLevel"];
  contactAt?: number;
  urgentAt?: number;
  guidance: string;
};

const ALL_MODES: CareMode[] = ["cycle", "pregnancy", "pma"];

export const SYMPTOM_CATALOG: SymptomDefinition[] = [
  { id: "fatigue", label: "Fatigue inhabituelle", category: "Général", modes: ALL_MODES, contactAt: 8, guidance: "Notez le début, le retentissement sur vos activités et les symptômes associés." },
  { id: "fever", label: "Fièvre ≥ 38 °C", category: "Général", modes: ALL_MODES, baseLevel: "contact", urgentAt: 8, guidance: "Une fièvre nécessite un avis, particulièrement pendant une grossesse ou après un geste de PMA." },
  { id: "dizziness", label: "Vertiges ou malaise", category: "Général", modes: ALL_MODES, baseLevel: "contact", urgentAt: 7, guidance: "Allongez-vous en sécurité. Un malaise intense, une perte de connaissance ou un saignement associé est une urgence." },
  { id: "breathlessness", label: "Essoufflement inhabituel", category: "Général", modes: ALL_MODES, baseLevel: "contact", urgentAt: 6, guidance: "S’il persiste au repos, apparaît brutalement ou s’accompagne de douleur thoracique, demandez une aide urgente." },
  { id: "chest-pain", label: "Douleur dans la poitrine", category: "Douleur", modes: ALL_MODES, baseLevel: "urgent", guidance: "Une douleur thoracique nécessite une évaluation médicale immédiate." },
  { id: "calf", label: "Mollet gonflé, dur ou douloureux", category: "Douleur", modes: ALL_MODES, baseLevel: "urgent", guidance: "Ce signe peut évoquer une phlébite et nécessite une évaluation urgente." },
  { id: "headache", label: "Maux de tête", category: "Douleur", modes: ["cycle", "pma"], contactAt: 7, guidance: "Précisez si la douleur est nouvelle, persistante ou accompagnée de troubles visuels." },
  { id: "emotional", label: "Anxiété, tristesse ou détresse", category: "Émotionnel", modes: ALL_MODES, contactAt: 7, guidance: "Votre santé psychique fait partie du suivi. En cas d’idées suicidaires ou de danger immédiat, appelez le 15/112." },

  { id: "cycle-cramps", label: "Crampes menstruelles", category: "Douleur", modes: ["cycle"], contactAt: 7, guidance: "Notez leur lien avec les règles, leur durée et l’efficacité des mesures habituelles." },
  { id: "cycle-pelvic", label: "Douleur pelvienne", category: "Douleur", modes: ["cycle"], contactAt: 6, urgentAt: 9, guidance: "Une douleur brutale, intense, unilatérale, avec malaise ou possibilité de grossesse doit être évaluée rapidement." },
  { id: "cycle-heavy-bleeding", label: "Règles très abondantes", category: "Saignements", modes: ["cycle"], baseLevel: "contact", urgentAt: 8, guidance: "Précisez le nombre de protections, les caillots et tout vertige, pâleur ou essoufflement." },
  { id: "cycle-between-bleeding", label: "Saignement entre les règles", category: "Saignements", modes: ["cycle"], baseLevel: "contact", urgentAt: 8, guidance: "Un saignement inhabituel mérite un bilan, notamment s’il se répète ou survient après un rapport." },
  { id: "cycle-irregular", label: "Règles absentes ou irrégulières", category: "Saignements", modes: ["cycle"], contactAt: 7, guidance: "Notez les dates et réalisez un test de grossesse si cette possibilité existe." },
  { id: "cycle-discharge", label: "Pertes vaginales inhabituelles", category: "Intime", modes: ["cycle"], baseLevel: "contact", guidance: "Précisez couleur, odeur, quantité, démangeaisons, douleur ou fièvre associée." },
  { id: "cycle-itching", label: "Démangeaisons ou brûlures", category: "Intime", modes: ["cycle"], contactAt: 6, guidance: "Évitez l’automédication si le symptôme est nouveau, persistant ou récidivant." },
  { id: "cycle-dyspareunia", label: "Douleur pendant les rapports", category: "Intime", modes: ["cycle"], contactAt: 6, guidance: "Notez si la douleur est superficielle ou profonde et depuis quand elle existe." },
  { id: "cycle-urinary", label: "Brûlures urinaires", category: "Urinaire", modes: ["cycle"], baseLevel: "contact", urgentAt: 8, guidance: "Consultez rapidement si fièvre, douleur du dos, sang dans les urines ou aggravation." },

  { id: "pma-injection", label: "Réaction au point d’injection", category: "PMA", modes: ["pma"], pmaStages: [2, 3], contactAt: 7, guidance: "Notez rougeur, gonflement et évolution. Contactez le centre si la réaction s’étend ou vous inquiète." },
  { id: "pma-pelvic", label: "Douleur ou gêne pelvienne", category: "PMA", modes: ["pma"], contactAt: 6, urgentAt: 8, guidance: "Notez le côté, l’évolution et le lien avec le protocole. Une douleur brutale ou croissante doit être évaluée rapidement." },
  { id: "pma-emotional", label: "Charge émotionnelle du parcours", category: "PMA", modes: ["pma"], contactAt: 7, guidance: "Parlez-en à l’équipe : un soutien psychologique peut faire partie intégrante du parcours de PMA." },
  { id: "pma-bloating", label: "Ballonnements ou pesanteur pelvienne", category: "PMA", modes: ["pma"], pmaStages: [3, 4, 5, 6], contactAt: 7, guidance: "Surveillez l’évolution et suivez les consignes de votre centre de PMA." },
  { id: "pma-swelling", label: "Ventre rapidement gonflé", category: "PMA", modes: ["pma"], pmaStages: [3, 4, 5, 6], baseLevel: "contact", urgentAt: 7, guidance: "Ce signe peut faire partie d’une hyperstimulation ovarienne. Contactez votre centre sans attendre s’il progresse." },
  { id: "pma-weight", label: "Prise de poids rapide", category: "PMA", modes: ["pma"], pmaStages: [3, 4, 5, 6], baseLevel: "contact", urgentAt: 8, guidance: "Notez le poids et le délai. Une hausse rapide avec ventre gonflé ou gêne respiratoire nécessite un avis rapide." },
  { id: "pma-urine", label: "Urines nettement diminuées ou foncées", category: "Urinaire", modes: ["pma"], pmaStages: [3, 4, 5, 6], baseLevel: "urgent", guidance: "Contactez immédiatement le centre de PMA ou les urgences : cela peut être un signe d’hyperstimulation sévère." },
  { id: "pma-abdominal-pain", label: "Douleur abdominale après traitement ou ponction", category: "Douleur", modes: ["pma"], pmaStages: [4, 5, 6], baseLevel: "contact", urgentAt: 7, guidance: "Une douleur forte, croissante, non soulagée ou associée à vomissements, fièvre ou malaise exige un avis urgent." },
  { id: "pma-vomiting", label: "Nausées ou vomissements importants", category: "Digestif", modes: ["pma"], pmaStages: [3, 4, 5, 6], baseLevel: "contact", urgentAt: 8, guidance: "Si vous ne gardez plus les liquides ou si les vomissements s’associent à un ventre gonflé, contactez rapidement le centre." },
  { id: "pma-bleeding", label: "Saignement vaginal", category: "Saignements", modes: ["pma"], baseLevel: "contact", urgentAt: 8, guidance: "Suivez les consignes reçues après le geste. Un saignement abondant, une douleur forte ou un malaise est urgent." },

  { id: "preg-t1-nausea", label: "Nausées", category: "Digestif", modes: ["pregnancy"], trimesters: [1], contactAt: 8, guidance: "Notez les aliments et boissons tolérés et l’impact sur votre quotidien." },
  { id: "preg-t1-vomiting", label: "Vomissements répétés", category: "Digestif", modes: ["pregnancy"], trimesters: [1], baseLevel: "contact", urgentAt: 8, guidance: "Consultez rapidement si vous ne gardez plus les liquides, urinez peu, perdez du poids ou vous sentez très faible." },
  { id: "preg-t1-breast", label: "Tension mammaire", category: "Grossesse", modes: ["pregnancy"], trimesters: [1], contactAt: 8, guidance: "Fréquente au premier trimestre ; notez toute masse, rougeur ou fièvre associée." },
  { id: "preg-t1-cramps", label: "Tiraillements du bas-ventre", category: "Douleur", modes: ["pregnancy"], trimesters: [1], contactAt: 6, urgentAt: 8, guidance: "Une douleur forte, persistante, unilatérale ou associée à un saignement doit être évaluée sans délai." },
  { id: "preg-t1-bleeding", label: "Saignement vaginal", category: "Saignements", modes: ["pregnancy"], trimesters: [1], baseLevel: "contact", urgentAt: 7, guidance: "Tout saignement au premier trimestre nécessite un avis dans un délai court ; urgence s’il est abondant ou associé à douleur, fièvre ou malaise." },
  { id: "preg-t1-one-sided", label: "Douleur d’un seul côté", category: "Douleur", modes: ["pregnancy"], trimesters: [1], baseLevel: "urgent", guidance: "Une grossesse extra-utérine doit être exclue, surtout avec saignement, douleur d’épaule ou malaise." },
  { id: "preg-t1-shoulder", label: "Douleur au bout de l’épaule", category: "Douleur", modes: ["pregnancy"], trimesters: [1], baseLevel: "urgent", guidance: "Ce signe associé à une grossesse possible nécessite un avis médical urgent." },

  { id: "preg-reflux", label: "Reflux ou brûlures d’estomac", category: "Digestif", modes: ["pregnancy"], trimesters: [2, 3], contactAt: 8, guidance: "Notez les circonstances. Une douleur forte sous les côtes qui persiste n’est pas un simple reflux et doit être évaluée." },
  { id: "preg-constipation", label: "Constipation", category: "Digestif", modes: ["pregnancy"], trimesters: [2, 3], contactAt: 8, guidance: "Notez la durée et les douleurs associées ; demandez conseil avant de prendre un traitement." },
  { id: "preg-ligament", label: "Tiraillements ligamentaires", category: "Douleur", modes: ["pregnancy"], trimesters: [2, 3], contactAt: 7, guidance: "Une douleur brève liée aux mouvements peut être fréquente ; consultez si elle devient forte, persistante ou s’accompagne d’autres signes." },
  { id: "preg-leg-heaviness", label: "Jambes lourdes ou chevilles progressivement gonflées", category: "Grossesse", modes: ["pregnancy"], trimesters: [2, 3], contactAt: 7, guidance: "Signalez l’évolution au suivi. Un seul mollet gonflé et douloureux ou un gonflement soudain nécessite un avis urgent." },
  { id: "preg-back", label: "Douleur lombaire", category: "Douleur", modes: ["pregnancy"], trimesters: [2, 3], contactAt: 7, urgentAt: 9, guidance: "Consultez si elle est intense, rythmée, associée à fièvre, contractions, saignement ou perte de liquide." },
  { id: "preg-headache", label: "Mal de tête sévère ou persistant", category: "Douleur", modes: ["pregnancy"], trimesters: [2, 3], baseLevel: "urgent", guidance: "Après 20 semaines, ce signe peut nécessiter une recherche de pré-éclampsie, surtout avec troubles visuels ou œdèmes." },
  { id: "preg-vision", label: "Vision trouble, points lumineux", category: "Grossesse", modes: ["pregnancy"], trimesters: [2, 3], baseLevel: "urgent", guidance: "Contactez immédiatement la maternité : ce signe peut être associé à une pré-éclampsie." },
  { id: "preg-edema", label: "Gonflement soudain visage, mains ou pieds", category: "Grossesse", modes: ["pregnancy"], trimesters: [2, 3], baseLevel: "urgent", guidance: "Un gonflement rapide, surtout avec prise de poids, céphalée ou trouble visuel, doit être évalué immédiatement." },
  { id: "preg-rib-pain", label: "Douleur forte sous les côtes", category: "Douleur", modes: ["pregnancy"], trimesters: [2, 3], baseLevel: "urgent", guidance: "Cette douleur peut être un signe de pré-éclampsie et nécessite un avis immédiat." },
  { id: "preg-late-bleeding", label: "Saignement vaginal", category: "Saignements", modes: ["pregnancy"], trimesters: [2, 3], baseLevel: "urgent", guidance: "Tout saignement au deuxième ou troisième trimestre nécessite une évaluation immédiate à la maternité." },
  { id: "preg-fluid", label: "Perte de liquide", category: "Grossesse", modes: ["pregnancy"], trimesters: [2, 3], baseLevel: "urgent", guidance: "Notez l’heure, la couleur et la quantité, puis contactez immédiatement la maternité." },
  { id: "preg-contractions", label: "Contractions régulières ou douloureuses", category: "Grossesse", modes: ["pregnancy"], trimesters: [2, 3], baseLevel: "contact", urgentAt: 6, guidance: "Avant 37 semaines ou si elles persistent au repos, contactez immédiatement la maternité." },
  { id: "preg-movements", label: "Bébé bouge moins ou différemment", category: "Grossesse", modes: ["pregnancy"], trimesters: [2, 3], baseLevel: "urgent", guidance: "Contactez immédiatement la maternité et n’attendez pas le lendemain. Ne vous fiez pas à un doppler domestique." },
];

export function symptomsForSettings(settings: CycleSettings): SymptomDefinition[] {
  return SYMPTOM_CATALOG.filter((symptom) => {
    if (!symptom.modes.includes(settings.careMode)) return false;
    if (settings.careMode === "pregnancy" && symptom.trimesters && !symptom.trimesters.includes(settings.pregnancyTrimester)) return false;
    if (settings.careMode === "pma" && symptom.pmaStages && !symptom.pmaStages.includes(settings.pmaStage)) return false;
    return true;
  });
}

export function symptomAlertLevel(symptom: SymptomDefinition, severity: number): SymptomEntry["alertLevel"] {
  if (symptom.baseLevel === "urgent" || (symptom.urgentAt && severity >= symptom.urgentAt)) return "urgent";
  if (symptom.baseLevel === "contact" || (symptom.contactAt && severity >= symptom.contactAt) || severity >= 9) return "contact";
  return "none";
}

const LEVEL_RANK: Record<SymptomEntry["alertLevel"], number> = { none: 0, contact: 1, urgent: 2 };

export function combinedSymptomAssessment(symptoms: SymptomDefinition[], primarySeverity: number): { level: SymptomEntry["alertLevel"]; reasons: string[] } {
  let level: SymptomEntry["alertLevel"] = "none";
  const reasons: string[] = [];
  const ids = new Set(symptoms.map((item) => item.id));
  const labels = new Set(symptoms.map((item) => item.label));
  const elevate = (next: SymptomEntry["alertLevel"], reason: string) => { if (LEVEL_RANK[next] > LEVEL_RANK[level]) level = next; if (!reasons.includes(reason)) reasons.push(reason); };

  symptoms.forEach((symptom, index) => {
    const individual = symptomAlertLevel(symptom, index === 0 ? primarySeverity : 3);
    if (individual !== "none") elevate(individual, `${symptom.label} : niveau de vigilance propre à ce signe.`);
  });

  if (ids.has("chest-pain") && ids.has("breathlessness")) elevate("urgent", "Douleur thoracique associée à un essoufflement.");
  if (ids.has("calf") && (ids.has("breathlessness") || ids.has("chest-pain"))) elevate("urgent", "Signe du mollet associé à un symptôme thoracique ou respiratoire.");
  if (labels.has("Vertiges ou malaise") && symptoms.some((item) => item.category === "Saignements")) elevate("urgent", "Saignement associé à des vertiges ou un malaise.");
  if (ids.has("preg-t1-bleeding") && ["preg-t1-one-sided", "preg-t1-shoulder", "preg-t1-cramps", "dizziness", "fever"].some((id) => ids.has(id))) elevate("urgent", "Saignement du premier trimestre associé à douleur, malaise ou fièvre.");
  if (ids.has("cycle-pelvic") && ["fever", "cycle-discharge", "cycle-dyspareunia"].some((id) => ids.has(id))) elevate("contact", "Douleur pelvienne associée à un signe infectieux ou à des pertes anormales.");
  if (ids.has("cycle-urinary") && (ids.has("fever") || ids.has("cycle-pelvic"))) elevate("urgent", "Symptôme urinaire associé à fièvre ou douleur pelvienne.");

  const ohssIds = ["pma-swelling", "pma-weight", "pma-urine", "pma-abdominal-pain", "pma-vomiting", "breathlessness"];
  if (ohssIds.filter((id) => ids.has(id)).length >= 2) elevate("urgent", "Association de plusieurs signes compatibles avec une complication du protocole ou une hyperstimulation.");
  const preeclampsiaIds = ["preg-headache", "preg-vision", "preg-edema", "preg-rib-pain"];
  if (preeclampsiaIds.filter((id) => ids.has(id)).length >= 2) elevate("urgent", "Association de plusieurs signes d’alerte hypertensive de la grossesse.");
  if (ids.has("preg-contractions") && (ids.has("preg-fluid") || ids.has("preg-late-bleeding"))) elevate("urgent", "Contractions associées à une perte de liquide ou un saignement.");

  return { level, reasons };
}

export function careContextLabel(settings: CycleSettings): string {
  if (settings.careMode === "pregnancy") return `Grossesse · T${settings.pregnancyTrimester}`;
  if (settings.careMode === "pma") return `PMA · étape ${settings.pmaStage}/6`;
  return "Cycle & gynécologie";
}

export const SYMPTOM_SOURCES: Record<CareMode, Array<{ label: string; url: string }>> = {
  cycle: [
    { label: "HAS · Infections génitales hautes", url: "https://www.has-sante.fr/jcms/p_3575605/fr/choix-et-durees-d-antibiotherapie-dans-les-infections-genitales-hautes-non-compliquees" },
    { label: "Assurance Maladie · Saignements anormaux", url: "https://www.ameli.fr/assure/sante/themes/saignements-gynecologiques-anormaux/saignements-entre-les-regles-ou-regles-tres-abondantes-longues-le-bilan" },
  ],
  pregnancy: [
    { label: "Assurance Maladie · Pré-éclampsie", url: "https://www.ameli.fr/assure/sante/devenir-parent/grossesse/difficultes-et-maladies-pendant-la-grossesse/preeclampsie/diagnostic-evolution" },
    { label: "RCOG · Mouvements du bébé", url: "https://www.rcog.org.uk/for-the-public/browse-our-patient-information/your-babys-movements-in-pregnancy/" },
  ],
  pma: [
    { label: "ESHRE 2025 · Stimulation ovarienne", url: "https://www.eshre.eu/OSGuideline" },
    { label: "RCOG · Hyperstimulation ovarienne", url: "https://www.rcog.org.uk/media/d3uf5eux/pi_ohss.pdf" },
  ],
};
