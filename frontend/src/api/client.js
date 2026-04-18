const BASE_URL = "http://127.0.0.1:8000";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
    throw new Error("Authentication required");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "API request failed");
  }

  return response.json();
}

export const api = {
  // Catalogue
  getProducts: () => apiFetch("/products"),
  createProduct: (product) =>
    apiFetch("/products", { method: "POST", body: JSON.stringify(product) }),
  updateProduct: (id, updates) =>
    apiFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  deleteProduct: (id) => apiFetch(`/products/${id}`, { method: "DELETE" }),

  // POS & History
  checkout: (cartItems) =>
    apiFetch("/checkout", { method: "POST", body: JSON.stringify(cartItems) }),
  getHistory: () => apiFetch("/history"),
};
