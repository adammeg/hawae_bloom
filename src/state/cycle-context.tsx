import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toIsoDate } from "@/src/lib/dates";
import { derivePmaStage, pregnancyProgress } from "@/src/lib/care-timeline";
import { getLocalValue, removeLocalValue, setLocalValue } from "@/src/lib/local-storage";
import type { CareMode } from "@/src/types/content";

const STORAGE_KEY = "hawae-patient-cycle-v1";

export type CycleSettings = {
  firstName: string;
  onboardingComplete: boolean;
  careMode: CareMode;
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  pregnancyTrimester: 1 | 2 | 3;
  pmaStage: 1 | 2 | 3 | 4 | 5 | 6;
  pmaTimelineEnabled: boolean;
  pmaProtocolType: "fiv" | "tec" | "iiu";
  pmaTreatmentStart: string;
  pmaProcedureDate: string;
  pmaResultDate: string;
};

const DEFAULT_SETTINGS: CycleSettings = {
  firstName: "",
  onboardingComplete: false,
  careMode: "cycle",
  lastPeriodStart: toIsoDate(new Date()),
  cycleLength: 28,
  periodLength: 5,
  pregnancyTrimester: 1,
  pmaStage: 1,
  pmaTimelineEnabled: false,
  pmaProtocolType: "fiv",
  pmaTreatmentStart: toIsoDate(new Date()),
  pmaProcedureDate: toIsoDate(new Date()),
  pmaResultDate: toIsoDate(new Date()),
};

type CycleContextValue = {
  settings: CycleSettings;
  hydrated: boolean;
  updateSettings: (patch: Partial<CycleSettings>) => void;
  markPeriodStart: (date: string) => void;
  reset: () => Promise<void>;
};

const CycleContext = createContext<CycleContextValue | null>(null);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function normalize(value: CycleSettings): CycleSettings {
  const normalized: CycleSettings = {
    ...value,
    firstName: value.firstName.trim().slice(0, 40),
    careMode:
      value.careMode === "pregnancy" || value.careMode === "pma"
        ? value.careMode
        : "cycle",
    cycleLength: clamp(value.cycleLength, 20, 45),
    periodLength: clamp(value.periodLength, 2, 10),
    pregnancyTrimester: pregnancyProgress(value.lastPeriodStart).trimester,
    pmaTimelineEnabled: Boolean(value.pmaTimelineEnabled),
    pmaProtocolType: value.pmaProtocolType === "tec" || value.pmaProtocolType === "iiu" ? value.pmaProtocolType : "fiv",
    pmaTreatmentStart: value.pmaTreatmentStart || toIsoDate(new Date()),
    pmaProcedureDate: value.pmaProcedureDate || toIsoDate(new Date()),
    pmaResultDate: value.pmaResultDate || toIsoDate(new Date()),
  };
  return { ...normalized, pmaStage: derivePmaStage(normalized) };
}

export function CycleProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void getLocalValue(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const stored = JSON.parse(raw) as Partial<CycleSettings>;
        setSettings(normalize({ ...DEFAULT_SETTINGS, ...stored }));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void setLocalValue(STORAGE_KEY, JSON.stringify(settings));
  }, [hydrated, settings]);

  const updateSettings = useCallback((patch: Partial<CycleSettings>) => {
    setSettings((current) => normalize({ ...current, ...patch }));
  }, []);

  const markPeriodStart = useCallback((date: string) => {
    setSettings((current) => ({ ...current, lastPeriodStart: date }));
  }, []);

  const reset = useCallback(async () => {
    await removeLocalValue(STORAGE_KEY);
    setSettings({ ...DEFAULT_SETTINGS, lastPeriodStart: toIsoDate(new Date()) });
  }, []);

  const effectiveSettings = useMemo(() => normalize(settings), [settings]);
  const value = useMemo(
    () => ({ settings: effectiveSettings, hydrated, updateSettings, markPeriodStart, reset }),
    [effectiveSettings, hydrated, updateSettings, markPeriodStart, reset],
  );

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycle(): CycleContextValue {
  const value = useContext(CycleContext);
  if (!value) throw new Error("useCycle must be used inside CycleProvider");
  return value;
}
