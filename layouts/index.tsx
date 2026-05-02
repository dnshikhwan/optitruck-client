import * as React from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Search,
    Menu,
    Truck,
    Box,
    PlusSquare,
    User,
    Warehouse,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
import { useNextStep } from "nextstepjs";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const { t } = useTranslation();
    let router;
    let auth;
    const navigate = useNavigate();
    const { startNextStep } = useNextStep();

    React.useEffect(() => {
        if (sessionStorage.getItem("showOnboarding") === "true") {
            sessionStorage.removeItem("showOnboarding");
            console.log("Starting tour...");
            setTimeout(() => {
                console.log("Calling startNextStep");
                startNextStep("signupTour");
            }, 500);
        }
    }, []);

    try {
        router = useRouter();
        // Only try to get context if router exists
        if (router && router.options.context) {
            auth = router.options.context.auth;
        }
    } catch (error) {
        console.warn("Router not ready yet");
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // If auth is not available, show loading
    if (!auth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // If auth is not available yet, show loading
    if (!auth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const driverNavigationSections: NavSection[] = [
        {
            title: t("work"),
            items: [
                {
                    title: t("active_assignments"),
                    href: "/driver/active-assignments",
                    icon: MapPin,
                },
                // {
                //     title: t("history"),
                //     href: "/driver",
                //     icon: History,
                // },
            ],
        },
    ];

    const managerNavigationSections: NavSection[] = [
        {
            title: t("dashboard"),
            items: [
                {
                    title: t("overview"),
                    href: "/manager",
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            title: t("delivery_jobs"),
            items: [
                {
                    title: t("delivery_jobs"),
                    href: "/manager/delivery-jobs",
                    icon: Box,
                },
                {
                    title: t("create_delivery_job"),
                    href: "/manager/delivery-jobs/create",
                    icon: PlusSquare,
                },
            ],
        },
        {
            title: t("shipments"),
            items: [
                {
                    title: t("shipments"),
                    href: "/manager/shipments",
                    icon: Box,
                },
                {
                    title: t("create_shipment"),
                    href: "/manager/shipments/create",
                    icon: PlusSquare,
                },
            ],
        },
        {
            title: t("truck_management"),
            items: [
                {
                    title: t("trucks"),
                    href: "/manager/trucks",
                    icon: Truck,
                },
                {
                    title: t("drivers"),
                    href: "/manager/drivers",
                    icon: User,
                },
            ],
        },
        {
            title: t("warehouse_management"),
            items: [
                {
                    title: t("warehouse"),
                    href: "/manager/warehouse",
                    icon: Warehouse,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background not-dark:bg-zinc-100">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 not-dark:bg-sidebar-foreground",
                    sidebarOpen ? "w-64" : "w-16",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo/Brand */}
                    <div className="flex h-16 items-center gap-3 border-b border-sidebar-border not-dark:border-neutral-800 px-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                            <Truck className="h-5 w-5 text-sidebar-primary-foreground" />
                        </div>
                        {sidebarOpen && (
                            <span className="font-semibold text-sidebar-foreground not-dark:text-white">
                                {auth.user?.company?.name
                                    ? auth.user.company.name.toUpperCase()
                                    : localStorage
                                          .getItem("company_name")
                                          ?.toUpperCase() || "Dashboard"}
                                {/* Dashboard */}
                            </span>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
                        {auth.hasRole("manager")
                            ? managerNavigationSections.map(
                                  (section, sectionIdx) => (
                                      <div key={sectionIdx}>
                                          {section.title && sidebarOpen && (
                                              <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                  {section.title}
                                              </h3>
                                          )}
                                          <div className="space-y-1">
                                              {section.items.map((item) => {
                                                  const Icon = item.icon;
                                                  return (
                                                      <Link
                                                          key={item.href}
                                                          to={item.href}
                                                          className={cn(
                                                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground not-dark:text-white",
                                                              "text-sidebar-foreground",
                                                          )}
                                                      >
                                                          <Icon className="h-5 w-5 shrink-0" />
                                                          {sidebarOpen && (
                                                              <>
                                                                  <span className="flex-1">
                                                                      {
                                                                          item.title
                                                                      }
                                                                  </span>
                                                                  {item.badge && (
                                                                      <span className="rounded-full bg-sidebar-primary px-2 py-0.5 text-xs text-sidebar-primary-foreground">
                                                                          {
                                                                              item.badge
                                                                          }
                                                                      </span>
                                                                  )}
                                                              </>
                                                          )}
                                                      </Link>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  ),
                              )
                            : driverNavigationSections.map(
                                  (section, sectionIdx) => (
                                      <div key={sectionIdx}>
                                          {section.title && sidebarOpen && (
                                              <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                  {section.title}
                                              </h3>
                                          )}
                                          <div className="space-y-1">
                                              {section.items.map((item) => {
                                                  const Icon = item.icon;
                                                  return (
                                                      <Link
                                                          key={item.href}
                                                          to={item.href}
                                                          className={cn(
                                                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground not-dark:text-white",
                                                              "text-sidebar-foreground",
                                                          )}
                                                      >
                                                          <Icon className="h-5 w-5 shrink-0" />
                                                          {sidebarOpen && (
                                                              <>
                                                                  <span className="flex-1">
                                                                      {
                                                                          item.title
                                                                      }
                                                                  </span>
                                                                  {item.badge && (
                                                                      <span className="rounded-full bg-sidebar-primary px-2 py-0.5 text-xs text-sidebar-primary-foreground">
                                                                          {
                                                                              item.badge
                                                                          }
                                                                      </span>
                                                                  )}
                                                              </>
                                                          )}
                                                      </Link>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  ),
                              )}
                    </nav>

                    {/* User Profile */}
                    <div className="border-t border-sidebar-border not-dark:border-neutral-800 p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent",
                                        !sidebarOpen && "justify-center",
                                    )}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                                            JD
                                        </AvatarFallback>
                                    </Avatar>
                                    {sidebarOpen && (
                                        <div className="flex flex-1 flex-col items-start text-sm">
                                            <span className="font-medium dark:text-sidebar-foreground text-sidebar">
                                                {auth.user?.first_name}{" "}
                                                {auth.user?.last_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {auth.user?.email}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    {t("my_account")}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        auth.logout();
                                        return navigate({
                                            to: "/auth/login",
                                            search: {
                                                redirect: "/",
                                            },
                                        });
                                    }}
                                >
                                    {t("logout")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className={cn(
                    "transition-all duration-300",
                    sidebarOpen ? "ml-64" : "ml-16",
                )}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 border-b border-border  bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="flex h-16 items-center gap-4 px-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-muted-foreground"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* Search */}
                        <div className="flex flex-1 items-center gap-4">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder={t("search") + "..."}
                                    className="w-full pl-9 pr-4"
                                />
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-2">
                            {/* l10n language selection */}
                            <LanguageSwitcher />

                            <ModeToggle />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                            <AvatarFallback>JD</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <DropdownMenuLabel>
                                        {t("my_account")}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            auth.logout();
                                            return navigate({
                                                to: "/auth/login",
                                                search: {
                                                    redirect: "/",
                                                },
                                            });
                                        }}
                                    >
                                        {t("logout")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <AppBreadcrumb />
                <main className="min-h-[calc(100vh-4rem)] p-6 flex flex-col gap-9">
                    {children}
                </main>
            </div>
        </div>
    );
}
