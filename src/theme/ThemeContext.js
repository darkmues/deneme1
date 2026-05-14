import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from './themes';

const STORAGE_KEY = '@theme_v1';
const ThemeContext = createContext({ colors: THEMES.darkGold, themeName: 'darkGold', changeTheme: () => {} });

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('darkGold');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved && THEMES[saved]) setThemeName(saved);
    });
  }, []);

  const changeTheme = async (name) => {
    if (!THEMES[name]) return;
    setThemeName(name);
    await AsyncStorage.setItem(STORAGE_KEY, name);
  };

  return (
    <ThemeContext.Provider value={{ colors: THEMES[themeName], themeName, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
