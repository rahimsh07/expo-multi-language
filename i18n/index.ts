import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEn from "./locales/en-Us/translation.json";
import translationPt from "./locales/pt-BR/translation.json";
import translationZh from "./locales/zh-CN/translation.json";

const resources = {
  "pt-BR": { translation: translationPt },
  "en-US": { translation: translationEn },
  "zh-CN": { translation: translationZh },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageTag;
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage,
    fallbackLng: "pt-BR",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;