const BASE_URL = "http://localhost:8000/api";

function getTokens() {
  try {
    return JSON.parse(localStorage.getItem("tokens")) || null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens) {
  localStorage.setItem("tokens", JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem("tokens");
}

async function refreshAccess() {
  const tokens = getTokens();
  if (!tokens?.refresh) return null;
  const resp = await fetch(`${BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });
  if (!resp.ok) {
    clearTokens();
    return null;
  }
  const data = await resp.json();
  saveTokens({ ...tokens, access: data.access });
  return data.access;
}

export class ApiError extends Error {
  constructor(status, data) {
    super(typeof data === "string" ? data : data?.detail || "Erro na requisição");
    this.status = status;
    this.data = data;
  }
}

export async function api(path, { method = "GET", body, auth = true } = {}) {
  const doFetch = async (token) => {
    const headers = { "Content-Type": "application/json" };
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let token = getTokens()?.access;
  let resp = await doFetch(token);

  if (resp.status === 401 && auth && getTokens()?.refresh) {
    token = await refreshAccess();
    if (token) resp = await doFetch(token);
  }

  if (resp.status === 204) return null;
  const data = await resp.json().catch(() => null);
  if (!resp.ok) throw new ApiError(resp.status, data);
  return data;
}
