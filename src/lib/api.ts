import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
});

// Attach the JWT to every request once the person is logged in.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 anywhere means the token is missing/expired — log out and let the
// route guard redirect to /login, rather than leaving the UI half-broken.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

/** Extracts a readable message from the backend's { error, message? } shape. */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; message?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return humanizeErrorCode(data.error);
    if (err.code === "ERR_NETWORK") return "Can't reach the server. Check your connection.";
  }
  return fallback;
}

function humanizeErrorCode(code: string): string {
  const map: Record<string, string> = {
    INVALID_CREDENTIALS: "That email or password isn't right.",
    ACCOUNT_PENDING_APPROVAL: "Your account is still awaiting admin approval.",
    ACCOUNT_REJECTED: "This account was not approved. Contact the school office.",
    EMAIL_ALREADY_REGISTERED: "An account with that email already exists.",
    NOT_YOUR_CHILD: "You don't have access to this student.",
    DEBT_RESTRICTION: "This report card is locked until fees are fully paid.",
    TERM_FEE_NOT_SET: "Fees haven't been set for the current term yet.",
    AMOUNT_BELOW_MINIMUM: "That amount is below the minimum payment.",
    AMOUNT_EXCEEDS_BALANCE: "That amount is more than what's owed.",
    INVOICE_ALREADY_FULLY_PAID: "This invoice is already fully paid.",
    NO_INVOICE_FOR_CURRENT_TERM: "No invoice found for the current term yet.",
  };
  return map[code] || code.replace(/_/g, " ").toLowerCase();
}
