import { addDays, daysBetween, fromIsoDate, toIsoDate } from "@/src/lib/dates";
import type { CycleSettings } from "@/src/state/cycle-context";

export type PregnancyProgress = {
  gestationalDays: number;
  weeks: number;
  extraDays: number;
  trimester: 1 | 2 | 3;
  estimatedDueDate: Date;
};

export function pregnancyProgress(lastPeriodStart: string, today = new Date()): PregnancyProgress {
  const gestationalDays = Math.max(0, daysBetween(fromIsoDate(lastPeriodStart), today));
  const weeks = Math.floor(gestationalDays / 7);
  const extraDays = gestationalDays % 7;
  const trimester: 1 | 2 | 3 = gestationalDays < 14 * 7 ? 1 : gestationalDays < 28 * 7 ? 2 : 3;
  return { gestationalDays, weeks, extraDays, trimester, estimatedDueDate: addDays(lastPeriodStart, 280) };
}

export function derivePmaStage(settings: Pick<CycleSettings, "pmaTimelineEnabled" | "pmaTreatmentStart" | "pmaProcedureDate" | "pmaResultDate">, today = new Date()): 1 | 2 | 3 | 4 | 5 | 6 {
  if (!settings.pmaTimelineEnabled) return 1;
  const current = toIsoDate(today);
  if (current < settings.pmaTreatmentStart) return 2;
  if (current < settings.pmaProcedureDate) return 3;
  if (current === settings.pmaProcedureDate) return 4;
  if (current < settings.pmaResultDate) return 5;
  return 6;
}

export function isChronologicalProtocol(treatmentStart: string, procedureDate: string, resultDate: string): boolean {
  return treatmentStart <= procedureDate && procedureDate <= resultDate;
}
