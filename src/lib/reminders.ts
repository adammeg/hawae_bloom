import type { DailyReminder, ReminderFrequency, ReminderType } from "@/src/types/patient";

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  appointment: "Rendez-vous", medication: "Médicament", ultrasound: "Échographie", lab: "Analyse ou examen", custom: "Autre rappel",
};

export const REMINDER_FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  once: "Une fois", daily: "Chaque jour", weekly: "Chaque semaine", monthly: "Chaque mois",
};

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseFrenchDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day) ? date : null;
}

export function formatFrenchInputDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function reminderDateTime(reminder: Pick<DailyReminder, "startDate" | "time">): Date {
  const date = new Date(`${reminder.startDate}T00:00:00`);
  const [hour, minute] = reminder.time.split(":").map(Number);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function isReminderDueOn(reminder: DailyReminder, date = new Date()): boolean {
  if (!reminder.enabled) return false;
  const start = reminderDateTime(reminder);
  const targetKey = localDateKey(date);
  const startKey = localDateKey(start);
  if (targetKey < startKey) return false;
  if (reminder.frequency === "once") return targetKey === startKey;
  if (reminder.frequency === "daily") return true;
  if (reminder.frequency === "weekly") return start.getDay() === date.getDay();
  return start.getDate() === date.getDate();
}

export function recurrenceDetail(reminder: Pick<DailyReminder, "frequency" | "startDate">): string {
  const date = new Date(`${reminder.startDate}T12:00:00`);
  if (reminder.frequency === "weekly") return `Chaque ${new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(date)}`;
  if (reminder.frequency === "monthly") return `Le ${date.getDate()} de chaque mois`;
  if (reminder.frequency === "once") return `Le ${new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date)}`;
  return REMINDER_FREQUENCY_LABELS.daily;
}
