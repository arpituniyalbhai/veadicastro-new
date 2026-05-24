import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db, primaryDb } from "@/lib/firebase";

export type PlanName =
  | "Free"
  | "Standard"
  | "Premium"
  | "Quick Ask"
  | "Deep Dive"
  | "The Power Pack"
  | "Day Pass";

export type FeatureKey = "tomorrow" | "lucky" | "lifeInstruction" | "future";

type PlanContextType = {
  planName: PlanName;
  expiresAt: Date | null;
  unlimitedExpiry: Date | null;
  credits: number;
  purchasedReports: string[];
  reportCredits: number;
  compatibilityCredits: number;
  loading: boolean;
  canAccess: (feature: FeatureKey) => boolean;
  requireFeature: (feature: FeatureKey) => boolean;
  refreshPlan: () => Promise<void>;
  applyPlanLocally: (plan: PlanName, expires?: Date | null) => void;
  allowedQuestions: number;
  usedQuestions: number;
  canAskMoreQuestions: () => Promise<boolean>;
  registerQuestionUsage: () => Promise<void>;
  resetQuestionUsage: () => void;
  hasQuickPack: boolean;
  useQuickPackQuestion: () => Promise<boolean>;
  deductCredit: () => Promise<boolean>;
  deductCompatibilityCredit: () => Promise<boolean>;
  canGenerateReport: () => boolean;
  registerReportUsage: () => Promise<void>;
  getTimeUntilExpiry: () => string;
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

const PLAN_CREDITS: Record<PlanName, number> = {
  Free: 1,
  Standard: 10,
  Premium: 15,
  "Quick Ask": 5,
  "Deep Dive": 15,
  "The Power Pack": 30,
  "Day Pass": 999,
};

const FEATURE_LABEL: Record<FeatureKey, string> = {
  tomorrow: "Tomorrow's Prediction",
  lucky: "Lucky Numbers & Colors",
  lifeInstruction: "Life Guidance",
  future: "Future Predictions",
};

// ── localStorage helpers ──────────────────────────────────────────────────────

const getStoredWithExpiry = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    if (parsed?.value && parsed?.expiry && new Date(parsed.expiry) > new Date()) {
      return parsed.value;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStoredWithExpiry = (key: string, value: any, expiryInDays = 30) => {
  if (typeof window === "undefined") return;
  try {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryInDays);
    localStorage.setItem(key, JSON.stringify({ value, expiry: expiry.toISOString() }));
  } catch {}
};

const getStoredNumber = (key: string, defaultValue: number): number => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? Number(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const PlanProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [planName, setPlanName] = useState<PlanName>("Free");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [unlimitedExpiry, setUnlimitedExpiry] = useState<Date | null>(null);
  const [credits, setCredits] = useState<number>(1);
  const creditsRef = useRef(credits);
  creditsRef.current = credits; // Keep ref updated
  
  const [reportCredits, setReportCredits] = useState<number>(0);
  const reportCreditsRef = useRef(reportCredits);
  reportCreditsRef.current = reportCredits; // Keep ref updated
  
  const [compatibilityCredits, setCompatibilityCredits] = useState<number>(0);
  const compatibilityCreditsRef = useRef(compatibilityCredits);
  compatibilityCreditsRef.current = compatibilityCredits; // Keep ref updated
  const [purchasedReports, setPurchasedReports] = useState<string[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [lockedFeature, setLockedFeature] = useState<FeatureKey | null>(null);

  // ── Firestore Real-time Listener ──────────────────────────────────────────────

  useEffect(() => {
    if (!user?.email || authLoading) return;

    const timeout = setTimeout(() => {
      console.log("Setting up Firestore listener for:", {
        email: user.email,
        uid: user.uid,
        dbProject: "vedicastro-data",
        delay: "500ms applied"
      });
      const userDocRef = doc(db, "users", user.email);
      
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        console.log("🔥 Firestore snapshot received:", {
          exists: docSnapshot.exists,
          metadata: docSnapshot.metadata,
          docId: user.email
        });
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const newCredits = data.credits ?? 1;
          const newReportCredits = data.reportCredits ?? 0;
          const newCompatibilityCredits = data.compatibilitycredits ?? 0;
          const newPlanName = data.planName ?? "Free";
          const newUnlimitedExpiry = data.unlimitedExpiry?.toDate() || null;
          
          console.log("🔥 Updating UI state from Firestore:", {
            credits: newCredits,
            reportCredits: newReportCredits,
            compatibilityCredits: newCompatibilityCredits,
            planName: newPlanName,
            unlimitedExpiry: newUnlimitedExpiry?.toISOString(),
            purchasedReports: data.purchasedReports || []
          });
          
          // Force update state with latest Firestore data
          setPlanName(newPlanName);
          setCredits(newCredits);
          setUnlimitedExpiry(newUnlimitedExpiry);
          setPurchasedReports(data.purchasedReports || []);
          setReportCredits(newReportCredits);
          setCompatibilityCredits(newCompatibilityCredits);
          setExpiresAt(data.expiresAt?.toDate() || null);
          
          // Force UI re-render
          setPlanLoading(false);
          
          console.log("🔥 UI state updated successfully - Current UI state:", {
            uiCredits: newCredits,
            uiReportCredits: newReportCredits,
            uiCompatibilityCredits: newCompatibilityCredits,
            uiPlanName: newPlanName
          });
        } else {
          console.log("No user document found - AuthModal should have created it");
          // Only initialize if AuthModal didn't create the document (fallback)
          // This should rarely happen now since we create docs immediately in AuthModal
          initializeNewUser();
        }
      }, (error) => {
        console.error("🔥 Firestore listener error:", error);
        console.error("🔥 Error details:", {
          code: error.code,
          message: error.message,
          userEmail: user.email,
          userUid: user.uid
        });
        setPlanLoading(false);
      });

      return () => {
        console.log("🔥 Cleaning up Firestore listener");
        unsubscribe();
      };
    }, 500); // wait 500ms for auth token to fully load

    return () => clearTimeout(timeout);
  }, [user?.email, authLoading]);

  // ── Initialize New User ───────────────────────────────────────────────────────

  const initializeNewUser = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      console.log("Initializing new user in vedicastro-data project");
      const userDocRef = doc(db, "users", user.email);
      await setDoc(userDocRef, {
        planName: "Free",
        credits: 1,
        reportCredits: 0,
        compatibilitycredits: 0,
        purchasedReports: [],
        unlimitedExpiry: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      console.log("✅ New user initialized with 1 credit in vedicastro-data");
    } catch (error) {
      console.error("❌ Error initializing new user:", error);
    }
  }, [user]);

  // ── Atomic Credit Deduction ───────────────────────────────────────────────────

  const deductCredit = useCallback(async (): Promise<boolean> => {
    if (!user?.email) {
      console.log("User not logged in - blocking API call");
      return false;
    }

    // Use ref to get latest credits value, avoiding stale closure
    const currentCredits = creditsRef.current;
    const hasDayPass = unlimitedExpiry && new Date() < unlimitedExpiry;
    if (!hasDayPass && currentCredits <= 0) {
      console.log("🔒 Local guard: No credits available, blocking API call");
      return false;
    }

    try {
      console.log("💳 Attempting to deduct credit for:", user.email);
      console.log("💳 Current credits (from ref):", currentCredits);
      
      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "";
      const response = await fetch(`${API_BASE}/api/check-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, 
          action: "deduct" 
        }),
      });
      
      if (!response.ok) {
        console.error("❌ Failed to deduct credit:", response.status);
        return false;
      }
      
      const data = await response.json();
      console.log("💳 Credit deduction response:", data);
      
      if (data.reason === 'unlimited') {
        console.log("✅ Day Pass active - no credit deducted");
        return true;
      }

      if (data.deducted) {
        console.log("✅ Credit successfully deducted, updating UI optimistically");
        console.log("💳 Before optimistic update - UI credits:", currentCredits);
        const newCredits = Math.max(0, data.credits ?? currentCredits - 1);
        if (newCredits === 0) {
          void fetch(`${API_BASE}/api/send-low-credit-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              username: user.displayName || user.email.split("@")[0],
            }),
          }).catch((err) => console.error("Low credit email failed:", err));
        }
        // Optimistic update - use ref value to avoid stale closure
        setCredits(prev => {
          console.log("💳 After optimistic update - UI credits:", newCredits);
          return newCredits;
        });
        return true;
      } else {
        console.log("❌ Credit deduction failed -", data.reason || "no credits available");
        // Force sync local state if backend says no credits
        if (data.reason === 'no_credits') {
          console.log("💳 Force syncing UI credits to 0 (backend says no credits)");
          setCredits(0);
        }
        return false;
      }
    } catch (error) {
      console.error("❌ Error deducting credit:", error);
      return false;
    }
  }, [user, unlimitedExpiry]); // Remove credits from dependencies

  // ── Compatibility Credit Deduction ───────────────────────────────────────────────────

  const deductCompatibilityCredit = useCallback(async (): Promise<boolean> => {
    if (!user?.email) {
      console.log("User not logged in - blocking compatibility API call");
      return false;
    }

    // Use ref to get latest compatibility credits value
    const currentCompatibilityCredits = compatibilityCreditsRef.current;
    
    if (currentCompatibilityCredits <= 0) {
      console.log("🔒 Local guard: No compatibility credits available, blocking API call");
      return false;
    }

    try {
      console.log("💳 Attempting to deduct compatibility credit for:", user.email);
      console.log("💳 Current compatibility credits (from ref):", currentCompatibilityCredits);
      
      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "";
      const response = await fetch(`${API_BASE}/api/check-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, 
          action: "deduct",
          type: "compatibility"
        }),
      });
      
      if (!response.ok) {
        console.error("❌ Failed to deduct compatibility credit:", response.status);
        return false;
      }
      
      const data = await response.json();
      console.log("💳 Compatibility credit deduction response:", data);
      
      if (data.deducted) {
        console.log("✅ Compatibility credit successfully deducted, updating UI optimistically");
        console.log("💳 Before optimistic update - UI compatibility credits:", currentCompatibilityCredits);
        // Optimistic update - use ref value to avoid stale closure
        setCompatibilityCredits(prev => {
          const newCredits = Math.max(0, currentCompatibilityCredits - 1);
          console.log("💳 After optimistic update - UI compatibility credits:", newCredits);
          return newCredits;
        });
        return true;
      } else {
        console.log("❌ Compatibility credit deduction failed -", data.reason || "no compatibility credits available");
        // Force sync local state if backend says no credits
        if (data.reason === 'no_compatibility_credits') {
          console.log("💳 Force syncing UI compatibility credits to 0 (backend says no credits)");
          setCompatibilityCredits(0);
        }
        return false;
      }
    } catch (error) {
      console.error("❌ Error deducting compatibility credit:", error);
      return false;
    }
  }, [user]);

  // ── Priority Access Check ─────────────────────────────────────────────────────

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      console.log("🔍 Checking access with current state:", {
        credits,
        unlimitedExpiry,
        unlimitedExpiryValid: unlimitedExpiry && new Date() < unlimitedExpiry,
        feature
      });
      
      // Tomorrow predictions are always free for everyone
      if (feature === "tomorrow") {
        console.log("🔍 Access granted: Tomorrow predictions are free");
        return true;
      }
      
      // Priority 1: Check unlimitedExpiry (Day Pass)
      if (unlimitedExpiry && new Date() < unlimitedExpiry) {
        console.log("🔍 Access granted: Day Pass active");
        return true;
      }
      
      // Priority 2: Check credits
      if (credits > 0) {
        console.log("🔍 Access granted: Have", credits, "credits");
        return true;
      }
      
      // Priority 3: No access - trigger modal
      console.log("🔍 Access denied: No credits or valid Day Pass");
      return false;
    },
    [credits, unlimitedExpiry]
  );

  const requireFeature = useCallback(
    (feature: FeatureKey): boolean => {
      const access = canAccess(feature);
      if (!access) setLockedFeature(feature);
      return access;
    },
    [canAccess]
  );

  // ── Countdown Timer for Day Pass ───────────────────────────────────────────────

  const getTimeUntilExpiry = useCallback((): string => {
    if (!unlimitedExpiry) return "";
    
    const now = new Date();
    const expiry = new Date(unlimitedExpiry);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, [unlimitedExpiry]);

  // ── Question Management ───────────────────────────────────────────────────────

  const canAskMoreQuestions = useCallback(async (): Promise<boolean> => {
    console.log("🔍 Checking if can ask more questions:", {
      credits,
      unlimitedExpiry,
      hasDayPass: unlimitedExpiry && new Date() < unlimitedExpiry
    });
    
    // Priority 1: Check Day Pass
    if (unlimitedExpiry && new Date() < unlimitedExpiry) {
      console.log("🔍 Can ask: Day Pass active");
      return true;
    }
    
    // Priority 2: Check credits
    if (credits > 0) {
      console.log("🔍 Can ask: Have", credits, "credits");
      return true;
    }
    
    // Priority 3: No access
    console.log("🔍 Cannot ask: No credits or valid Day Pass");
    return false;
  }, [credits, unlimitedExpiry]);

  const registerQuestionUsage = useCallback(async () => {
    const success = await deductCredit();
    if (success) {
      console.log("Question usage registered - credit deducted");
    }
  }, [deductCredit]);

  const resetQuestionUsage = useCallback(() => {
    // No longer needed with Firestore real-time sync
    console.log("Question usage reset - handled by Firestore");
  }, []);

  const hasQuickPack = credits > 3;

  const useQuickPackQuestion = useCallback(async (): Promise<boolean> => {
    if (credits > 3) return await deductCredit();
    return false;
  }, [credits, deductCredit]);

  // ── Report Management ─────────────────────────────────────────────────────────

  const canGenerateReport = useCallback((): boolean => {
    return reportCredits > 0;
  }, [reportCredits]);

  const registerReportUsage = useCallback(async () => {
    if (!user?.email) {
      console.log("User not logged in - blocking report API call");
      return;
    }
    
    // Use ref to get latest report credits value, avoiding stale closure
    const currentReportCredits = reportCreditsRef.current;
    
    if (currentReportCredits > 0) {
      try {
        console.log("📄 Attempting to deduct report credit for:", user?.email);
        console.log("📄 Current report credits (from ref):", currentReportCredits);
        
        const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "";
        const response = await fetch(`${API_BASE}/api/check-access`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: user?.email, 
            action: "deduct",
            type: "report" 
          }),
        });

        if (!response.ok) {
          console.error("❌ Failed to deduct report credit:", response.status);
          return;
        }

        const data = await response.json();
        console.log("📄 Report credit deduction response:", data);

        if (data.deducted && data.reason === 'report_deducted') {
          console.log("✅ Report credit successfully deducted");
          console.log("📄 Before optimistic update - UI report credits:", currentReportCredits);
          // Optimistic update - use ref value to avoid stale closure
          setReportCredits(prev => {
            const newReportCredits = Math.max(0, currentReportCredits - 1);
            console.log("📄 After optimistic update - UI report credits:", newReportCredits);
            return newReportCredits;
          });
        } else {
          console.log("❌ Report credit deduction failed -", data.reason || "no report credits available");
          if (data.reason === 'no_report_credits') {
            console.log("📄 Force syncing UI report credits to 0 (backend says no report credits)");
            setReportCredits(0);
          }
        }
      } catch (error) {
        console.error("❌ Error deducting report credit:", error);
      }
    } else {
      console.log("🔒 No report credits available, blocking report generation");
    }
  }, [user]); // Remove reportCredits from dependencies

  // ── Plan Management ───────────────────────────────────────────────────────────

  const refreshPlan = useCallback(async () => {
    // No longer needed with Firestore real-time sync
    console.log("Plan refresh - handled by Firestore real-time listener");
  }, []);

  const applyPlanLocally = useCallback((plan: PlanName, expires?: Date | null) => {
    setPlanName(plan);
    setExpiresAt(expires || null);
    setCredits(PLAN_CREDITS[plan] ?? 1);
    
    if (plan === "Day Pass") {
      // Set expiry to 11:59:59 PM IST (Indian Standard Time)
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const expiry = new Date(istTime);
      expiry.setHours(23, 59, 59, 999);
      
      // Convert back to UTC for storage
      const utcExpiry = new Date(expiry.toLocaleString("en-US", { timeZone: "UTC" }));
      setUnlimitedExpiry(utcExpiry);
      
      console.log("Day Pass expiry set to IST 11:59:59 PM (UTC:", utcExpiry.toISOString(), ")");
    } else {
      setUnlimitedExpiry(null);
    }
  }, []);

  const value = {
    planName,
    expiresAt,
    unlimitedExpiry,
    credits,
    purchasedReports,
    reportCredits,
    compatibilityCredits,
    loading: planLoading || authLoading,
    canAccess,
    requireFeature,
    refreshPlan,
    applyPlanLocally,
    allowedQuestions: PLAN_CREDITS[planName] ?? 1,
    usedQuestions: 0,
    canAskMoreQuestions,
    registerQuestionUsage,
    resetQuestionUsage,
    hasQuickPack,
    useQuickPackQuestion,
    deductCredit,
    deductCompatibilityCredit,
    canGenerateReport,
    registerReportUsage,
    getTimeUntilExpiry,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}

      {/* Locked Feature Modal */}
      <Dialog
        open={lockedFeature != null}
        onOpenChange={(open) => !open && setLockedFeature(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-secondary" />
              <DialogTitle>Feature Locked</DialogTitle>
            </div>
            <DialogDescription>
              Upgrade your plan to access{" "}
              {lockedFeature ? FEATURE_LABEL[lockedFeature] : "this feature"}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setLockedFeature(null)}>
              Close
            </Button>
            <Button
              variant="cosmic"
              onClick={() => {
                setLockedFeature(null);
                navigate("/pricing?referral=upgrade");
              }}
            >
              View Plans
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PlanContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};

export const usePlanActions = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlanActions must be used within a PlanProvider");
  }
  return {
    refreshPlan: context.refreshPlan,
    applyPlanLocally: context.applyPlanLocally,
    canAskMoreQuestions: context.canAskMoreQuestions,
    registerQuestionUsage: context.registerQuestionUsage,
    resetQuestionUsage: context.resetQuestionUsage,
    hasQuickPack: context.hasQuickPack,
    useQuickPackQuestion: context.useQuickPackQuestion,
    deductCredit: context.deductCredit,
    canGenerateReport: context.canGenerateReport,
    registerReportUsage: context.registerReportUsage,
    getTimeUntilExpiry: context.getTimeUntilExpiry,
  };
};
