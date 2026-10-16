import { createContext, useState, useEffect, useCallback } from "react";
import { translations, interpolate } from "../i18n/translations.js";

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const raw = translations[lang]?.[key] ?? translations.en[key] ?? key;
      return vars ? interpolate(raw, vars) : raw;
    },
    [lang],
  );

  const toggleLang = useCallback(() => {
    setLang((l) => (l === "en" ? "am" : "en"));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
