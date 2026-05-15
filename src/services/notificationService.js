import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CANONICAL_HOURS, ANGELUS_HOURS } from '../data/prayers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = 'cansaati_default';

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Çan Saati',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
    showBadge: false,
  });
}

function nextOccurrence(hour, minute) {
  const now = new Date();
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

export const notificationService = {
  async requestPermission() {
    try {
      await ensureChannel();
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  async scheduleAll(settings) {
    await ensureChannel();
    await this.cancelAll();
    const hours = settings.angelusOnly ? ANGELUS_HOURS : CANONICAL_HOURS;
    for (const hour of hours) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✝ Çan Saati',
          body: `${hour.latinName} — ${hour.time}`,
          sound: true,
          ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
        },
        trigger: { hour: hour.hour, minute: hour.minute, repeats: true },
      }).catch(() => {});
    }
  },

  async scheduleCustomReminder({ id, label, hour, minute, repeat }) {
    try {
      await ensureChannel();
      let trigger;
      if (repeat) {
        trigger = { hour, minute, repeats: true };
      } else {
        trigger = { date: nextOccurrence(hour, minute) };
      }
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: '🔔 Çan Saati',
          body: label,
          sound: true,
          ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
        },
        trigger,
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
