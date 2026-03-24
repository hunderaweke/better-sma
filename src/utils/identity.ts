import api from "./api";

const IDENTITY_STORAGE_KEY = "identity_unique_string";

export type StoredIdentity = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  unique_string: string;
  expire_date: string;
};

function isStoredIdentity(value: unknown): value is StoredIdentity {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { unique_string?: unknown }).unique_string === "string" &&
    typeof (value as { expire_date?: unknown }).expire_date === "string"
  );
}

export function readStoredIdentity(): StoredIdentity | null {
  const storedValue = localStorage.getItem(IDENTITY_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(storedValue);

    if (typeof parsed === "string") {
      return {
        unique_string: parsed,
        expire_date: "",
      };
    }

    return isStoredIdentity(parsed) ? parsed : null;
  } catch {
    return {
      unique_string: storedValue,
      expire_date: "",
    };
  }
}

export function isIdentityExpired(identity: StoredIdentity | null): boolean {
  if (!identity?.expire_date) {
    return true;
  }

  const expiresAt = new Date(identity.expire_date);

  if (Number.isNaN(expiresAt.getTime())) {
    return true;
  }

  return expiresAt.getTime() <= Date.now();
}

export function clearStoredIdentity() {
  localStorage.removeItem(IDENTITY_STORAGE_KEY);
}

export function saveStoredIdentity(identity: StoredIdentity) {
  localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
}

export async function createStoredIdentity(): Promise<StoredIdentity> {
  const response = await api.post("/api/identities");
  const identity = response.data as Partial<StoredIdentity> & {
    unique_string?: unknown;
    expire_date?: unknown;
  };

  if (
    typeof identity.unique_string !== "string" ||
    typeof identity.expire_date !== "string"
  ) {
    throw new Error("Invalid identity response");
  }

  const storedIdentity: StoredIdentity = {
    id: typeof identity.id === "string" ? identity.id : undefined,
    created_at:
      typeof identity.created_at === "string" ? identity.created_at : undefined,
    updated_at:
      typeof identity.updated_at === "string" ? identity.updated_at : undefined,
    unique_string: identity.unique_string,
    expire_date: identity.expire_date,
  };

  saveStoredIdentity(storedIdentity);
  return storedIdentity;
}

export async function getOrCreateStoredIdentity(): Promise<StoredIdentity> {
  const storedIdentity = readStoredIdentity();

  if (storedIdentity && !isIdentityExpired(storedIdentity)) {
    return storedIdentity;
  }

  if (storedIdentity) {
    clearStoredIdentity();
  }

  return createStoredIdentity();
}
