import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { createContext, useContext, useEffect, useState } from "react";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: Localization.getLocales()[0].languageTag || "en",
  setLanguage: () => { },
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<string>("en");

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem("language");
      if (storedLanguage) {
        setLanguageState(storedLanguage);
      }
    };
    
    loadLanguage();
  }, []);

  const setLanguage = async (lang: string) => {
    await AsyncStorage.setItem("language", lang);
    setLanguageState(lang); // triggers re-render in all subscribers
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
