import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import apiFetch from "@/utils/apiFetch";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

export const Route = createFileRoute("/auth/signup")({
    component: RouteComponent,
});

const signUpFormSchema = z
    .object({
        first_name: z.string().min(1, "First name is required"),
        last_name: z.string().min(1, "Last name is required"),
        email: z.string().min(1, "Email is required"),
        company: z.string().min(1, "Company is required"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(
                /[^a-zA-Z0-9]/,
                "Password must contain at least one special character",
            ),
        confirmPassword: z.string().min(1, "Please confirm your password"),
        acceptTerms: z
            .boolean()
            .refine((val) => val === true, "You must accept the terms"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

interface SignUpForm {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    company: string;
}

async function signUp(signUpForm: SignUpForm) {
    const res = await apiFetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpForm),
    });
    if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message);
    }
    return res.json();
}

const HERO_SLIDES = [
    {
        image: "/images/login-hero-3.jpg",
        title: "Bring your fleet online.",
        body: "Set up your company in minutes — invite drivers, sync vehicles, start optimizing.",
    },
    {
        image: "/images/login-hero-1.jpg",
        title: "Built for the long haul.",
        body: "From single trucks to thousand‑rig fleets — OptiTruck scales with you.",
    },
    {
        image: "/images/login-hero-2.jpg",
        title: "Smarter from day one.",
        body: "Live tracking, AI routing and load matching — out of the box.",
    },
];

// Quick visual password-strength heuristic
function scorePassword(p: string) {
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return Math.min(s, 4);
}

