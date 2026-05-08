const TOKEN_KEY = "harmonia.token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(method, path, body, isForm = false) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body && !isForm) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  } else if (body && isForm) {
    payload = body;
  }
  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  put: (p, b) => request("PUT", p, b),
  del: (p) => request("DELETE", p),
  postForm: (p, formData) => request("POST", p, formData, true),
  putForm: (p, formData) => request("PUT", p, formData, true),
};
