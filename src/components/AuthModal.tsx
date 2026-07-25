import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Sparkles, Mail, Lock, User, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAuthInstance, getDataDbInstance } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const AuthModal = () => {
  const { authOpen, setAuthOpen, setUser, skipNextAuthEvent } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Create user document in Firestore immediately after authentication
  const createUserDocument = async (userEmail: string, userName: string, uid: string) => {
    try {
      const auth = await getAuthInstance();
      const db = await getDataDbInstance();
      const { doc, setDoc, getDoc, serverTimestamp } = await import("firebase/firestore");
      const normalizedEmail = (auth.currentUser?.email || userEmail).toLowerCase().trim();
      const userDocRef = doc(db, "users", normalizedEmail);
      
      // Check if doc already exists
      const existing = await getDoc(userDocRef);
      
      if (existing.exists()) {
        // User already has a doc — don't touch anything
        // Their credits, plan, purchased reports are safe
        console.log("Existing user, skipping doc creation:", normalizedEmail);
        return;
      }
      
      // Read traffic source from localStorage
      const trafficSource = localStorage.getItem("traffic_source") || "organic";

      // First time only — create fresh doc with 2 free credits
      await setDoc(userDocRef, {
        uid,
        email: normalizedEmail,
        displayName: userName,
        planName: "Free",
        credits: 1,
        reportCredits: 0,
        compatibilitycredits: 0,
        purchasedReports: [],
        unlimitedExpiry: null,
        trafficSource,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log("New user doc created with 2 free credits:", normalizedEmail);
    } catch (error) {
      console.error("Error in createUserDocument:", error);
    }
  };

  // Send welcome email to new users
  const sendWelcomeEmail = async (userEmail: string, userName: string) => {
    try {
      await fetch("/api/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, username: userName }),
      });
    } catch (err) {
      console.error("Welcome email failed:", err);
    }
  };

  // Timer for OTP expiry
  React.useEffect(() => {
    if (step === "otp" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsResendEnabled(true);
    }
  }, [step, timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onClose = () => {
    if (!loading) {
      setAuthOpen(false);
      // Reset form
      setStep("form");
      setMode("signup");
      setEmail("");
      setPassword("");
      setName("");
      setOtp(["", "", "", "", "", ""]);
      setError(null);
      setSuccess(null);
      setTimeLeft(300);
      setIsResendEnabled(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const auth = await getAuthInstance();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        const userEmail = result.user.email || "";
        const userName = result.user.displayName || "User";
        
        // Create user document immediately after authentication
        await createUserDocument(userEmail, userName, result.user.uid);
        
        // Send welcome email
        await sendWelcomeEmail(userEmail, userName);
        
        // Update auth context with basic user info
        const userData = {
          uid: result.user.uid,
          email: userEmail,
          displayName: userName,
          createdAt: result.user.metadata.creationTime || new Date(),
          lastLoginAt: new Date(),
        };
        
        setUser(userData);
        
        setAuthOpen(false);
        
        // Redirect flow: Welcome -> Onboarding -> Dashboard (for all users)
        navigate("/welcome");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    if (mode === "signup" && !name) {
      setError("Please enter your name");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        // For signup: create account and send OTP
        skipNextAuthEvent.current = true; // Skip next auth state change

        const auth = await getAuthInstance();
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        
        // Sign out immediately - user will sign back in after OTP verification
        await auth.signOut();

        // Send OTP for email verification (only for signup)
        const response = await fetch("/api/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess("Account created! Please verify your email with OTP.");
          setStep("otp");
          setTimeLeft(300);
          setIsResendEnabled(false);
        } else {
          // If OTP fails, still proceed but show warning
          setSuccess("Account created! Email verification sent.");
          setStep("otp");
          setTimeLeft(300);
          setIsResendEnabled(false);
        }
      } else {
        // For login: direct login without OTP
        await handlePasswordAuth(e);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setError(message);
    } finally {
      if (mode === "signup") {
        setLoading(false);
      }
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    if (mode === "signup" && !name) {
      setError("Please enter your name");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const auth = await getAuthInstance();
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        
        // Create user document immediately after signup
        await createUserDocument(email.toLowerCase(), name || "User", cred.user.uid);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        
        // For login, also ensure user document exists
        if (auth.currentUser) {
          await createUserDocument(
            email.toLowerCase(), 
            auth.currentUser?.displayName || name || "User", 
            auth.currentUser.uid
          );
        }
      }

      // Update auth context with basic user info
      const userData = {
        uid: auth.currentUser?.uid,
        email: email.toLowerCase(),
        displayName: auth.currentUser?.displayName || name,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      
      setUser(userData);
      
      setAuthOpen(false);

      // Redirect to original page or welcome
      const returnPath = sessionStorage.getItem("auth_return_path");
      sessionStorage.removeItem("auth_return_path");
      navigate(returnPath || "/welcome");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1); // Only allow single digit
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace in OTP input
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("").filter(char => /\d/.test(char));
    
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    
    setOtp(newOtp);
    
    // Focus the next empty input
    const nextEmptyIndex = newOtp.findIndex(val => val === "");
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("OTP verified! Signing you in...");

        const auth = await getAuthInstance();
        // Sign back in after OTP verification
        await signInWithEmailAndPassword(auth, email, password);
        
        // Create user document immediately after OTP verification
        if (auth.currentUser) {
          await createUserDocument(
            email.toLowerCase(), 
            auth.currentUser?.displayName || name || "User", 
            auth.currentUser.uid
          );
          await sendWelcomeEmail(
            email.toLowerCase(),
            auth.currentUser?.displayName || name || "User"
          );
        }
        
        // Update auth context with basic user info
        const userData = {
          uid: auth.currentUser?.uid,
          email: email.toLowerCase(),
          displayName: auth.currentUser?.displayName || name,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };
        
        setUser(userData);
        
        setAuthOpen(false);
        
        // Redirect flow: Welcome -> Onboarding -> Dashboard (for all users)
        setTimeout(() => {
          navigate("/welcome");
        }, 1000);
      } else {
        setError(data.error || "Invalid OTP");
        
        // Clear OTP if invalid
        if (data.remainingAttempts === 0) {
          setStep("form");
          setOtp(["", "", "", "", "", ""]);
        }
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("OTP resent successfully!");
        setOtp(["", "", "", "", "", ""]);
        setTimeLeft(300);
        setIsResendEnabled(false);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || "Failed to resend OTP");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={authOpen} onOpenChange={(o) => (o ? setAuthOpen(true) : onClose())}>
      <DialogContent className="max-w-sm bg-background border border-border shadow-2xl overflow-hidden rounded-[32px]">

        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="text-2xl font-bold text-center">
            {step === "form" 
              ? (mode === "signup" ? "Create your account" : "Welcome back")
              : "Enter Verification Code"
            }
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            {step === "form" 
              ? (mode === "signup" ? "Welcome! Please fill in the details to get started." : "Sign in to access your personalized dashboard")
              : `We sent a 6-digit code to ${email}`
            }
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-start gap-2">
              <span className="text-destructive">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-green-500 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          {step === "form" ? (
            <>
              {/* Social Login Button */}
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="h-9 gap-2 border-border hover:bg-accent/5 text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-medium">
                      Username
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter username"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                      disabled={loading}
                    />
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-8 h-9 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-8 h-9 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="cosmic"
                  disabled={loading || !email || !password || (mode === "signup" && !name)}
                  className="w-full h-9 text-xs"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{mode === "signup" ? "Creating..." : "Signing In..."}</span>
                    </div>
                  ) : (
                    <span>{mode === "signup" ? "Sign Up & Verify Email" : "Sign In"}</span>
                  )}
                </Button>
              </form>

              <div className="text-xs text-center pt-1">
                {mode === "signup" ? (
                  <span className="text-muted-foreground">
                    Already have an account?{" "}
                    <button 
                      className="text-foreground font-medium hover:underline" 
                      onClick={() => setMode("login")}
                    >
                      Sign in
                    </button>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Don't have an account?{" "}
                    <button 
                      className="text-foreground font-medium hover:underline" 
                      onClick={() => setMode("signup")}
                    >
                      Create account
                    </button>
                  </span>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-bold bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Code expires in {formatTime(timeLeft)}
                </p>
                {isResendEnabled && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-xs"
                  >
                    {loading ? "..." : "Resend OTP"}
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("form");
                    setOtp(["", "", "", "", "", ""]);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="cosmic"
                  className="flex-1 h-8 text-xs"
                  disabled={loading || otp.join("").length !== 6}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <span>Verify</span>
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="text-xs text-center pt-2 text-muted-foreground">
            {step === "form" ? (
              mode === "signup" ? "Sign up with email verification required." : "Sign in with email and password only."
            ) : (
              "Enter the 6-digit code sent to your email."
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
