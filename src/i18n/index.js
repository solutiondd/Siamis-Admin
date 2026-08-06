import { createI18n } from "vue-i18n";
import th from "./th.json";
import en from "./en.json";

const storageKey = "app_locale";
const savedLocale = localStorage.getItem(storageKey);
const defaultLocale = savedLocale === "en" ? "en" : "th";

export const availableLocales = ["th", "en"];

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: "th",
  messages: {
    th,
    en,
  },
});

const syncDocumentLocale = (locale) => {
  document.documentElement.lang = locale;
  document.documentElement.dir = "ltr";
  localStorage.setItem(storageKey, locale);
};

syncDocumentLocale(defaultLocale);

export const setLocale = (locale) => {
  const nextLocale = availableLocales.includes(locale) ? locale : "th";
  i18n.global.locale.value = nextLocale;
  syncDocumentLocale(nextLocale);
};