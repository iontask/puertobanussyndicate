import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { SupportedLanguage } from '../../i18n/types';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, setLanguage, languages, currentLanguageOption, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="btn-language-switcher"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/20 active:scale-98"
        aria-label="Changer de langue / Change language / تغيير اللغة"
      >
        <span className="text-sm leading-none">{currentLanguageOption.flag}</span>
        {!compact && (
          <span className="font-medium text-slate-800">
            {currentLanguageOption.code.toUpperCase()}
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            isRTL ? 'left-0' : 'right-0'
          } mt-2 w-44 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-slate-400" />
            <span>Langue / Language / اللغة</span>
          </div>

          <div className="py-1">
            {languages.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  id={`btn-lang-${item.code}`}
                  onClick={() => handleSelect(item.code)}
                  className={`w-full px-3 py-2 text-xs flex items-center justify-between transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight">{item.nativeName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
