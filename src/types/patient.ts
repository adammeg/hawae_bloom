export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  startsAt: string;
  status: AppointmentStatus;
};

export type ReminderType = "appointment" | "medication" | "ultrasound" | "lab" | "custom";
export type ReminderFrequency = "once" | "daily" | "weekly" | "monthly";

export type DailyReminder = {
  id: string;
  title: string;
  notes?: string;
  time: string;
  type: ReminderType;
  frequency: ReminderFrequency;
  startDate: string;
  enabled: boolean;
  lastCompletedDate?: string;
  notificationId?: string;
  completed?: boolean;
  kind?: "treatment" | "appointment" | "wellbeing";
};

export type SymptomEntry = {
  id: string;
  createdAt: string;
  symptom: string;
  severity: number;
  notes: string;
  duration?: string;
  careContext?: string;
  guidance?: string;
  associatedSymptoms?: string[];
  alertReasons?: string[];
  alertLevel: "none" | "contact" | "urgent";
};

export type Measurement = {
  id: string;
  measuredAt: string;
  weightKg?: number;
  systolic?: number;
  diastolic?: number;
  glucoseMgDl?: number;
  glucoseTiming?: "fasting" | "1h" | "2h" | "other";
  lhMiUml?: number;
  fshMiUml?: number;
  progesteroneNgMl?: number;
  estradiolPgMl?: number;
  prolactinNgMl?: number;
};

export type ChatMessage = {
  id: string;
  body: string;
  sentAt: string;
  sender: "patient" | "care-team";
};

export type PatientAttachment = {
  id: string;
  name: string;
  uri: string;
  mimeType?: string;
  addedAt: string;
};

export type SharingConsent = {
  careTeam: boolean;
  documents: boolean;
  measurements: boolean;
  symptoms: boolean;
  updatedAt: string | null;
};

export type PatientRecord = {
  bloodType: string;
  allergies: string[];
  history: string[];
  currentTreatments: string[];
};

export type PatientData = {
  appointments: Appointment[];
  reminders: DailyReminder[];
  symptoms: SymptomEntry[];
  measurements: Measurement[];
  messages: ChatMessage[];
  attachments: PatientAttachment[];
  consent: SharingConsent;
  record: PatientRecord;
  notificationsEnabled: boolean;
};
