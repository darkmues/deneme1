import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@denomination_v1';

const DenominationContext = createContext({
  denomination: null,
  setDenomination: () => {},
  isReady: false,
});

export function DenominationProvider({ children }) {
  const [denomination, setDenominationState] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => {
      if (v) setDenominationState(v);
      setIsReady(true);
    }).catch(() => setIsReady(true));
  }, []);

  const setDenomination = async (d) => {
    setDenominationState(d);
    await AsyncStorage.setItem(KEY, d).catch(() => {});
  };

  return (
    <DenominationContext.Provider value={{ denomination, setDenomination, isReady }}>
      {children}
    </DenominationContext.Provider>
  );
}

export const useDenomination = () => useContext(DenominationContext);
