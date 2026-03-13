import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/common.json";
import vi from "./locales/vi/common.json";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

const savedLanguage = typeof localStorage !== "undefined" ? localStorage.getItem("paperclip_lang") : null;
const defaultLng = savedLanguage === "en" || savedLanguage === "vi" ? savedLanguage : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLng,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
