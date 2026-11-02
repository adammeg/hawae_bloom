import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLocalValue, removeLocalValue, setLocalValue } from "@/src/lib/local-storage";
import { localDateKey } from "@/src/lib/reminders";
import type {
  Appointment,
  ChatMessage,
  DailyReminder,
  Measurement,
  PatientAttachment,
  PatientData,
  SharingConsent,
  SymptomEntry,
} from "@/src/types/patient";

const STORAGE_KEY = "hawae-patient-data-v1";

function futureDate(days: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const DEFAULT_DATA: PatientData = {
  appointments: [
    {
      id: "appointment-initial",
      doctorName: "Dr Sarah Benali",
      specialty: "Gynécologie-obstétrique",
      clinic: "Cabinet HawaeMD",
      startsAt: futureDate(4, 10, 30),
      status: "upcoming",
    },
  ],
  reminders: [
    { id: "reminder-water", title: "Prendre un moment pour vous hydrater", time: "09:00", type: "custom", frequency: "daily", startDate: localDateKey(), enabled: true },
    { id: "reminder-journal", title: "Compléter votre journal de symptômes", time: "20:00", type: "custom", frequency: "daily", startDate: localDateKey(), enabled: true },
  ],
  symptoms: [],
  measurements: [
    { id: "measure-1", measuredAt: futureDate(-14, 8), weightKg: 64.2, systolic: 118, diastolic: 76 },
    { id: "measure-2", measuredAt: futureDate(-7, 8), weightKg: 64.6, systolic: 116, diastolic: 75 },
    { id: "measure-3", measuredAt: futureDate(0, 8), weightKg: 64.8, systolic: 120, diastolic: 78 },
  ],
  messages: [
    { id: "message-welcome", body: "Bonjour, votre équipe HawaeMD reste disponible pour vos questions non urgentes.", sentAt: futureDate(-1, 14), sender: "care-team" },
  ],
  attachments: [],
  consent: { careTeam: false, documents: false, measurements: false, symptoms: false, updatedAt: null },
  record: {
    bloodType: "Non renseigné",
    allergies: ["Aucune allergie connue"],
    history: ["Dossier médical synchronisé avec HawaeMD"],
    currentTreatments: ["Aucun traitement renseigné"],
  },
  notificationsEnabled: false,
};

type PatientDataContextValue = {
  data: PatientData;
  hydrated: boolean;
  addAppointment: (appointment: Omit<Appointment, "id" | "status">) => void;
  cancelAppointment: (id: string) => void;
  toggleReminder: (id: string) => void;
  addReminder: (reminder: Omit<DailyReminder, "id">) => string;
  updateReminder: (id: string, patch: Partial<DailyReminder>) => void;
  deleteReminder: (id: string) => void;
  addSymptom: (entry: Omit<SymptomEntry, "id" | "createdAt">) => void;
  addMeasurement: (entry: Omit<Measurement, "id" | "measuredAt">) => void;
  sendMessage: (body: string) => void;
  addAttachment: (attachment: Omit<PatientAttachment, "id" | "addedAt">) => void;
  updateConsent: (patch: Partial<Omit<SharingConsent, "updatedAt">>) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  resetPatientData: () => Promise<void>;
};

const PatientDataContext = createContext<PatientDataContextValue | null>(null);

function normalizeReminder(reminder: Partial<DailyReminder> & Pick<DailyReminder, "id" | "title" | "time">): DailyReminder {
  const legacyType = reminder.kind === "treatment" ? "medication" : reminder.kind === "appointment" ? "appointment" : "custom";
  return {
    ...reminder,
    type: reminder.type ?? legacyType,
    frequency: reminder.frequency ?? "daily",
    startDate: reminder.startDate ?? localDateKey(),
    enabled: reminder.enabled ?? true,
  };
}

export function PatientDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void getLocalValue(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const stored = JSON.parse(raw) as Partial<PatientData>;
        setData({ ...DEFAULT_DATA, ...stored, reminders: (stored.reminders ?? DEFAULT_DATA.reminders).map(normalizeReminder) });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (hydrated) void setLocalValue(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const addAppointment = useCallback((appointment: Omit<Appointment, "id" | "status">) => {
    setData((current) => ({ ...current, appointments: [...current.appointments, { ...appointment, id: `appointment-${Date.now()}`, status: "upcoming" }] }));
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    setData((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, status: "cancelled" } : item) }));
  }, []);

  const toggleReminder = useCallback((id: string) => {
    const today = localDateKey();
    setData((current) => ({ ...current, reminders: current.reminders.map((item) => item.id === id ? { ...item, lastCompletedDate: item.lastCompletedDate === today ? undefined : today, completed: undefined } : item) }));
  }, []);

  const addReminder = useCallback((reminder: Omit<DailyReminder, "id">) => {
    const id = `reminder-${Date.now()}`;
    setData((current) => ({ ...current, reminders: [{ ...reminder, id }, ...current.reminders] }));
    return id;
  }, []);

  const updateReminder = useCallback((id: string, patch: Partial<DailyReminder>) => {
    setData((current) => ({ ...current, reminders: current.reminders.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setData((current) => ({ ...current, reminders: current.reminders.filter((item) => item.id !== id) }));
  }, []);

  const addSymptom = useCallback((entry: Omit<SymptomEntry, "id" | "createdAt">) => {
    setData((current) => ({ ...current, symptoms: [{ ...entry, id: `symptom-${Date.now()}`, createdAt: new Date().toISOString() }, ...current.symptoms] }));
  }, []);

  const addMeasurement = useCallback((entry: Omit<Measurement, "id" | "measuredAt">) => {
    setData((current) => ({ ...current, measurements: [...current.measurements, { ...entry, id: `measurement-${Date.now()}`, measuredAt: new Date().toISOString() }] }));
  }, []);

  const sendMessage = useCallback((body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const message: ChatMessage = { id: `message-${Date.now()}`, body: trimmed, sentAt: new Date().toISOString(), sender: "patient" };
    setData((current) => ({ ...current, messages: [...current.messages, message] }));
  }, []);

  const addAttachment = useCallback((attachment: Omit<PatientAttachment, "id" | "addedAt">) => {
    setData((current) => ({ ...current, attachments: [{ ...attachment, id: `attachment-${Date.now()}`, addedAt: new Date().toISOString() }, ...current.attachments] }));
  }, []);

  const updateConsent = useCallback((patch: Partial<Omit<SharingConsent, "updatedAt">>) => {
    setData((current) => ({ ...current, consent: { ...current.consent, ...patch, updatedAt: new Date().toISOString() } }));
  }, []);

  const setNotificationsEnabled = useCallback((notificationsEnabled: boolean) => {
    setData((current) => ({ ...current, notificationsEnabled }));
  }, []);

  const resetPatientData = useCallback(async () => {
    await removeLocalValue(STORAGE_KEY);
    setData(DEFAULT_DATA);
  }, []);

  const value = useMemo(() => ({
    data,
    hydrated,
    addAppointment,
    cancelAppointment,
    toggleReminder,
    addReminder,
    updateReminder,
    deleteReminder,
    addSymptom,
    addMeasurement,
    sendMessage,
    addAttachment,
    updateConsent,
    setNotificationsEnabled,
    resetPatientData,
  }), [data, hydrated, addAppointment, cancelAppointment, toggleReminder, addReminder, updateReminder, deleteReminder, addSymptom, addMeasurement, sendMessage, addAttachment, updateConsent, setNotificationsEnabled, resetPatientData]);

  return <PatientDataContext.Provider value={value}>{children}</PatientDataContext.Provider>;
}

export function usePatientData(): PatientDataContextValue {
  const value = useContext(PatientDataContext);
  if (!value) throw new Error("usePatientData must be used inside PatientDataProvider");
  return value;
}
