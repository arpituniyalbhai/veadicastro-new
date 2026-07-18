import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, User, Mail, Building2, FileText, ChevronDown, ChevronUp, Settings, Loader2, AlertCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAuthInstance } from "@/lib/firebase";
import { usePlan } from "@/context/PlanContext";

const SubscriptionOnboarding = () => {
  const { user, loading, setAuthOpen } = useAuth();
  const { applyPlanLocally, refreshPlan } = usePlan();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState("");
  const [gstin, setGstin] = useState("");
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Premium Subscription");

  // Dynamic Razorpay script loading function
  const loadRazorpayScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // If Razorpay is already loaded, resolve immediately
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      // Create and load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve();
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        reject(new Error("Failed to load payment system. Please refresh the page and try again."));
      };
      document.head.appendChild(script);
    });
  }, []);

  // Set email from user on mount
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else {
      // Try to get from localStorage
      try {
        const storedEmail = localStorage.getItem('user_email') || localStorage.getItem('profile_email');
        if (storedEmail) setEmail(storedEmail);
      } catch {
        /* ignore stored email errors */
      }
    }
  }, [user]);

  const next = () => setStep(2);
  const back = () => setStep((s) => Math.max(1, s - 1));

  // Validation for step 1 (only name and email required)
  const step1Filled = !!fullName.trim() && !!email.trim();

  const handleComplete = useCallback(async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Save billing details
      const billingDetails = {
        fullName,
        email,
        company: company || null,
        gstin: gstin || null,
      };
      localStorage.setItem('billing_details', JSON.stringify(billingDetails));

      // Load Razorpay script dynamically
      await loadRazorpayScript();

      // Step 1: Create subscription via backend API
      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
      const createSubscriptionResponse = await fetch(`${API_BASE}/api/razorpay/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || '',
          customerName: fullName || user.displayName || user.email?.split('@')[0] || '',
          customerEmail: user.email,
        }),
      });

      if (!createSubscriptionResponse.ok) {
        const errorData = await createSubscriptionResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create subscription. Please try again.');
      }

      const subscriptionData = await createSubscriptionResponse.json();
      const { subscriptionId, keyId } = subscriptionData;

      if (!subscriptionId || !keyId) {
        throw new Error('Invalid response from subscription server. Please try again.');
      }

      // Step 2: Open Razorpay checkout with subscription ID
      const options = {
        key: keyId,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency || 'INR',
        subscription_id: subscriptionId,
        name: "Veadicastro",
        description: "Vedika Premium Monthly Subscription - AutoPay",
        image: "https://veadicastro.in/optimized/logo.webp",
        prefill: {
          email: user.email,
          contact: "",
          name: fullName || user.email?.split('@')[0] || '',
        },
        notes: {
          "This is an AutoPay subscription": "You will be charged ₹499 monthly until cancelled",
        },
        handler: async (response: any) => {
          try {
            console.log('[Subscription] Razorpay response:', response);

            const auth = await getAuthInstance();
            const current = auth.currentUser;
            if (!current?.uid) {
              throw new Error('User not authenticated. Please log in and try again.');
            }

            // Step 3: Verify subscription on backend
            const verifyPayload = {
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: current.email || null,
              displayName: current.displayName || current.email?.split("@")[0] || null,
            };

            const verifyResponse = await fetch(`${API_BASE}/api/razorpay/verify-subscription`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(verifyPayload),
            });

            const verifyData = await verifyResponse.json().catch(() => ({}));
            
            if (!verifyResponse.ok || !verifyData.verified) {
              const errorMsg = verifyData.error || 'Subscription verification failed. Please contact support.';
              throw new Error(errorMsg);
            }

            // Subscription verified successfully
            console.log('[Subscription] Verification successful:', verifyData);
            setSelectedPlan('Premium Subscription');
            setSuccessPopupOpen(true);

            // Update plan state for subscription
            const expiresAt = new Date(verifyData.subscriptionExpiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000);
            applyPlanLocally('Premium', expiresAt);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await refreshPlan();

            // Store subscription info in localStorage
            try {
              const payments = JSON.parse(localStorage.getItem("payments") || "[]");
              const subscriptionRecord = {
                planName: 'Premium Subscription',
                amount: subscriptionData.amount,
                paymentId: response.razorpay_payment_id,
                subscriptionId: response.razorpay_subscription_id,
                signature: response.razorpay_signature,
                verified: true,
                timestamp: new Date().toISOString(),
                isSubscription: true,
              };
              payments.push(subscriptionRecord);
              localStorage.setItem("payments", JSON.stringify(payments));
            } catch (e) {
              console.error("Error storing subscription info", e);
            }

          } catch (verifyError: any) {
            console.error("Subscription verification error:", verifyError);
            alert(`Subscription verification failed: ${verifyError.message}\n\nIf you do not receive Premium access within 5 minutes, please contact support@veadicastro.in with your payment ID: ${response.razorpay_payment_id}`);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Subscription payment cancelled by user");
            setIsProcessingPayment(false);
          },
        },
        theme: {
          color: "#EC4899",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        console.error("Subscription payment failed:", response);
        alert(`Payment failed: ${response.error?.description || 'Unknown error'}\n\nIf you believe this is an error, please contact support@veadicastro.in\n\nError Code: ${response.error?.code || 'N/A'}`);
        setIsProcessingPayment(false);
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error("Error in subscription payment flow:", error);
      alert(`Subscription Error: ${error.message || 'An unexpected error occurred. Please try again.'}\n\nIf the issue persists, please contact support@veadicastro.in`);
      setIsProcessingPayment(false);
    }
  }, [user, applyPlanLocally, refreshPlan, loadRazorpayScript, fullName, email, company, gstin, setAuthOpen]);


  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 pt-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 space-y-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/pricing")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Button>
          
          {/* AutoPay Info Banner */}
          <Card className="p-4 bg-secondary/10 border border-secondary/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-secondary">AutoPay Subscription</h3>
                <p className="text-sm text-muted-foreground">
                  This is a <strong>monthly recurring subscription (AutoPay)</strong> via Razorpay. 
                  You will be charged <strong>₹499/month</strong> until you cancel.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you do not receive Premium access within 5 minutes after payment, 
                  please contact <strong>support@veadicastro.in</strong> with your payment ID.
                </p>
              </div>
            </div>
          </Card>

          {!user && !loading && (
            <Card className="p-4 bg-secondary/10 border border-secondary/30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-secondary">Sign in to activate subscription</h3>
                <p className="text-sm text-muted-foreground">
                  You need an account to set up your AutoPay subscription.
                </p>
              </div>
              <Button variant="cosmic" onClick={() => setAuthOpen(true)}>
                Sign in / Create account
              </Button>
            </Card>
          )}
        </div>

        <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Subscription Details</h1>
            <p className="text-muted-foreground">Complete your details for Vedika Premium AutoPay subscription</p>
          </div>

          {/* Step 1: Personal & Contact Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 bg-background/50 border-border/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-background/50 border-border/60"
                />
                <p className="text-xs text-muted-foreground">This email will be used for subscription confirmation and billing</p>
              </div>

              {/* Advanced Settings - Collapsible */}
              <Collapsible open={advancedSettingsOpen} onOpenChange={setAdvancedSettingsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between h-11 bg-background/50 border-border/60 hover:bg-accent/10"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Advanced Settings</span>
                    </div>
                    {advancedSettingsOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company or Organization <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="company"
                      placeholder="Enter company or organization name (optional)"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="h-11 bg-background/50 border-border/60"
                    />
                    <p className="text-xs text-muted-foreground">Optional for B2B / Tax</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstin" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      GSTIN <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="gstin"
                      placeholder="Enter GSTIN (optional)"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="h-11 bg-background/50 border-border/60"
                      maxLength={15}
                    />
                    <p className="text-xs text-muted-foreground">Add only if you need a GST-compliant invoice.</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Step 2: Review & Payment (Final Page) */}
          {step === 2 && (
            <div className="space-y-6">

              {/* Review Details */}
              <div className="p-4 rounded-lg bg-card/60 border border-border/60">
                <h3 className="font-semibold mb-4">Review Your Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span>{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Address:</span>
                    <span>{email}</span>
                  </div>
                  {company && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span>{company}</span>
                    </div>
                  )}
                  {gstin && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GSTIN:</span>
                      <span>{gstin}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-lg bg-card/60 border border-border/60">
                <h3 className="font-semibold mb-3">Subscription Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan:</span>
                    <span>Vedika Premium (AutoPay)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Billing Cycle:</span>
                    <span>Monthly</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>₹499/month</span>
                  </div>
                  <div className="border-t border-border/60 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>First Payment</span>
                      <span className="text-secondary">₹499</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <Card className="p-4 bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-500">Important Notice</p>
                    <p className="text-xs text-muted-foreground">
                      By proceeding, you agree to the monthly recurring charges. 
                      You can cancel anytime from your Razorpay dashboard or by contacting support@veadicastro.in
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Data Encryption Footer */}
          <div className="mt-6 pt-4 border-t border-border/60">
            <p className="text-xs text-center text-muted-foreground">
              🔐 Your data is encrypted and used only for your personalized astrological insights.
            </p>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={back} disabled={step === 1}>Back</Button>
            {step === 1 ? (
              <Button 
                variant="cosmic" 
                onClick={next}
                disabled={!step1Filled}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="cosmic" 
                onClick={handleComplete}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up AutoPay...
                  </>
                ) : (
                  "Activate Subscription"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Success Popup */}
      <Dialog open={successPopupOpen} onOpenChange={setSuccessPopupOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-secondary">
              <img 
                src="/optimized/vedika.webp" 
                alt="Vedika" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl mb-2">🎉 Subscription Activated!</DialogTitle>
              <DialogDescription className="text-base">
                Your Vedika Premium AutoPay subscription is now active.
              </DialogDescription>
            </div>
            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 w-full">
              <p className="text-sm text-muted-foreground mb-2">You received:</p>
              <p className="text-lg font-semibold text-foreground mb-1">
                20 Question Credits
              </p>
              <p className="text-lg font-semibold text-foreground mb-2">
                +1 Report Credit
              </p>
              <p className="text-xs text-muted-foreground">
                Credits refresh monthly. Your subscription will auto-renew on the same date next month.
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 w-full">
              <p className="text-xs text-muted-foreground">
                <strong>Need help?</strong> Contact support@veadicastro.in if you face any issues.
              </p>
            </div>
            <Button 
              variant="cosmic" 
              className="w-full"
              onClick={() => {
                setSuccessPopupOpen(false);
                navigate("/dashboard");
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionOnboarding;
