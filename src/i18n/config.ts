import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enJson from "./locales/en/translations.json";
import rusJson from "./locales/rus/translations.json";
import enDeliveryJobDetail from "./locales/en/deliveryJobDetail.json";
import rusDeliveryJobDetail from "./locales/rus/deliveryJobDetail.json";
import enAlgoComparison from "./locales/en/algoComparison.json";
import rusAlgoComparison from "./locales/rus/algoComparison.json";

i18n.use(initReactI18next).init({
    fallbackLng: "rus",
    lng: "rus",
    resources: {
        en: {
            translations: enJson,
            deliveryJobDetail: enDeliveryJobDetail,
            algoComparison: enAlgoComparison,
        },
        rus: {
            translations: rusJson,
            deliveryJobDetail: rusDeliveryJobDetail,
            algoComparison: rusAlgoComparison,
        },
    },
    ns: ["translations", "deliveryJobDetail", "algoComparison"],
    defaultNS: "translations",
});

i18n.languages = ["en", "rus"];

export default i18n;
