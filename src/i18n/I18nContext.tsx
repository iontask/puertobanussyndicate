import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SupportedLanguage, Direction, TranslationDictionary, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { fr } from './translations/fr';
import { ar } from './translations/ar';
import { en } from './translations/en';

interface I18nContextType {
  language: SupportedLanguage;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  dict: TranslationDictionary;
  t: (path: string, fallback?: string) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  fr,
  ar,
  en,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'syndikal_app_language';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'fr';
  });

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const direction: Direction = currentLanguageOption.direction;
  const isRTL = direction === 'rtl';
  const dict = dictionaries[language] || fr;

  useEffect(() => {
    // Dynamically apply direction and language attributes to the root html element
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);

    // Apply or remove rtl specific styling helper classes if desired
    if (isRTL) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }

    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language, direction, isRTL]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  /**
   * Safe key-path lookup helper, e.g. t('nav.dashboard') or t('common.save')
   */
  const t = (path: string, fallback?: string): string => {
    const parts = path.split('.');
    let current: any = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback || path;
      }
    }
    return typeof current === 'string' ? current : fallback || path;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        direction,
        isRTL,
        setLanguage,
        dict,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
      }}
    >
      <div dir={direction} className={`w-full min-h-screen ${isRTL ? 'font-arabic' : ''}`}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
