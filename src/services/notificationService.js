import * as Notifications from 'expo-notifications';
import { CANONICAL_HOURS, ANGELUS_HOURS } from '../data/prayers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermission() {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  async scheduleAll(settings) {
    await this.cancelAll();
    const hours = settings.angelusOnly ? ANGELUS_HOURS : CANONICAL_HOURS;
    for (const hour of hours) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✝ Çan Saati',
          body: `${hour.latinName} — ${hour.time}`,
          sound: true,
        },
        trigger: { hour: hour.hour, minute: hour.minute, repeats: true },
      }).catch(() => {});
    }
  },

  async scheduleCustomReminder({ id, label, hour, minute, repeat }) {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: { title: '🔔 Çan Saati', body: label, sound: true },
        trigger: { hour, minute, repeats: repeat },
      });
    } catch {}
  },

  async cancelCustomReminder(id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
  },
};
