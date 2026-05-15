import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHoursForDenomination } from '../data/prayers';
import { useDenomination } from './DenominationContext';

function storageKey(denomination) {
  return `@customHours_${denomination || 'catholic'}_v1`;
}

function pad2(n) { return String(n).padStart(2, '0'); }

const PrayerHoursContext = createContext({ hours: [], updateHour: () => {}, resetHours: () => {} });

export function PrayerHoursProvider({ children }) {
  const { denomination } = useDenomination();
  const [hours, setHours] = useState(() => getHoursForDenomination(denomination));
  const prevDenom = useRef(denomination);

  useEffect(() => {
    const base = getHoursForDenomination(denomination);
    AsyncStorage.getItem(storageKey(denomination)).then(raw => {
      if (!raw) { setHours(base); return; }
      try {
        const overrides = JSON.parse(raw);
        setHours(base.map(h => {
          const ov = overrides[h.id];
          if (!ov) return h;
          return { ...h, hour: ov.hour, minute: ov.minute, time: `${pad2(ov.hour)}:${pad2(ov.minute)}` };
        }));
      } catch { setHours(base); }
    });
    prevDenom.current = denomination;
  }, [denomination]);

  const updateHour = async (id, hour, minute) => {
    const key = storageKey(denomination);
    const raw = await AsyncStorage.getItem(key).catch(() => null);
    const overrides = raw ? JSON.parse(raw) : {};
    overrides[id] = { hour, minute };
    await AsyncStorage.setItem(key, JSON.stringify(overrides));
    setHours(prev => prev.map(h => h.id === id
      ? { ...h, hour, minute, time: `${pad2(hour)}:${pad2(minute)}` }
      : h));
  };

  const resetHours = async () => {
    await AsyncStorage.removeItem(storageKey(denomination));
    setHours(getHoursForDenomination(denomination));
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
