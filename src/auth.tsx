import { createContext, useContext, useEffect, useState } from "react";
import { registerLogoutCallback, setAccessToken } from "./utils/tokenStore";
import { Spinner } from "./components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { CustomSpinner } from "./components/custom-spinner";

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    company: {
        name: string;
    };
}

export interface LoginForm {
    email: string;
    password: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    login: ({ email, password }: LoginForm) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    const hasRole = (role: string) => {
        return user?.role === role;
    };

    const hasAnyRole = (roles: string[]) => {
        return user ? roles.includes(user.role) : false;
    };

    const handleLogout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken(null);

        fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => {});

        queryClient.clear();
        window.location.href = "/auth/login";
    };

    // Restore auth state on app load
    useEffect(() => {
        registerLogoutCallback(handleLogout);
        silentRefresh();
    }, []);

    const silentRefresh = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setAccessToken(data.data.access_token);
                setUser(data.data.user);
                setIsAuthenticated(true);
                localStorage.setItem(
                    "company_name",
                    data.data.user.company.name,
                );
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CustomSpinner />
            </div>
        );
    }

    const login = async (loginForm: LoginForm) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(loginForm),
        });

        if (res.ok) {
            const userData = await res.json();
            console.log(userData);
            setAccessToken(userData.data.access_token);
            localStorage.setItem(
                "company_name",
                userData.data.user.company.name,
            );
            setUser(userData.data.user);
            setIsAuthenticated(true);
            return userData.data.user;
        } else {
            const error = await res.json();
            throw new Error(error.message);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                login,
                logout: handleLogout,
                hasRole,
                hasAnyRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
