// api.js - Secure API with HttpOnly Cookies
const PORTS_TO_TRY = [5500, 5501, 5502, 5503, 3000, 5000];
let API_URL = 'http://localhost:5500';

async function detectApiPort() {
    for (const port of PORTS_TO_TRY) {
        try {
            const response = await fetch(http://localhost:/api/health, {
                method: 'GET',
                signal: AbortSignal.timeout(1000),
                credentials: 'include'
            });
            if (response.ok) {
                API_URL = http://localhost:;
                console.log(✅ API detected on port );
                return port;
            }
        } catch (e) {}
    }
    return '5500';
}

let detectionPromise = null;

export async function getApiUrl() {
    if (!detectionPromise) {
        detectionPromise = detectApiPort();
    }
    await detectionPromise;
    return API_URL;
}

export async function getCurrentUser() {
    try {
        const url = await getApiUrl();
        const response = await fetch(${url}/api/auth/me, {
            credentials: 'include'
        });
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch {
        return null;
    }
}

export async function apiCall(endpoint, options = {}) {
    const url = await getApiUrl();
    const response = await fetch(${url}, {
        ...options,
        credentials: 'include',
        headers: {
            ...options.headers,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        window.location.href = 'login.html';
        throw new Error('Session expired');
    }

    if (!response.ok) {
        let errorMsg;
        try {
            const error = await response.json();
            errorMsg = error.error || error.message || 'API request failed';
        } catch {
            errorMsg = HTTP ;
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export async function login(username, password) {
    const url = await getApiUrl();
    const response = await fetch(${url}/api/auth/login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }

    return response.json();
}

export async function logout() {
    const url = await getApiUrl();
    await fetch(${url}/api/auth/logout, {
        method: 'POST',
        credentials: 'include'
    });
    window.location.href = 'login.html';
}

export const api = {
    get: (endpoint) => apiCall(endpoint),
    post: (endpoint, data) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' })
};
