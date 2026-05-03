import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
    useRouter,
} from "@tanstack/react-router";
import { Check, Eye, EyeOff, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

export const Route = createFileRoute("/auth/login")({
    validateSearch: (search) => ({
        redirect: (search.redirect as string) || "/",
    }),
    beforeLoad: ({ context, search }) => {
        if (context.auth.isAuthenticated) {
            throw redirect({ to: search.redirect });
        }
    },
    component: LoginComponent,
});

const loginFormSchema = z.object({
    email: z.string().min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
});

function LoginComponent() {
    const [showPassword, setShowPassword] = useState(false);
    const { auth } = Route.useRouteContext();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [slideIdx, setSlideIdx] = useState(0);

    const HERO_SLIDES = useMemo(
        () => [
            {
                image: "/images/login-hero-1.jpg",
                title: t("hero_1_title"),
                body: t("hero_1_body"),
            },
            {
                image: "/images/login-hero-2.jpg",
                title: t("hero_2_title"),
                body: t("hero_2_body"),
            },
            {
                image: "/images/login-hero-3.jpg",
                title: t("hero_3_title"),
                body: t("hero_3_body"),
            },
        ],
        [t],
    );

    // auto-rotate hero slides
    useEffect(() => {
        const id = setInterval(
            () => setSlideIdx((i) => (i + 1) % HERO_SLIDES.length),
            5500,
        );
        return () => clearInterval(id);
    }, [HERO_SLIDES]);

    const form = useForm({
        defaultValues: { email: "", password: "" },
        validators: { onSubmit: loginFormSchema },
        onSubmit: async ({ value }) => {
            setIsLoading(true);
            try {
                const user = await auth.login(value);
                queryClient.clear();
                setIsSuccess(true);
                if (user.role === "manager") {
                    navigate({ to: "/manager" });
                } else {
                    navigate({ to: "/driver/active-assignments" });
                }
            } catch (err) {
                toast.error("Invalid email or password");
                setIsSuccess(false);
            } finally {
                setIsLoading(false);
            }
        },
    });

    const slide = HERO_SLIDES[slideIdx];

    return (
        <div className="min-h-screen w-full bg-background">
            <div
                className="
                    w-full min-h-screen
                    grid grid-cols-1 md:grid-cols-2
                    overflow-hidden
                    bg-card
                "
            >
                {/* ─── LEFT: hero image panel ─── */}
                <aside className="relative hidden md:flex flex-col justify-between p-8 lg:p-10 text-white overflow-hidden bg-neutral-900">
                    {/* image stack with cross-fade */}
                    {HERO_SLIDES.map((s, i) => (
                        <div
                            key={s.image}
                            aria-hidden
                            className="absolute inset-0 transition-opacity duration-1000 ease-out"
                            style={{
                                backgroundImage: `url(${s.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                opacity: i === slideIdx ? 1 : 0,
                            }}
                        />
                    ))}
                    {/* darkening gradient so text always reads */}
                    <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 100%)",
                        }}
                    />

                    {/* logo */}
                    <Link
                        to={"/"}
                        className="relative z-10 inline-flex items-center gap-2.5 self-start group"
                    >
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-neutral-900 transition-transform group-hover:-rotate-6">
                            <Truck className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                        <span className="font-semibold tracking-tight text-[15px]">
                            OptiTruck
                        </span>
                    </Link>

                    {/* hero copy + dots */}
                    <div className="relative z-10 max-w-md">
                        <h2
                            key={slide.title}
                            className="text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.05] text-balance animate-in fade-in slide-in-from-bottom-2 duration-700"
                        >
                            {slide.title}
                        </h2>
                        <p
                            key={slide.body}
                            className="mt-3 text-sm lg:text-[15px] text-white/80 leading-relaxed text-balance animate-in fade-in duration-700"
                        >
                            {slide.body}
                        </p>
                        <div className="mt-7 flex items-center gap-2">
                            {HERO_SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSlideIdx(i)}
                                    aria-label={`Slide ${i + 1}`}
                                    className={`h-1 rounded-full transition-all duration-500 ${
                                        i === slideIdx
                                            ? "w-8 bg-white"
                                            : "w-3 bg-white/40 hover:bg-white/70"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ─── RIGHT: form panel ─── */}
                <section className="relative flex flex-col bg-card">
                    {/* top bar */}
                    <header className="flex items-center justify-between px-6 md:px-10 pt-6">
                        {/* mobile-only logo */}
                        <Link
                            to={"/"}
                            className="md:hidden inline-flex items-center gap-2"
                        >
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background">
                                <Truck className="h-4 w-4" strokeWidth={2.5} />
                            </span>
                            <span className="font-semibold tracking-tight">
                                OptiTruck
                            </span>
                        </Link>
                        <div className="ml-auto flex items-center gap-2">
                            <LanguageSwitcher />
                            <ModeToggle />
                            <Button
                                onClick={() =>
                                    router.navigate({ to: "/auth/signup" })
                                }
                                className="rounded-full px-5 h-9 text-sm"
                            >
                                Sign Up
                            </Button>
                        </div>
                    </header>

                    {/* form */}
                    <div className="flex-1 flex flex-col justify-center px-6 md:px-10 py-10">
                        <div className="w-full max-w-md mx-auto">
                            <div className="mb-7">
                                <h1 className="text-3xl lg:text-[34px] font-semibold tracking-tight dark:text-primary-foreground text-primary leading-[1.1]">
                                    {t("welcome_back_to_optittruck")}
                                </h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t("sign_in_to_your_account")}
                                </p>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    form.handleSubmit();
                                }}
                            >
                                <FieldGroup>
                                    <form.Field
                                        name="email"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor="email"
                                                        className="text-xs font-medium text-muted-foreground"
                                                    >
                                                        {t("your_email")}
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={
                                                            field.state.value
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        aria-invalid={isInvalid}
                                                        type="email"
                                                        autoComplete="email"
                                                        placeholder="me@example.com"
                                                        className="h-11 rounded-md transition-all focus-visible:ring-[3px] focus-visible:ring-primary/15"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError
                                                            className="text-destructive text-xs"
                                                            errors={
                                                                field.state.meta
                                                                    .errors
                                                            }
                                                        />
                                                    )}
                                                </Field>
                                            );
                                        }}
                                    />
                                    <form.Field
                                        name="password"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor="password"
                                                        className="text-xs font-medium text-muted-foreground"
                                                    >
                                                        {t("password")}
                                                    </FieldLabel>
                                                    <div className="relative">
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            autoComplete="current-password"
                                                            placeholder="••••••••"
                                                            className="h-11 rounded-md pr-11 transition-all focus-visible:ring-[3px] focus-visible:ring-primary/15"
                                                        />
                                                        <Button
                                                            className="absolute top-1/2 -translate-y-1/2 right-1 h-9 w-9 hover:bg-muted/60"
                                                            onClick={() =>
                                                                setShowPassword(
                                                                    !showPassword,
                                                                )
                                                            }
                                                            size="icon"
                                                            type="button"
                                                            variant="ghost"
                                                            aria-label={
                                                                showPassword
                                                                    ? "Hide password"
                                                                    : "Show password"
                                                            }
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    {isInvalid && (
                                                        <FieldError
                                                            className="text-destructive text-xs"
                                                            errors={
                                                                field.state.meta
                                                                    .errors
                                                            }
                                                        />
                                                    )}
                                                </Field>
                                            );
                                        }}
                                    />

                                    {/* Remember me  ·  Forgot password */}
                                    <div className="flex items-center justify-between -mt-1">
                                        <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer select-none group">
                                            <span
                                                className={`flex items-center justify-center h-4 w-4 border transition-colors ${
                                                    rememberMe
                                                        ? "bg-foreground border-foreground text-background"
                                                        : "bg-transparent border-border group-hover:border-foreground/50"
                                                }`}
                                            >
                                                {rememberMe && (
                                                    <Check
                                                        className="h-3 w-3"
                                                        strokeWidth={3}
                                                    />
                                                )}
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={rememberMe}
                                                onChange={(e) =>
                                                    setRememberMe(
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            {t("remember_me")}
                                        </label>
                                        <Link
                                            to={"."}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {t("forgot_password")}
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading || isSuccess}
                                        className="
                                            h-12 mt-2 rounded-md text-[15px] font-medium
                                            transition-all duration-200
                                            hover:shadow-lg active:scale-[0.99]
                                            disabled:opacity-100
                                        "
                                    >
                                        {isSuccess ? (
                                            <span className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                                                <Check
                                                    className="h-4 w-4"
                                                    strokeWidth={3}
                                                />
                                                <span>Signed in</span>
                                            </span>
                                        ) : isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Spinner />
                                                <span>Logging in…</span>
                                            </span>
                                        ) : (
                                            t("login")
                                        )}
                                    </Button>
                                </FieldGroup>
                            </form>

                            <p className="mt-7 text-center text-sm text-muted-foreground">
                                {t("dont_have_any_account")}{" "}
                                <Link
                                    to={"/auth/signup"}
                                    className="text-primary font-medium hover:underline underline-offset-4"
                                >
                                    {t("register")}
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
