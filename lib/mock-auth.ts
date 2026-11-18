export const MOCK_LOGIN = {
  email: "demo@qiko.ai",
  password: "Admin@123",
} as const;

const STORAGE_KEY = "qk-v2-mock-auth";

export function isMockAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMockAuthenticated(value: boolean): void {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

export function validateMockLogin(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MOCK_LOGIN.email
    && password === MOCK_LOGIN.password
  );
}
