import ColorBends from "@/components/ColorBends";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import apiFetch from "@/utils/apiFetch";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/auth/driver/invite/$token")({
    component: RouteComponent,
});

interface Invitation {
    id: string;
    company: {
        id: string;
        name: string;
    };
}

const driverSignUpFormSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
            /[^a-zA-Z0-9]/,
            "Password must contain at least one special character",
        ),
});

interface DriverSignUpForm {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    company_id: string;
    role: "driver";
}

async function signUp(signUpForm: DriverSignUpForm) {
    const res = await apiFetch("/auth/signup/driver", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpForm),
    });
    if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message);
    }
    return res.json();
}

function RouteComponent() {
    const { token } = Route.useParams();
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async (token: string) => {
            try {
                const response = await apiFetch(
                    `/auth/validate/invite?token=${token}`,
                );
                if (!response.ok) {
                    throw new Error("Invalid or expired URL");
                }
                const result = await response.json();
                setInvitation(result.data);
            } catch (err: any) {
                setError(err.message);
            }
        };

        verifyToken(token);
    }, []);

    const { mutate } = useMutation({
        mutationFn: (data: DriverSignUpForm) => signUp(data),
        onSuccess: () => {
            toast.success("Driver successfully signed up");
            navigate({ to: "/auth/login", search: { redirect: "/" } });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const form = useForm({
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
        },
        validators: {
            onSubmit: driverSignUpFormSchema,
        },
        onSubmit: async ({ value }) => {
            setIsLoading(true);
            try {
                if (!invitation) {
                    throw new Error("Invalid or expired URL");
                } else {
                    const data: DriverSignUpForm = {
                        first_name: value.first_name,
                        last_name: value.last_name,
                        email: value.email,
                        password: value.password,
                        company_id: invitation.company.id,
                        role: "driver",
                    };
                    mutate(data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen w-full max-sm:pb-4 dark:bg-black relative">
            <div className="absolute inset-0 z-0">
                <ColorBends
                    colors={["#e2a06a"]}
                    rotation={0}
                    speed={0.2}
                    scale={1}
                    frequency={1}
                    warpStrength={1}
                    mouseInfluence={1}
                    parallax={0.5}
                    noise={0.1}
                    transparent
                    autoRotate={0}
                />
            </div>
            <div className="space-y-4 flex flex-col min-h-screen z-50 relative">
                {/* 1st div */}
                <div className="w-full p-4 h-16 flex items-center container mx-auto">
                    <div>
                        {/* for logo and title */}
                        <Link to={"/"}>OptiTruck</Link>
                    </div>
                    <div className="ml-auto flex items-center space-x-3">
                        {/* for button */}
                        <ModeToggle />
                    </div>
                </div>
                {/* 2nd div */}
                <div className="flex-1 flex flex-col space-y-5 items-center justify-center">
                    {error ? (
                        <Card className="w-full max-w-md items-center">
                            <p>{error} !</p>
                        </Card>
                    ) : (
                        <>
                            <div className="flex flex-col items-center">
                                <h1 className="text-center text-3xl font-semibold tracking-tight text-balance">
                                    Congratulation Driver 🎉
                                </h1>
                                {invitation && (
                                    <p className="text-center text-base tracking-tight text-balance flex items-center">
                                        You have been invited by company{" "}
                                        {invitation.company.name}
                                    </p>
                                )}
                                <p className="text-center text-base tracking-tight text-balance flex items-center">
                                    Enter your details below to proceed.{" "}
                                </p>
                            </div>
                            <Card className=" w-full max-w-md p-4">
                                {/* login form */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        form.handleSubmit();
                                    }}
                                >
                                    <FieldGroup>
                                        <div className="flex gap-4">
                                            <form.Field
                                                name="first_name"
                                                children={(field) => {
                                                    const isInvalid =
                                                        field.state.meta
                                                            .isTouched &&
                                                        !field.state.meta
                                                            .isValid;
                                                    return (
                                                        <Field
                                                            data-invalid={
                                                                isInvalid
                                                            }
                                                        >
                                                            <FieldLabel
                                                                htmlFor={
                                                                    field.name
                                                                }
                                                            >
                                                                First Name
                                                            </FieldLabel>
                                                            <Input
                                                                id={field.name}
                                                                name={
                                                                    field.name
                                                                }
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
                                                                autoComplete="off"
                                                                type="text"
                                                                placeholder="John"
                                                                onBlur={
                                                                    field.handleBlur
                                                                }
                                                                aria-invalid={
                                                                    isInvalid
                                                                }
                                                            />
                                                            {isInvalid && (
                                                                <FieldError
                                                                    className="text-red-400"
                                                                    errors={
                                                                        field
                                                                            .state
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
                                                        !field.state.meta
                                                            .isValid;
                                                    return (
                                                        <Field
                                                            data-invalid={
                                                                isInvalid
                                                            }
                                                        >
                                                            <FieldLabel
                                                                htmlFor={
                                                                    field.name
                                                                }
                                                            >
                                                                Last Name
                                                            </FieldLabel>
                                                            <Input
                                                                id={field.name}
                                                                name={
                                                                    field.name
                                                                }
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
                                                                autoComplete="off"
                                                                type="text"
                                                                placeholder="Doe"
                                                                onBlur={
                                                                    field.handleBlur
                                                                }
                                                                aria-invalid={
                                                                    isInvalid
                                                                }
                                                            />
                                                            {isInvalid && (
                                                                <FieldError
                                                                    className="text-red-400"
                                                                    errors={
                                                                        field
                                                                            .state
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
                                        <form.Field
                                            name="email"
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
                                                        >
                                                            Email
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
                                                            autoComplete="off"
                                                            type="email"
                                                            placeholder="me@example.com"
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-red-400"
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
                                            name="password"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel htmlFor="password">
                                                            Password
                                                        </FieldLabel>
                                                        <div className="relative">
                                                            <Input
                                                                id={field.name}
                                                                name={
                                                                    field.name
                                                                }
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
                                                                aria-invalid={
                                                                    isInvalid
                                                                }
                                                                type={
                                                                    showPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                placeholder="********"
                                                                autoComplete="off"
                                                            />
                                                            <Button
                                                                className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                                                onClick={() =>
                                                                    setShowPassword(
                                                                        !showPassword,
                                                                    )
                                                                }
                                                                size="icon"
                                                                type="button"
                                                                variant="ghost"
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
                                                                className="text-red-400"
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
                                        <Button type="submit">
                                            {isLoading ? (
                                                <>
                                                    <Spinner /> Signing up...
                                                </>
                                            ) : (
                                                "Sign Up"
                                            )}
                                        </Button>
                                    </FieldGroup>
                                </form>
                            </Card>
                        </>
                    )}
                    <div className="text-xs flex items-center h-4 space-x-2">
                        <p>OptiTruck 2026</p>
                        <Separator
                            orientation="vertical"
                            className="bg-black dark:bg-white"
                        />
                        <p>Privacy Policy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
