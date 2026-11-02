export type Doctor = {
  id: string;
  name: string;
  specialty: "Gynécologie" | "Obstétrique" | "Fertilité";
  city: string;
  clinic: string;
  rating: number;
  nextAvailability: string;
  languages: string[];
  initials: string;
  accent: string;
};

export type CareMode = "cycle" | "pregnancy" | "pma";

export type CareTip = {
  id: string;
  mode: CareMode;
  trimester?: 1 | 2 | 3 | "all";
  category: string;
  title: string;
  summary: string;
  body: string;
  icon: "leaf" | "nutrition" | "medical" | "heart";
  featured?: boolean;
  sourceLabel: string;
  sourceUrl: string;
};

export type PregnancyTip = {
  id: string;
  trimester: 1 | 2 | 3 | "all";
  category: "Bien-être" | "Nutrition" | "Suivi" | "Préparation";
  title: string;
  summary: string;
  body: string;
  icon: "leaf" | "nutrition" | "medical" | "heart";
  featured?: boolean;
};
