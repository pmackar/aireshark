import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

// Simple session token generation
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Hash a password (for generating ADMIN_PASSWORD_HASH)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password against hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Check if the provided password is correct
export async function validateAdminPassword(password: string): Promise<boolean> {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  // If no password is configured, allow access in development
  if (!passwordHash) {
    if (process.env.NODE_ENV === "development") {
      console.warn("ADMIN_PASSWORD_HASH not set - allowing access in development");
      return true;
    }
    return false;
  }

  return verifyPassword(password, passwordHash);
}

// Create a session and set cookie
export async function createSession(): Promise<string> {
  const token = generateSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  return token;
}

// Check if user has valid session
export async function isAuthenticated(): Promise<boolean> {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  // If no password is configured, allow access in development
  if (!passwordHash && process.env.NODE_ENV === "development") {
    return true;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);

  // Simple check: if cookie exists, user is authenticated
  // In production, you'd want to verify against a session store
  return !!sessionToken?.value;
}

// Clear session
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
