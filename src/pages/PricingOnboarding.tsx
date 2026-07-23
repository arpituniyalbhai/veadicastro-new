import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Tag, User, Mail, Building2, FileText, ChevronDown, ChevronUp, Settings, Loader2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAuthInstance, savePremiumUserToFirestore } from "@/lib/firebase";
import { usePlan, type PlanName } from "@/context/PlanContext";

const PricingOnboarding = () => {
  const { user, loading, setAuthOpen } = useAuth();
  const { applyPlanLocally, refreshPlan, planName: userPlan } = usePlan();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planName = searchParams.get("plan") || "";
  const planAmount = parseFloat(searchParams.get("amount") || "0");
  const planType = searchParams.get("type") || "";
  
  // Helper functions - must be declared before use
  const getPlanCredits = (planName: string): number => {
    const normalized = planName.toLowerCase();
    if (normalized.includes("first ask")) return 2;
    if (normalized.includes("quick ask")) return 5;
    if (normalized.includes("deep dive")) return 15;
    if (normalized.includes("power pack")) return 30;
    if (normalized.includes("day pass")) return 999;
    if (normalized.includes("premium")) return 20;
    if (normalized.includes("standard")) return 10;
    return 0;
  };

  const normalizePlanTier = (name: string): PlanName => {
    const normalized = name.toLowerCase();
    if (normalized.includes("first ask")) return "First Ask";
    if (normalized.includes("quick ask")) return "Quick Ask";
    if (normalized.includes("deep dive")) return "Deep Dive";
    if (normalized.includes("power pack")) return "The Power Pack";
    if (normalized.includes("day pass")) return "Day Pass";
    if (normalized.includes("standard")) return "Standard";
    if (normalized.includes("premium")) return "Premium";
    if (normalized.includes("free")) return "Free";
    return "Free";
  };
  
  const [step, setStep] = useState(2);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState("");
  const [gstin, setGstin] = useState("");
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [failurePopupOpen, setFailurePopupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; credits: number } | null>(
    planName ? { name: planName, credits: getPlanCredits(planName) } : null
  );

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

  // Auto-fetch email and name from user on mount
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
    // Auto-fetch name from user or localStorage
    if (user?.displayName) {
      setFullName(user.displayName);
    } else {
      try {
        const storedName = localStorage.getItem('profile_name');
        if (storedName) setFullName(storedName);
      } catch {
        /* ignore stored name errors */
      }
    }
  }, [user]);

  useEffect(() => {
    setSelectedPlan(planName ? { name: planName, credits: getPlanCredits(planName) } : null);
  }, [planName]);

  // Razorpay script will be loaded only when payment is initiated

  const back = () => setStep((s) => Math.max(2, s - 1));

  // Calculate final price
  const finalPrice = useMemo(() => {
    return planAmount;
  }, [planAmount]);

  // Calculate pricing breakdown with GST
  const calculatePricing = (total: number) => {
    // Work backwards from total to show realistic breakdown
    // Total = Subtotal + GST (18%)
    // Subtotal = Total / 1.18
    const subtotal = Math.round(total / 1.18);
    const gst = total - subtotal;
    const originalPrice = Math.round(subtotal * 1.5); // Show higher original price
    const discount = originalPrice - subtotal;
    return { originalPrice, discount, subtotal, gst, total };
  };

  const pricing = calculatePricing(planAmount);


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

      // Step 1: Create order via backend API
      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
      const createOrderResponse = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: 'INR',
          planName,
          userPlan: userPlan || 'Free', // Send user's current plan for discount eligibility
        }),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create payment order. Please try again.');
      }

      const orderData = await createOrderResponse.json();
      const { orderId, keyId } = orderData;

      if (!orderId || !keyId) {
        throw new Error('Invalid response from payment server. Please try again.');
      }

      // Step 2: Open Razorpay checkout with order ID
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        order_id: orderId,
        name: "Veadicastro",
        description: `${planName} Plan`,
        image: "https://veadicastro.in/optimized/logo.webp",
        prefill: {
          email: user.email,
          contact: "",
          name: fullName || user.email?.split('@')[0] || '',
        },
        handler: async (response: any) => {
          try {
            console.log('[Payment] Razorpay response:', response);

            const auth = await getAuthInstance();
            const current = auth.currentUser;
            if (!current?.uid) {
              throw new Error('User not authenticated. Please log in and try again.');
            }

            // Step 3: Verify payment on backend
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName,
              amount: orderData.amount,
              userId: current.uid,
              email: current.email || null,
              displayName: current.displayName || current.email?.split("@")[0] || null,
              type: planType,
            };

            const verifyResponse = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(verifyPayload),
            });

            const verifyData = await verifyResponse.json().catch(() => ({}));
            
            if (!verifyResponse.ok || !verifyData.verified) {
              const errorMsg = verifyData.error || 'Payment verification failed. Please contact support.';
              throw new Error(errorMsg);
            }

            // Payment verified successfully
            console.log('[Payment] Verification successful:', verifyData);
            setSelectedPlan({ name: planName, credits: getPlanCredits(planName) });
            setSuccessPopupOpen(true);

            // Don't call applyPlanLocally - let Firestore real-time sync handle it
            // This prevents showing wrong credits in sidebar before backend syncs
            await new Promise(resolve => setTimeout(resolve, 2000));
            await refreshPlan();

            // Store payment info in localStorage
            try {
              const payments = JSON.parse(localStorage.getItem("payments") || "[]");
              const paymentRecord = {
                planName,
                amount: orderData.amount,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                verified: true,
                timestamp: new Date().toISOString(),
              };
              payments.push(paymentRecord);
              localStorage.setItem("payments", JSON.stringify(payments));
            } catch (e) {
              console.error("Error storing payment info", e);
            }

            // Generate invoice
            try {
              const { generateInvoice } = await import("@/lib/invoice");
              const invoice = await generateInvoice({
                fullName,
                email: email || "noreply@veadicastro.in",
                planName: planName || "Premium",
                totalAmount: Number(orderData.amount) / 100,
                paymentId: response.razorpay_payment_id,
              });

              // Store invoice reference
              try {
                const payments = JSON.parse(localStorage.getItem("payments") || "[]");
                if (payments.length) {
                  payments[payments.length - 1].invoiceNumber = invoice.invoiceNumber;
                  localStorage.setItem("payments", JSON.stringify(payments));
                }
              } catch {
                /* ignore */
              }
            } catch (invoiceError) {
              console.error("[Invoice] generation failed", invoiceError);
            }
          } catch (verifyError: any) {
            console.error("Payment verification error:", verifyError);
            alert(`Payment verification failed: ${verifyError.message}\n\nPlease contact support with your payment ID: ${response.razorpay_payment_id}`);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment cancelled by user");
            setFailurePopupOpen(true);
            setIsProcessingPayment(false);
          },
        },
        theme: {
          color: "#EC4899",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        console.error("Payment failed:", response);
        setFailurePopupOpen(true);
        setIsProcessingPayment(false);
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error("Error in payment flow:", error);
      alert(`Payment Error: ${error.message || 'An unexpected error occurred. Please try again.'}`);
      setIsProcessingPayment(false);
    }
  }, [user, applyPlanLocally, refreshPlan, loadRazorpayScript, fullName, email, company, gstin, planName, finalPrice]);


  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 space-y-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/pricing")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Button>
          {!user && !loading && (
            <Card className="p-4 bg-secondary/10 border border-secondary/30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-secondary">Sign in to save your billing details</h3>
                <p className="text-sm text-muted-foreground">
                  You can still fill this form, but you’ll need an account before completing payment.
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Billing Information</h1>
            <p className="text-muted-foreground">Please provide your details for payment processing</p>
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
                <p className="text-xs text-muted-foreground">This email will be used for payment confirmation</p>
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
                <h3 className="font-semibold mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan:</span>
                    <span>{planName}</span>
                  </div>
                  <div className="border-t border-border/60 pt-2 mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Original Price:</span>
                      <span>₹{pricing.originalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="text-green-500">-₹{pricing.discount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>₹{pricing.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%):</span>
                      <span>₹{pricing.gst}</span>
                    </div>
                    <div className="border-t border-border/60 pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-secondary">₹{pricing.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Encryption Footer */}
          <div className="mt-6 pt-4 border-t border-border/60">
            <p className="text-xs text-center text-muted-foreground">
              🔐 Your data is encrypted and used only for your personalized astrological insights.
            </p>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={back} disabled={true}>Back</Button>
            <Button 
              variant="cosmic" 
              onClick={handleComplete}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening Razorpay...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
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
              <DialogTitle className="text-2xl mb-2">🎉 Congratulations!</DialogTitle>
              <DialogDescription className="text-base">
                Your payment was successful!
              </DialogDescription>
            </div>
            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 w-full">
              {planType === 'astrologer' ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">Astrologer Booking Confirmed!</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedPlan?.name || 'Astrologer Call'}
                  </p>
                  <p className="text-base font-semibold text-secondary mt-1">
                    Astrologer will connect with you within 24 hours
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Our Team Member will call you within 12 hours
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">You got your credits!</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedPlan?.name || 'Plan'}
                  </p>
                  <p className="text-base font-semibold text-secondary mt-1">
                    {selectedPlan?.credits ? `${selectedPlan.credits} Questions` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Credits available immediately
                  </p>
                </>
              )}
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

      {/* Failure Popup */}
      <Dialog open={failurePopupOpen} onOpenChange={setFailurePopupOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl mb-2">Payment Failed</DialogTitle>
              <DialogDescription className="text-base">
                Hey, your payment failed. If you think payment is successful then email or call us at 9411761184
              </DialogDescription>
            </div>
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setFailurePopupOpen(false);
                  window.location.href = 'tel:9411761184';
                }}
              >
                Call Support
              </Button>
              <Button 
                variant="cosmic" 
                className="flex-1"
                onClick={() => {
                  setFailurePopupOpen(false);
                  window.location.href = 'mailto:support@veadicastro.in?subject=Payment Issue';
                }}
              >
                Email Support
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setFailurePopupOpen(false);
                navigate("/dashboard");
              }}
            >
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingOnboarding;
