import type { PregnancyTip } from "@/src/types/content";

export const PREGNANCY_TIPS: PregnancyTip[] = [
  {
    id: "folates",
    trimester: 1,
    category: "Nutrition",
    title: "Les folates dès le début",
    summary: "Un petit geste quotidien qui accompagne les premières semaines.",
    body: "Parlez avec votre médecin d’une supplémentation adaptée en acide folique. Privilégiez aussi les légumes verts, légumineuses et agrumes dans une alimentation variée.",
    icon: "nutrition",
    featured: true,
  },
  {
    id: "fatigue",
    trimester: 1,
    category: "Bien-être",
    title: "Écouter la fatigue",
    summary: "Votre corps travaille beaucoup, même si cela ne se voit pas encore.",
    body: "Accordez-vous des pauses, hydratez-vous régulièrement et essayez de conserver des horaires de sommeil stables. Consultez si la fatigue devient brutale ou invalidante.",
    icon: "leaf",
  },
  {
    id: "movement",
    trimester: 2,
    category: "Bien-être",
    title: "Bouger avec douceur",
    summary: "La marche et les mouvements doux soutiennent le confort quotidien.",
    body: "En l’absence de contre-indication médicale, une activité modérée peut aider le sommeil, l’humeur et le dos. Demandez toujours un conseil personnalisé à votre soignant.",
    icon: "heart",
    featured: true,
  },
  {
    id: "appointments",
    trimester: 2,
    category: "Suivi",
    title: "Préparer chaque rendez-vous",
    summary: "Notez vos questions et les changements observés avant la consultation.",
    body: "Gardez une liste courte de vos symptômes, traitements et questions. Cela facilite un échange clair avec votre sage-femme ou votre médecin.",
    icon: "medical",
  },
  {
    id: "birth-plan",
    trimester: 3,
    category: "Préparation",
    title: "Votre projet de naissance",
    summary: "Exprimez vos préférences tout en gardant de la place pour l’imprévu.",
    body: "Discutez de vos souhaits avec l’équipe qui vous suit : accompagnement, mobilité, gestion de la douleur et premiers moments avec bébé.",
    icon: "heart",
    featured: true,
  },
  {
    id: "warning-signs",
    trimester: "all",
    category: "Suivi",
    title: "Quand demander rapidement de l’aide",
    summary: "Certains signes nécessitent un avis médical sans attendre.",
    body: "Saignement, douleur intense, perte de liquide, fièvre, maux de tête inhabituels ou diminution des mouvements du bébé : contactez votre maternité ou les urgences.",
    icon: "medical",
  },
];

export async function listPregnancyTips(): Promise<PregnancyTip[]> {
  return PREGNANCY_TIPS;
}
