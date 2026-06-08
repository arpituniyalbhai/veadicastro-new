import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useRef } from "react";

interface User {
  uid: string;
  email: string;
  displayName?: string;
  planName?: string;
  isPremium?: boolean;
  questionsUsed?: number;
  reportsUsed?: number;
  createdAt: any;
  lastLoginAt?: any;
  planExpiresAt?: any;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  skipNextAuthEvent: React.MutableRefObject<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Page load pe INSTANTLY check karo — Firebase se pehle
const getInitialUser = (): User | null => {
  try {
    const flag = sessionStorage.getItem("isLoggedIn");
    if (flag !== "true") return null;
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const AuthProvider = ({
  children,
  initialAuthOpen = false,
}: {
  children: ReactNode;
  initialAuthOpen?: boolean;
}) => {
  const initialUser = getInitialUser();
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser); 
  const [authOpen, setAuthOpen] = useState(initialAuthOpen);
  const skipNextAuthEvent = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const initAuth = async () => {
      const [{ onAuthStateChanged }, { getAuthInstance }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase"),
      ]);
      if (cancelled) return;

      const auth = await getAuthInstance();
      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (skipNextAuthEvent.current) {
        skipNextAuthEvent.current = false;
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
          createdAt: firebaseUser.metadata.creationTime,
          lastLoginAt: firebaseUser.metadata.lastSignInTime,
        };
        sessionStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        sessionStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        setUser(null);
      }
      setLoading(false);
      });
    };

    void initAuth();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const logout = async () => {
    try {
      const { getAuthInstance } = await import("@/lib/firebase");
      const auth = await getAuthInstance();
      await auth.signOut();
      sessionStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("questionsUsed");
      localStorage.removeItem("reportsUsed");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const setUserWithPersistence = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      sessionStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
    }
  };

  const value = useMemo(() => ({ 
    user, 
    loading, 
    authOpen, 
    setAuthOpen, 
    logout,
    setUser: setUserWithPersistence,
    skipNextAuthEvent
  }), [user, loading, authOpen]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
