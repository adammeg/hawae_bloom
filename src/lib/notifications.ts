import { Platform } from "react-native";
import { REMINDER_TYPE_LABELS, reminderDateTime } from "@/src/lib/reminders";
import type { Appointment, DailyReminder } from "@/src/types/patient";

let handlerConfigured = false;

async function nativeNotifications() {
  const Notifications = await import("expo-notifications");
  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }
  return Notifications;
}

export async function enableLocalNotifications(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const Notifications = await nativeNotifications();
  const current = await Notifications.getPermissionsAsync();
  const status = current.granted ? current.status : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("hawaemd-reminders", {
      name: "Rappels HawaeMD",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return true;
}

export async function scheduleAppointmentReminder(appointment: Appointment): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = await nativeNotifications();
  const reminderDate = new Date(appointment.startsAt);
  reminderDate.setHours(reminderDate.getHours() - 24);
  if (reminderDate.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Rendez-vous HawaeMD demain",
      body: `${appointment.doctorName} · ${appointment.clinic}`,
      data: { appointmentId: appointment.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: Platform.OS === "android" ? "hawaemd-reminders" : undefined,
    },
  });
}

export async function scheduleHealthReminder(reminder: DailyReminder): Promise<string | null> {
  if (Platform.OS === "web" || !reminder.enabled) return null;
  const Notifications = await nativeNotifications();
  const date = reminderDateTime(reminder);
  const [hour, minute] = reminder.time.split(":").map(Number);
  const channelId = Platform.OS === "android" ? "hawaemd-reminders" : undefined;
  let trigger: Parameters<typeof Notifications.scheduleNotificationAsync>[0]["trigger"];

  if (reminder.frequency === "once") {
    if (date.getTime() <= Date.now()) return null;
    trigger = { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId };
  } else if (reminder.frequency === "daily") {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId };
  } else if (reminder.frequency === "weekly") {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: date.getDay() + 1, hour, minute, channelId };
  } else {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: date.getDate(), hour, minute, channelId };
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${REMINDER_TYPE_LABELS[reminder.type]} · HawaeMD`,
      body: reminder.notes ? `${reminder.title} · ${reminder.notes}` : reminder.title,
      data: { reminderId: reminder.id, reminderType: reminder.type },
    },
    trigger,
  });
}

export async function cancelHealthReminder(notificationId?: string): Promise<void> {
  if (Platform.OS === "web" || !notificationId) return;
  const Notifications = await nativeNotifications();
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function clearScheduledNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = await nativeNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
}
