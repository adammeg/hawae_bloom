import { getLocalValue, removeLocalValue, setLocalValue } from "@/src/lib/local-storage";

const ACCOUNT_KEY = "hawae-patient-account-v1";
const SESSION_KEY = "hawae-patient-session-v1";

export type AuthUser = {
  email: string;
  firstName: string;
};

type StoredAccount = AuthUser & {
  password: string;
};

export type RegisterInput = AuthUser & {
  password: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseUser(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof value.email !== "string" || typeof value.firstName !== "string") return null;
    return { email: normalizeEmail(value.email), firstName: value.firstName.trim() };
  } catch {
    return null;
  }
}

export async function restoreSession(): Promise<AuthUser | null> {
  return parseUser(await getLocalValue(SESSION_KEY));
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const existingRaw = await getLocalValue(ACCOUNT_KEY);

  if (existingRaw) {
    try {
      const existing = JSON.parse(existingRaw) as StoredAccount;
      if (normalizeEmail(existing.email) === email) {
        throw new Error("Un compte existe déjà avec cette adresse e-mail.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("existe déjà")) throw error;
    }
  }

  const user = { email, firstName };
  const account: StoredAccount = { ...user, password: input.password };
  await setLocalValue(ACCOUNT_KEY, JSON.stringify(account));
  await setLocalValue(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function login(emailInput: string, password: string): Promise<AuthUser> {
  const raw = await getLocalValue(ACCOUNT_KEY);
  if (!raw) throw new Error("Aucun compte n’existe encore sur cet appareil.");

  let account: StoredAccount;
  try {
    account = JSON.parse(raw) as StoredAccount;
  } catch {
    throw new Error("Impossible de lire votre compte. Veuillez le recréer.");
  }

  if (normalizeEmail(account.email) !== normalizeEmail(emailInput) || account.password !== password) {
    throw new Error("Adresse e-mail ou mot de passe incorrect.");
  }

  const user = { email: normalizeEmail(account.email), firstName: account.firstName.trim() };
  await setLocalValue(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  await removeLocalValue(SESSION_KEY);
}
