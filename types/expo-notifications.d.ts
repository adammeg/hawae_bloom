declare module "expo-notifications" {
  export const AndroidImportance: { DEFAULT: number };
  export const SchedulableTriggerInputTypes: { DATE: "date"; DAILY: "daily"; WEEKLY: "weekly"; MONTHLY: "monthly" };
  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<{
      shouldShowBanner: boolean;
      shouldShowList: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }): void;
  export function getPermissionsAsync(): Promise<{ granted: boolean; status: string }>;
  export function requestPermissionsAsync(): Promise<{ granted: boolean; status: string }>;
  export function setNotificationChannelAsync(id: string, channel: { name: string; importance: number }): Promise<unknown>;
  export function scheduleNotificationAsync(request: {
    content: { title: string; body: string; data?: Record<string, unknown> };
    trigger:
      | { type: "date"; date: Date; channelId?: string }
      | { type: "daily"; hour: number; minute: number; channelId?: string }
      | { type: "weekly"; weekday: number; hour: number; minute: number; channelId?: string }
      | { type: "monthly"; day: number; hour: number; minute: number; channelId?: string };
  }): Promise<string>;
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
}
