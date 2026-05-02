// src/lib/onboarding-steps.ts
import { useTranslation } from "react-i18next";
import { type Tour } from "nextstepjs";

export const useOnboardingSteps = (): Tour[] => {
    const { t } = useTranslation();

    return [
        {
            tour: "signupTour",
            steps: [
                {
                    icon: "👋",
                    title: t("onboarding_welcome_title"),
                    content: t("onboarding_welcome_content"),
                    selector: "#dashboard-header",
                    side: "bottom",
                    showControls: true,
                    showSkip: true,
                },
                {
                    icon: "📊",
                    title: t("onboarding_dashboard_title"),
                    content: t("onboarding_dashboard_content"),
                    selector: "#main-content",
                    side: "top",
                    showControls: true,
                    showSkip: true,
                    nextRoute: "/manager/warehouse",
                },
                {
                    icon: "🏭",
                    title: t("onboarding_setup_warehouse_title"),
                    content: t("onboarding_setup_warehouse_content"),
                    selector: "#profile-section",
                    side: "top",
                    showControls: true,
                    showSkip: true,
                },
                {
                    icon: "🏭",
                    title: t("onboarding_warehouse_title"),
                    content: t("onboarding_warehouse_content"),
                    selector: "#set-warehouse-location",
                    side: "right",
                    showControls: true,
                    showSkip: true,
                    prevRoute: "/manager",
                    nextRoute: "/manager/trucks",
                },
                {
                    icon: "🚛",
                    title: t("onboarding_trucks_title"),
                    content: t("onboarding_trucks_content"),
                    selector: "#trucks-table",
                    side: "top",
                    showControls: true,
                    showSkip: true,
                    prevRoute: "/manager/warehouse",
                    nextRoute: "/manager/shipments",
                },
                {
                    icon: "📦",
                    title: t("onboarding_shipments_title"),
                    content: t("onboarding_shipments_content"),
                    selector: "#shipments-table",
                    side: "top",
                    showControls: true,
                    showSkip: true,
                    prevRoute: "/manager/trucks",
                    nextRoute: "/manager/delivery-jobs/create",
                },
                {
                    icon: "🗺️",
                    title: t("onboarding_delivery_job_title"),
                    content: t("onboarding_delivery_job_content"),
                    selector: "#create-delivery-job-form",
                    side: "right",
                    showControls: true,
                    showSkip: true,
                    prevRoute: "/manager/shipments",
                    nextRoute: "/manager",
                },
                {
                    icon: "✅",
                    title: t("onboarding_done_title"),
                    content: t("onboarding_done_content"),
                    selector: "#main-content",
                    side: "top",
                    showControls: true,
                    showSkip: false,
                },
            ],
        },
    ];
};
