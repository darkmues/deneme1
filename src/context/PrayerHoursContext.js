import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CANONICAL_HOURS } from '../data/prayers';

const STORAGE_KEY = '@customHours_v1';
const PrayerHoursContext = createContext({ hours: CANONICAL_HOURS, updateHour: () => {}, resetHours: () => {} });

export function PrayerHoursProvider({ children }) {
  const [hours, setHours] = useState(CANONICAL_HOURS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const overrides = JSON.parse(raw);
        setHours(CANONICAL_HOURS.map(h => {
          const ov = overrides[h.id];
          if (!ov) return h;
          return { ...h, hour: ov.hour, minute: ov.minute, time: `${String(ov.hour).padStart(2,'0')}:${String(ov.minute).padStart(2,'0')}` };
        }));
      } catch {}
    });
  }, []);

  const updateHour = async (id, hour, minute) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
    const overrides = raw ? JSON.parse(raw) : {};
    overrides[id] = { hour, minute };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    setHours(prev => prev.map(h => h.id === id
      ? { ...h, hour, minute, time: `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}` }
      : h));
  };

  const resetHours = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setHours(CANONICAL_HOURS);
  };

  return (
    <PrayerHoursContext.Provider value={{ hours, updateHour, resetHours }}>
      {children}
    </PrayerHoursContext.Provider>
  );
}

export function usePrayerHours() {
  return useContext(PrayerHoursContext);
}
