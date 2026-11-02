import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  login as loginWithService,
  logout as logoutWithService,
  register as registerWithService,
  restoreSession,
  type AuthUser,
  type RegisterInput,
} from "@/src/lib/auth-service";

type AuthContextValue = {
  user: AuthUser | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void restoreSession()
      .catch(() => null)
      .then((session) => {
        if (active) setUser(session);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setUser(await loginWithService(email, password));
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    setUser(await registerWithService(input));
  }, []);

  const signOut = useCallback(async () => {
    await logoutWithService();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, hydrated, signIn, signUp, signOut }),
    [user, hydrated, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
