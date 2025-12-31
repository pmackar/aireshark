import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import type { User } from "@prisma/client";

const SESSION_COOKIE_NAME = "admin_session";
const USER_SESSION_COOKIE_NAME = "user_session";
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

// ============================================
// User Authentication (for paywall)
// ============================================

export type SafeUser = Omit<User, "passwordHash">;

// Create a user session and set cookie
export async function createUserSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

  await prisma.session.create({
    data: {
      token,
      expiresAt,
      userId,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  return token;
}

// Get user from session cookie
export async function getUserFromSession(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(USER_SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionCookie.value },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired or invalid - clean up
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  // Return user without passwordHash
  const { passwordHash: _, ...safeUser } = session.user;
  return safeUser;
}

// Check if user is authenticated
export async function isUserAuthenticated(): Promise<boolean> {
  const user = await getUserFromSession();
  return !!user;
}

// Clear user session
export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(USER_SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    await prisma.session.deleteMany({
      where: { token: sessionCookie.value },
    });
  }

  cookieStore.delete(USER_SESSION_COOKIE_NAME);
}

// Validate user credentials
export async function validateUserCredentials(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// Create a new user
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<SafeUser> {
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
    },
  });

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// Check if email is already registered
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return !!user;
}
