function normalizeApi(url) {
  return String(url || "").replace(/\/+$/, "");
}

const LOCAL_API = normalizeApi(
  import.meta.env.VITE_API_URL_LOCAL || "http://127.0.0.1:8000/api/v1"
);
const PRODUCTION_API = normalizeApi(import.meta.env.VITE_API_URL_PRODUCTION);

/** `npm run dev` → localhost. Production builds → Railway URL. */
export const API_URL = import.meta.env.DEV ? LOCAL_API : PRODUCTION_API || LOCAL_API;

const TOKEN_KEY = "pulsif_access";
const CART_KEY = "pulsif_cart";

function adoptKey(oldKey, newKey) {
  try {
    if (localStorage.getItem(newKey) != null) return;
    const previous = localStorage.getItem(oldKey);
    if (previous == null) return;
    localStorage.setItem(newKey, previous);
    localStorage.removeItem(oldKey);
  } catch {
    /* private mode */
  }
}

adoptKey("kinetica_access", TOKEN_KEY);
adoptKey("kinetica_cart", CART_KEY);

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getCartId() {
  return localStorage.getItem(CART_KEY);
}

export function setCartId(id) {
  if (id) localStorage.setItem(CART_KEY, id);
  else localStorage.removeItem(CART_KEY);
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const cartId = getCartId();
  if (cartId) headers["X-Cart-Id"] = cartId;
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  const headerCart = response.headers.get("X-Cart-Id");
  if (headerCart) setCartId(headerCart);
  else if (data?.id && String(path).startsWith("/cart")) setCartId(data.id);
  if (!response.ok) {
    const message = data.detail || data.error || JSON.stringify(data) || response.statusText;
    const error = new Error(typeof message === "string" ? message : "Request failed");
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function queryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getHealth() {
  return api("/health/");
}

export async function getHome() {
  return api("/cms/home/");
}

export async function getProducts(params = {}) {
  if (typeof params === "string") {
    return api(`/catalog/products/${queryString({ gender: params })}`);
  }
  return api(`/catalog/products/${queryString(params)}`);
}

export async function getProduct(slug) {
  return api(`/catalog/products/${slug}/`);
}

export async function getCart() {
  return api("/cart/");
}

export async function addCartLine(variantId, qty = 1) {
  return api("/cart/lines/", {
    method: "POST",
    body: JSON.stringify({ variant_id: variantId, qty }),
  });
}

export async function patchCartLine(id, qty) {
  return api(`/cart/lines/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ qty }),
  });
}

export async function deleteCartLine(id) {
  return api(`/cart/lines/${id}/`, { method: "DELETE" });
}

export async function getFaqs() {
  return api("/cms/pages/faqs/");
}

export async function getContact() {
  return api("/cms/pages/contact/");
}

export async function postContact(payload) {
  return api("/contact/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function postNewsletter(email) {
  return api("/newsletter/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function loginStaff(username, password) {
  const data = await api("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.access);
  return data;
}

export async function registerShopper({ email, password, name }) {
  const data = await api("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  setToken(data.access);
  return data;
}

export async function loginShopper(email, password) {
  const data = await api("/auth/shopper/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access);
  return data;
}

export async function getAccount() {
  return api("/auth/account/");
}

export async function getAccountOrders() {
  return api("/auth/account/orders/");
}

export async function createCheckout(payload) {
  return api("/checkout/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function confirmCheckout(orderId, payload = {}) {
  return api(`/checkout/${orderId}/confirm/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrder(number, email) {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return api(`/orders/${number}/${query}`);
}

export async function getStudioBundle() {
  return api("/studio/home/");
}

export async function patchHero(id, formData) {
  return api(`/studio/heroes/${id}/`, { method: "PATCH", body: formData });
}

export async function patchBanner(key, formData) {
  return api(`/studio/banners/${key}/`, { method: "PATCH", body: formData });
}

export async function getStudioDashboard() {
  return api("/studio/dashboard/");
}

export async function getStudioOptions() {
  return api("/studio/options/");
}

export async function getStudioProducts(params = {}) {
  return api(`/studio/products/${queryString(params)}`);
}

export async function getStudioProduct(id) {
  return api(`/studio/products/${id}/`);
}

export async function createStudioProduct(payload) {
  return api("/studio/products/", { method: "POST", body: JSON.stringify(payload) });
}

export async function patchStudioProduct(id, payload) {
  return api(`/studio/products/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteStudioProduct(id) {
  return api(`/studio/products/${id}/`, { method: "DELETE" });
}

export async function buildStudioMatrix(id, payload) {
  return api(`/studio/products/${id}/matrix/`, { method: "POST", body: JSON.stringify(payload) });
}

export async function patchStudioVariant(id, payload) {
  return api(`/studio/variants/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteStudioVariant(id) {
  return api(`/studio/variants/${id}/`, { method: "DELETE" });
}

export async function uploadStudioImage(productId, formData) {
  return api(`/studio/products/${productId}/images/`, { method: "POST", body: formData });
}

export async function deleteStudioImage(id) {
  return api(`/studio/images/${id}/`, { method: "DELETE" });
}

export async function getStudioOrders(params = {}) {
  return api(`/studio/orders/${queryString(params)}`);
}

export async function getStudioOrder(number) {
  return api(`/studio/orders/${number}/`);
}

export async function patchStudioOrderStatus(number, payload) {
  return api(`/studio/orders/${number}/status/`, { method: "POST", body: JSON.stringify(payload) });
}

export async function resendStudioOrderEmail(number) {
  return api(`/studio/orders/${number}/email/`, { method: "POST", body: JSON.stringify({}) });
}

export async function patchStudioTracking(number, tracking_number) {
  return api(`/studio/orders/${number}/tracking/`, {
    method: "PATCH",
    body: JSON.stringify({ tracking_number }),
  });
}

export async function createCarouselItem(payload) {
  const body = payload instanceof FormData ? payload : JSON.stringify(payload);
  return api("/studio/carousel-items/", { method: "POST", body });
}

export async function patchCarouselItem(id, payload) {
  const body = payload instanceof FormData ? payload : JSON.stringify(payload);
  return api(`/studio/carousel-items/${id}/`, { method: "PATCH", body });
}

export async function deleteCarouselItem(id) {
  return api(`/studio/carousel-items/${id}/`, { method: "DELETE" });
}

export async function getStudioSettings() {
  return api("/studio/settings/");
}

export async function patchStudioSettings(payload) {
  return api("/studio/settings/", { method: "PATCH", body: JSON.stringify(payload) });
}

export async function createStudioFaq(payload) {
  return api("/studio/faqs/", { method: "POST", body: JSON.stringify(payload) });
}

export async function patchStudioFaq(id, payload) {
  return api(`/studio/faqs/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteStudioFaq(id) {
  return api(`/studio/faqs/${id}/`, { method: "DELETE" });
}
