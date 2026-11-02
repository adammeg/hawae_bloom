export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 2000, (month ?? 1) - 1, day ?? 1, 12);
}

export function addDays(value: string | Date, amount: number): Date {
  const date = typeof value === "string" ? fromIsoDate(value) : new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

export function daysBetween(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function formatShortDate(value: string | Date): string {
  const date = typeof value === "string" ? fromIsoDate(value) : value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatMonth(date: Date): string {
  const text = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type CyclePhase = "period" | "fertile" | "ovulation" | "predicted" | null;

export function getCyclePhase(
  date: Date,
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number,
): CyclePhase {
  const start = fromIsoDate(lastPeriodStart);
  const offset = daysBetween(start, date);
  if (offset >= 0 && offset < periodLength) return "period";
  if (offset < 0) return null;

  const cycleIndex = Math.floor(offset / cycleLength);
  const cycleDay = offset % cycleLength;
  if (cycleIndex >= 1 && cycleDay < periodLength) return "predicted";

  const ovulationDay = cycleLength - 14;
  if (cycleDay === ovulationDay) return "ovulation";
  if (cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1) return "fertile";
  return null;
}

export function getNextPeriodStart(lastPeriodStart: string, cycleLength: number): Date {
  let next = addDays(lastPeriodStart, cycleLength);
  const today = new Date();
  while (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = addDays(next, cycleLength);
  }
  return next;
}

export type MonthCell = { date: Date; iso: string; inMonth: boolean };

export function buildMonthGrid(month: Date): MonthCell[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const mondayIndex = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      iso: toIsoDate(date),
      inMonth: date.getMonth() === month.getMonth(),
    };
  });
}
