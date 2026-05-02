import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enJson from "./locales/en/translations.json";
import rusJson from "./locales/rus/translations.json";

i18n.use(initReactI18next).init({
    fallbackLng: "rus",
    lng: "rus",
    resources: {
        en: {
            translations: enJson,
        },
        rus: {
            translations: rusJson,
        },
    },
    ns: ["translations"],
    defaultNS: "translations",
});

i18n.languages = ["en", "rus"];

export default i18n;
