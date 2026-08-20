const AUTH_BASE_URL = '/api/auth';

async function parseErrorMessage(response) {
    const text = await response.text();
    return text || `Request failed with status ${response.status}`;
}

export async function login({ email, password }) {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }

    return response.json();
}

export async function register({ fullName, email, password }) {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }

    return response.json();
}

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userEmail');
}
