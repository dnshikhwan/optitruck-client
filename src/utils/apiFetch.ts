import { getAccessToken, setAccessToken, triggerLogout } from "./tokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;

let refreshQueue: ((token: string) => void)[] = [];

function processQueue(newToken: string) {
    refreshQueue.forEach((callback) => callback(newToken));

    refreshQueue = [];
}

async function tryRefresh(): Promise<boolean> {
    if (isRefreshing) {
        return new Promise((resolve) => {
            refreshQueue.push((newToken: string) => {
                resolve(!!newToken);
            });
        });
    }

    isRefreshing = true;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (res.ok) {
            const data = await res.json();
            setAccessToken(data.data.access_token);
            processQueue(data.data.access_token);
            return true;
        }

        processQueue("");
        return false;
    } catch {
        processQueue("");
        return false;
    } finally {
        isRefreshing = false;
    }
}

const apiFetch = async (
    url: string,
    options?: RequestInit,
): Promise<Response> => {
    const token = getAccessToken();

    const res = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: "include",
        headers: {
            ...options?.headers,
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
    });

    if (res.status === 401) {
        const refreshed = await tryRefresh();

        if (refreshed) {
            return apiFetch(url, options);
        }

        triggerLogout();
        throw new Error("Unauthorized");
    }

    return res;
};

export default apiFetch;
