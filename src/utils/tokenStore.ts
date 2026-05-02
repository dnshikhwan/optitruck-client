let access_token: string | null = null;
let logoutCallback: (() => void) | null = null;

export function setAccessToken(token: string | null) {
    access_token = token;
}

export function getAccessToken() {
    return access_token;
}

export function registerLogoutCallback(fn: () => void) {
    logoutCallback = fn;
}

export function triggerLogout() {
    if (logoutCallback) {
        logoutCallback();
    }
}
