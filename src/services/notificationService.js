// Bildirimler şu an devre dışı — Firebase kurulumu gerekiyor
// Çan sesi ve zaman takibi uygulama içinde çalışmaya devam eder

export const notificationService = {
  async requestPermissions() { return false; },
  async scheduleCanonicalHours() {},
  async scheduleCustomReminder() {},
  async cancelCustomReminder() {},
  async cancelAll() {},
};
