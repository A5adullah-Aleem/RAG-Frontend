const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(!isFormData && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const detail = errorData.detail;

  const message =
    typeof detail === "string"
      ? detail
      : detail
        ? JSON.stringify(detail)
        : `Request failed with status ${response.status}`;

  if (
    response.status === 401 &&
    typeof window !== "undefined"
  ) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("selected_organization_id");

    window.location.replace("/login");

    throw new Error("Session expired. Please log in again.");
  }

  throw new Error(message);
}

if (response.status === 204) {
  return null;
}

return response.json();

}