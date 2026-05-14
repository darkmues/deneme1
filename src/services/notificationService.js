import * as Notifications from 'expo-notifications';
import { CANONICAL_HOURS } from '../data/prayers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleCanonicalHours(enabled = true) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;

    for (const hour of CANONICAL_HOURS) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 ${hour.name} — ${hour.turkishName}`,
          body: hour.description,
          sound: 'bell.wav',
        },
        trigger: {
          hour: hour.hour,
          minute: hour.minute,
          repeats: true,
        },
      });
    }
  },

  async scheduleCustomReminder({ id, label, hour, minute, repeat }) {
    await Notifications.scheduleNotificationAsync({
      identifier: `custom_${id}`,
      content: {
        title: `🔔 ${label}`,
        body: 'Özel dua hatırlatıcısı',
        sound: 'bell.wav',
      },
      trigger: repeat
        ? { hour, minute, repeats: true }
        : { date: nextOccurrence(hour, minute) },
    });
  },

  async cancelCustomReminder(id) {
    await Notifications.cancelScheduledNotificationAsync(`custom_${id}`);
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};

function nextOccurrence(hour, minute) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
}
