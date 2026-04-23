import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const skipNextAuthEvent = useRef(false);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (skipNextAuthEvent.current) {
      skipNextAuthEvent.current = false;
      setLoading(false);
      return; // ignore this fire
    }
    
    if (firebaseUser) {
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        createdAt: firebaseUser.metadata.creationTime,
        lastLoginAt: firebaseUser.metadata.lastSignInTime,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      // Check localStorage as fallback
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  const logout = async () => {
    try {
      // Sign out from Firebase Auth
      await auth.signOut();
      // Clear user data from localStorage
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
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
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