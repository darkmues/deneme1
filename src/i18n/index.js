import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tr from './locales/tr';
import en from './locales/en';
import de from './locales/de';
import fr from './locales/fr';
import es from './locales/es';
import it from './locales/it';
import pt from './locales/pt';
import ru from './locales/ru';
import ar from './locales/ar';
import zh from './locales/zh';
import ja from './locales/ja';
import ko from './locales/ko';
import pl from './locales/pl';
import nl from './locales/nl';

const LOCALES = { tr, en, de, fr, es, it, pt, ru, ar, zh, ja, ko, pl, nl };

export const LANGUAGES = [
  { code: 'tr', name: 'Türkçe',    flag: '🇹🇷' },
  { code: 'en', name: 'English',   flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷' },
  { code: 'es', name: 'Español',   flag: '🇪🇸' },
  { code: 'it', name: 'Italiano',  flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский',   flag: '🇷🇺' },
  { code: 'ar', name: 'العربية',   flag: '🇸🇦' },
  { code: 'zh', name: '中文',       flag: '🇨🇳' },
  { code: 'ja', name: '日本語',     flag: '🇯🇵' },
  { code: 'ko', name: '한국어',     flag: '🇰🇷' },
  { code: 'pl', name: 'Polski',    flag: '🇵🇱' },
  { code: 'nl', name: 'Nederlands',flag: '🇳🇱' },
];

const STORAGE_KEY = '@locale_v1';

function detectDeviceLanguage() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.split('-')[0];
  } catch {
    return 'tr';
  }
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('tr');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved && LOCALES[saved]) {
        setLocale(saved);
      } else {
        const lang = detectDeviceLanguage();
        setLocale(LOCALES[lang] ? lang : 'tr');
      }
    });
  }, []);

  const changeLocale = async (lang) => {
    if (!LOCALES[lang]) return;
    setLocale(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  };

  // t(key, params?) — dot-notation key, optional {placeholder: value} interpolation
  const t = (key, params) => {
    const keys = key.split('.');
    let value = LOCALES[locale];
    for (const k of keys) value = value?.[k];
    if (value === undefined) {
      value = LOCALES.en;
      for (const k of keys) value = value?.[k];
    }
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    }
    return value ?? key;
  };

  return (
    <I18nContext.Provider value={{ locale, changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