function RouteComponent() {
    const navigate = useNavigate();
    const { auth } = Route.useRouteContext();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [slideIdx, setSlideIdx] = useState(0);

    useEffect(() => {
        const id = setInterval(
            () => setSlideIdx((i) => (i + 1) % HERO_SLIDES.length),
            5500,
        );
        return () => clearInterval(id);
    }, []);

    const { mutate } = useMutation({
        mutationFn: (data: SignUpForm) => signUp(data),
        onSuccess: async () => {
            setIsSuccess(true);
            toast.success("User successfully signed up");
            await new Promise((r) => setTimeout(r, 650));
            navigate({ to: "/auth/login", search: { redirect: "/" } });
            sessionStorage.setItem("showOnboarding", "true");
        },
        onError: (error) => {
            toast.error(error.message);
            setIsSuccess(false);
        },
        onSettled: () => setIsLoading(false),
    });

    const form = useForm({
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            company: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
        validators: { onSubmit: signUpFormSchema },
        onSubmit: async ({ value }) => {
            setIsLoading(true);
            const data: SignUpForm = {
                first_name: value.first_name,
                last_name: value.last_name,
                email: value.email,
                password: value.password,
                company: value.company,
            };
            mutate(data);
        },
    });

    const slide = HERO_SLIDES[slideIdx];

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-card">
                {/* ─── LEFT: hero image panel ─── */}
                <aside className="relative hidden md:flex flex-col justify-between p-8 lg:p-10 text-white overflow-hidden bg-neutral-900">
                    {HERO_SLIDES.map((s, i) => (
                        <div
                            key={s.image + i}
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
                    <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 100%)",
                        }}
                    />

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
                    <header className="flex items-center justify-between px-6 md:px-10 pt-6">
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
                            <ModeToggle />
                            {auth.isAuthenticated ? (
                                <Button
                                    onClick={() => navigate({ to: "/manager" })}
                                    className="rounded-full px-5 h-9 text-sm"
                                >
                                    Dashboard
                                </Button>
                            ) : (
                                <Button
                                    onClick={() =>
                                        navigate({
                                            to: "/auth/login",
                                            search: { redirect: "/" },
                                        })
                                    }
                                    className="rounded-full px-5 h-9 text-sm"
                                >
                                    Log In
                                </Button>
                            )}
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col justify-center px-6 md:px-10 py-10">
                        <div className="w-full max-w-md mx-auto">
                            <div className="mb-7">
                                <h1 className="text-3xl lg:text-[34px] font-semibold tracking-tight text-primary dark:text-primary-foreground leading-[1.1]">
                                    Register your company
                                </h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    A few details and you&apos;re ready to roll.
                                </p>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.handleSubmit();
                                }}
                            >
                                <FieldGroup>
                                    {/* Name row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <form.Field
                                            name="first_name"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                            className="text-xs font-medium text-muted-foreground"
                                                        >
                                                            First Name
                                                        </FieldLabel>
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            autoComplete="given-name"
                                                            type="text"
                                                            placeholder="John"
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            className="h-11 rounded-md transition-all focus-visible:ring-[3px] focus-visible:ring-primary/15"
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-destructive text-xs"
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        />
                                        <form.Field
                                            name="last_name"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                            className="text-xs font-medium text-muted-foreground"
                                                        >
                                                            Last Name
                                                        </FieldLabel>
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            autoComplete="family-name"
                                                            type="text"
                                                            placeholder="Doe"
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            className="h-11 rounded-md transition-all focus-visible:ring-[3px] focus-visible:ring-primary/15"
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-destructive text-xs"
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>

                                    {/* Email */}
                                    <form.Field
                                        name="email"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                        className="text-xs font-medium text-muted-foreground"
                                                    >
                                                        Your Email
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={
                                                            field.state.value
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
                                                        autoComplete="email"
                                                        type="email"
                                                        placeholder="me@example.com"
                                                        aria-invalid={isInvalid}
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

                                    {/* Company */}
                                    <form.Field
                                        name="company"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor="company"
                                                        className="text-xs font-medium text-muted-foreground"
                                                    >
                                                        Company
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={
                                                            field.state.value
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={
                                                            field.handleBlur
                                                        }
                                                        type="text"
                                                        autoComplete="organization"
                                                        placeholder="Acme Logistics"
                                                        aria-invalid={isInvalid}
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

                                    {/* Password */}
                                    <form.Field
                                        name="password"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            const score = scorePassword(
                                                field.state.value,
                                            );
                                            const labels = [
                                                "Too short",
                                                "Weak",
                                                "Okay",
                                                "Strong",
                                                "Excellent",
                                            ];
                                            const colors = [
                                                "bg-destructive",
                                                "bg-destructive/70",
                                                "bg-amber-500",
                                                "bg-emerald-500",
                                                "bg-emerald-600",
                                            ];
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor="password"
                                                        className="text-xs font-medium text-muted-foreground"
                                                    >
                                                        Password
                                                    </FieldLabel>
                                                    <div className="relative">
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            placeholder="••••••••"
                                                            autoComplete="new-password"
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
                                                    {/* Strength meter */}
                                                    {field.state.value.length >
                                                        0 && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex-1 flex gap-1">
                                                                {[
                                                                    0, 1, 2, 3,
                                                                ].map((i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`h-1 flex-1 rounded-full transition-colors ${
                                                                            i <
                                                                            score
                                                                                ? colors[
                                                                                      score
                                                                                  ]
                                                                                : "bg-border"
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                                {labels[score]}
                                                            </span>
                                                        </div>
                                                    )}
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

                                    {/* Confirm password */}
                                    <form.Field
                                        name="confirmPassword"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor="confirm_password"
                                                        className="text-xs font-medium text-muted-foreground"
                                                    >
                                                        Confirm Password
                                                    </FieldLabel>
                                                    <div className="relative">
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            type={
                                                                showConfirm
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            placeholder="••••••••"
                                                            autoComplete="new-password"
                                                            className="h-11 rounded-md pr-11 transition-all focus-visible:ring-[3px] focus-visible:ring-primary/15"
                                                        />
                                                        <Button
                                                            className="absolute top-1/2 -translate-y-1/2 right-1 h-9 w-9 hover:bg-muted/60"
                                                            onClick={() =>
                                                                setShowConfirm(
                                                                    !showConfirm,
                                                                )
                                                            }
                                                            size="icon"
                                                            type="button"
                                                            variant="ghost"
                                                            aria-label={
                                                                showConfirm
                                                                    ? "Hide password"
                                                                    : "Show password"
                                                            }
                                                        >
                                                            {showConfirm ? (
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

                                    {/* Accept terms */}
                                    <form.Field
                                        name="acceptTerms"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            return (
                                                <FieldGroup data-slot="checkbox-group">
                                                    <Field
                                                        data-invalid={isInvalid}
                                                        orientation={
                                                            "horizontal"
                                                        }
                                                    >
                                                        <Checkbox
                                                            id={field.name}
                                                            name={field.name}
                                                            checked={
                                                                field.state
                                                                    .value
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                field.handleChange(
                                                                    checked ===
                                                                        true,
                                                                )
                                                            }
                                                        />
                                                        <FieldContent>
                                                            <FieldLabel
                                                                className="text-xs text-foreground/80"
                                                                htmlFor="acceptTerms"
                                                            >
                                                                I agree to the{" "}
                                                                <Link
                                                                    to={"."}
                                                                    className="text-primary hover:underline underline-offset-4"
                                                                >
                                                                    Terms
                                                                </Link>{" "}
                                                                &{" "}
                                                                <Link
                                                                    to={"."}
                                                                    className="text-primary hover:underline underline-offset-4"
                                                                >
                                                                    Privacy
                                                                    Policy
                                                                </Link>
                                                            </FieldLabel>
                                                        </FieldContent>
                                                    </Field>
                                                    {isInvalid && (
                                                        <FieldError
                                                            className="text-destructive text-xs"
                                                            errors={
                                                                field.state.meta
                                                                    .errors
                                                            }
                                                        />
                                                    )}
                                                </FieldGroup>
                                            );
                                        }}
                                    />

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
                                                <span>Account created</span>
                                            </span>
                                        ) : isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Spinner />
                                                <span>Signing up…</span>
                                            </span>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </FieldGroup>
                            </form>

                            <p className="mt-7 text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    to={"/auth/login"}
                                    search={{ redirect: "/" }}
                                    className="text-primary font-medium hover:underline underline-offset-4"
                                >
                                    Log In
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
