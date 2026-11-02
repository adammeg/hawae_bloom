import type { Doctor } from "@/src/types/content";

export const STATIC_DOCTORS: Doctor[] = [
  {
    id: "dr-ben-salem",
    name: "Dr Amira Ben Salem",
    specialty: "Gynécologie",
    city: "Tunis",
    clinic: "Clinique Hawae Lac",
    rating: 4.9,
    nextAvailability: "Demain · 10:30",
    languages: ["Français", "Arabe"],
    initials: "AB",
    accent: "#D87992",
  },
  {
    id: "dr-mansour",
    name: "Dr Leïla Mansour",
    specialty: "Obstétrique",
    city: "La Marsa",
    clinic: "Centre Maternité Jasmin",
    rating: 4.8,
    nextAvailability: "Jeu. · 15:00",
    languages: ["Français", "Arabe", "Anglais"],
    initials: "LM",
    accent: "#0A5C5C",
  },
  {
    id: "dr-trabelsi",
    name: "Dr Inès Trabelsi",
    specialty: "Fertilité",
    city: "Sousse",
    clinic: "Institut Espoir",
    rating: 4.7,
    nextAvailability: "Lun. · 09:00",
    languages: ["Français", "Arabe"],
    initials: "IT",
    accent: "#C7A65A",
  },
  {
    id: "dr-gharbi",
    name: "Dr Nour Gharbi",
    specialty: "Gynécologie",
    city: "Sfax",
    clinic: "Cabinet El Hana",
    rating: 4.9,
    nextAvailability: "Ven. · 11:45",
    languages: ["Français", "Arabe"],
    initials: "NG",
    accent: "#8A6B8E",
  },
];

/** Replace this implementation with the HawaeMD API adapter when available. */
export async function listDoctors(): Promise<Doctor[]> {
  return STATIC_DOCTORS;
}
