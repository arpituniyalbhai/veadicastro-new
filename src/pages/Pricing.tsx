import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Sparkles, Crown, Zap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, savePremiumUserToFirestore } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { generateInvoice } from "@/lib/invoice";
import { usePlan, type PlanName } from "@/context/PlanContext";
import SEO from "@/components/SEO";

const plans = [
  {
    name: "Quick Ask",
    price: 149,
    period: "one-time",
    questions: 5,
    description: "Perfect for urgent questions — get clarity fast",
    buyers: 588,
    recentBuyers: 501,
    benefits: [
      "5 Personalized Questions",
      "Career, love, finance & more",
      "Instant Vedika AI responses",
      "Powered by your exact birth chart",
    " Never expire — use anytime",
      "Cheaper than one pandit visit"
    ]
  },
  {
    name: "Deep Dive",
    price: 399,
    period: "one-time",
    questions: 15,
    description: "Most popular — serious guidance for life's big decisions",
    buyers: 1243,
    recentBuyers: 892,
    benefits: [
      "15 Personalized Questions",
      "Ideal for career, marriage & life planning",
      "Vedika Advanced AI Model",
      "Deeper analysis & accurate predictions",
      "Never expire — use at your pace",
      "Save 46% vs Quick Ask"
    ]
  },
  {
    name: "The Power Pack",
    price: 699,
    period: "one-time",
    questions: 30,
    description: "Best value — unlimited clarity for an entire year of decisions",
    buyers: 241,
    recentBuyers: 344,
    benefits: [
      "30 Personalized Questions",
      "Vedika Advanced AI — Highest Thinking Mode",
       "Never expire — yours forever",
      "Most accurate & detailed readings",
      "Priority response generation",
      "A human astrologer charges ₹500+ per question",
      "Save 55% vs Quick Ask"
    ]
  }
];

// Remove completeFeatures since we're simplifying

const Pricing = () => {
  const { t } = useI18n();
  const [popupOpen, setPopupOpen] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<{[key: string]: boolean}>({});
  const [expandedBenefits, setExpandedBenefits] = useState<{[key: string]: boolean}>({});
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 48, minutes: 0, seconds: 0 });
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const { applyPlanLocally, refreshPlan, planName } = usePlan();
  const autoPayTriggeredRef = useRef(false);
  
  // Razorpay script will be loaded only when payment is initiated

  const normalizePlanTier = (name: string): PlanName => {
    const normalized = name.toLowerCase();
    if (normalized.includes("quick ask")) return "Quick Ask";
    if (normalized.includes("deep dive")) return "Deep Dive";
    if (normalized.includes("power pack")) return "The Power Pack";
    if (normalized.includes("day pass")) return "Day Pass";
    if (normalized.includes("premium")) return "Premium";
    if (normalized.includes("standard")) return "Standard";
    if (normalized.includes("free")) return "Free";
    return "Free";
  };

  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  
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

  // Initialize countdown from localStorage on component mount
  useEffect(() => {
    const COUNTDOWN_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    const STORAGE_KEY = 'shared_countdown_start';
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let startTime: number;
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if the stored countdown is still valid (less than 10 minutes old)
        if (Date.now() - parsed.startTime < COUNTDOWN_DURATION) {
          startTime = parsed.startTime;
        } else {
          // Reset if 10 minutes have passed
          startTime = Date.now();
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime }));
        }
      } else {
        // First time visiting - start now
        startTime = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime }));
      }
      
      // Calculate initial time remaining
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);
      
      if (remaining > 0) {
        const totalSeconds = Math.floor(remaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        setTimeRemaining({ hours, minutes, seconds });
      } else {
        setTimeRemaining({ hours: 0, minutes: 10, seconds: 0 });
        // Reset countdown
        const newStartTime = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: newStartTime }));
      }
    } catch (error) {
      // Fallback if localStorage fails
      setTimeRemaining({ hours: 0, minutes: 10, seconds: 0 });
    }
  }, []);

  // Timer effect for 10-minute countdown
  useEffect(() => {
    const COUNTDOWN_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    const STORAGE_KEY = 'shared_countdown_start';
    
    const timer = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const elapsed = Date.now() - parsed.startTime;
          const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);
          
          if (remaining === 0) {
            // Reset countdown
            const newStartTime = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: newStartTime }));
            setTimeRemaining({ hours: 0, minutes: 10, seconds: 0 });
          } else {
            const totalSeconds = Math.floor(remaining / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            setTimeRemaining({ hours, minutes, seconds });
          }
        }
      } catch (error) {
        // Fallback to simple decrement if localStorage fails
        setTimeRemaining(prev => {
          const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
          
          if (totalSeconds <= 0) {
            return { hours: 0, minutes: 10, seconds: 0 };
          }
          
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          return { hours, minutes, seconds };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  
  const handlePayment = useCallback(async (planName: string) => {
    console.log("Payment initiated for:", planName);
    
    if (!user?.email) {
      alert("Please log in to proceed with payment");
      return;
    }

    setIsRazorpayLoading(true);

    try {
      // Load Razorpay script dynamically
      await loadRazorpayScript();

      // Step 1: Create order via backend API
      // SECURITY: Backend determines amount based on planName, NOT frontend
      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
      const createOrderResponse = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: 'INR',
          planName,
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

      // Check if using production key (starts with rzp_live_)
      const isProduction = keyId.startsWith('rzp_live_');
      if (!isProduction) {
        console.warn('Using test mode. Make sure production keys are set in Vercel environment variables.');
      }

      // Step 2: Open Razorpay checkout with order ID
      const options = {
        key: keyId,
        amount: orderData.amount, // Amount in paise from order
        currency: orderData.currency || 'INR',
        order_id: orderId,
        name: "Veadicastro",
        description: `${planName} Plan`,
        prefill: {
          email: user.email,
          contact: "",
          name: user.email?.split('@')[0] || '',
        },
        handler: async (response: any) => {
          try {
            // Log Razorpay response for debugging
            console.log('[Payment] Razorpay response:', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature ? 'present' : 'missing',
              allKeys: Object.keys(response),
            });

            // Get current user info
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
              amount: orderData.amount, // Amount in paise from order
              userId: current.uid, // Add userId
              email: current.email || null,
              displayName: current.displayName || current.email?.split("@")[0] || null,
            };

            console.log('[Payment] Sending to verify-payment:', {
              ...verifyPayload,
              razorpay_signature: verifyPayload.razorpay_signature ? 'present' : 'missing',
            });

            const verifyResponse = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(verifyPayload),
            });

            const verifyData = await verifyResponse.json().catch(() => ({}));
            
            // Check if verification was successful
            if (!verifyResponse.ok || !verifyData.verified) {
              const errorMsg = verifyData.error || 'Payment verification failed. Please contact support.';
              console.error('[Payment] Verification failed:', {
                status: verifyResponse.status,
                error: errorMsg,
                verifyData,
              });
              
              // FALLBACK: If payment was captured (we have payment_id), still activate premium
              // This handles cases where payment succeeded but verification had minor issues
              if (response.razorpay_payment_id) {
                console.warn('[Payment] Payment captured but verification failed. Activating premium as fallback.');
                
                // Try to save plan anyway via separate API
                try {
                  const saveResponse = await fetch(`${API_BASE}/api/save-user-plan`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      uid: current.uid,
                      email: current.email,
                      displayName: current.displayName || current.email?.split("@")[0],
                      planName: planName || "Premium",
                      paymentId: response.razorpay_payment_id,
                      amount: orderData.amount,
                    }),
                  });

                  if (saveResponse.ok) {
                    console.log('[Payment] Fallback: Plan activated despite verification failure');
                    setSelectedPlan(planName);
                    setSuccessPopupOpen(true);
                    const normalizedTier = normalizePlanTier(planName || "Premium");
                    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    applyPlanLocally(normalizedTier, expiresAt);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await refreshPlan();
                    return; // Exit early, don't throw error
                  }
                } catch (fallbackError) {
                  console.error('[Payment] Fallback save also failed:', fallbackError);
                }
              }
              
              throw new Error(errorMsg);
            }

            // Payment verified successfully
            console.log('[Payment] Verification successful:', verifyData);
            setSelectedPlan(planName);
            setSuccessPopupOpen(true);
            
            // Firestore update should already be done by verify-payment endpoint
            // But we still update local state
            if (verifyData.firestoreUpdated) {
              console.log('[Payment] Firestore updated by verify-payment endpoint');
            } else {
              console.warn('[Payment] Firestore not updated by verify-payment, updating locally');
            }
            
            const normalizedTier = normalizePlanTier(planName || "Premium");
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            applyPlanLocally(normalizedTier, expiresAt);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await refreshPlan();
            
            // Store payment info in localStorage
            try {
              const payments = JSON.parse(localStorage.getItem("payments") || "[]");
              const paymentRecord: Record<string, unknown> = {
                planName,
                amount: orderData.amount, // Amount from verified order
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                verified: true,
                timestamp: new Date().toISOString(),
              };
              payments.push(paymentRecord);
              localStorage.setItem("payments", JSON.stringify(payments));
              console.log("Payment verified and stored:", verifyData);
            } catch (e) {
              console.error("Error storing payment info", e);
            }

            try {
              const billingDetails = (() => {
                try {
                  return JSON.parse(localStorage.getItem("billing_details") || "null");
                } catch {
                  return null;
                }
              })();
              const fullName =
                billingDetails?.fullName || user?.email?.split('@')[0] || "Veadicastro Member";
              const buyerEmail = billingDetails?.email || user?.email || "";
              const invoice = await generateInvoice({
                fullName,
                email: buyerEmail || "noreply@veadicastro.in",
                planName: planName || "Premium",
                totalAmount: Number(orderData.amount) / 100, // Convert from paise to rupees
                paymentId: response.razorpay_payment_id,
              });

              // persist invoice reference
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
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment cancelled by user");
          },
        },
        theme: {
          color: "#EC4899", // Secondary color
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        console.error("Payment failed:", response);
        alert(`Payment failed: ${response.error?.description || 'Unknown error'}\n\nError Code: ${response.error?.code || 'N/A'}`);
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error("Error in payment flow:", error);
      alert(`Payment Error: ${error.message || 'An unexpected error occurred. Please try again.'}`);
    } finally {
      setIsRazorpayLoading(false);
    }
  }, [user, applyPlanLocally, refreshPlan, loadRazorpayScript]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    const autoPay = params.get("autoPay");
    const promo = params.get("promo");

    // SECURITY: Only allow autoPay with valid plan, amount is determined server-side
    const shouldAutoPay = (autoPay === "true" || promo === "NEW33") && !!plan;

    if (!shouldAutoPay || autoPayTriggeredRef.current) {
      return;
    }

    // Validate plan is one of our valid plans
    const validPlans = ['Quick Ask', 'Deep Dive', 'The Power Pack', 'Day Pass'];
    if (!validPlans.includes(plan)) {
      return;
    }

    autoPayTriggeredRef.current = true;

    handlePayment(plan).finally(() => {
      const cleanedParams = new URLSearchParams(location.search);
      cleanedParams.delete("autoPay");
      cleanedParams.delete("amount");
      const cleanedSearch = cleanedParams.toString();
      navigate(cleanedSearch ? `${location.pathname}?${cleanedSearch}` : location.pathname, { replace: true });
      autoPayTriggeredRef.current = false;
    });
  }, [handlePayment, location.pathname, location.search, navigate]);

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Veadicastro Astrology Packs",
    "description": "Choose from Quick Ask, Deep Dive, Power Pack, or Day Pass for personalized Vedic astrology guidance",
    "offers": [
      {
        "@type": "Offer",
        "name": "Quick Ask Pack",
        "price": "1",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Deep Dive Pack",
        "price": "99",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "The Power Pack",
        "price": "199",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "1 Compatibility Credit",
        "price": "29",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "2 Compatibility Credits",
        "price": "49",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "5 Compatibility Credits",
        "price": "99",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
          width: fit-content;
        }
      `}</style>
      <SEO
        title="Pricing Plans - Veadicastro Astrology"
        description="Choose from Quick Ask (₹49), Deep Dive (₹99), or Power Pack (₹199) - all with AI-powered astrology guidance and personalized insights. Start your journey today."
        keywords={["astrology pricing", "vedicastro packs", "astrology questions", "astrology cost", "astrology packs", "vedic astrology guidance"]}
        url="https://veadicastro.in/pricing"
        schema={pricingSchema}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        
        {/* Offer Banner - Limited Time Deal */}
          <Card className="relative overflow-hidden px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 rounded-xl mb-3 max-w-2xl mx-auto">
            <div className="absolute inset-0 opacity-20" style={{background:
              'radial-gradient(circle at 15% 20%, rgba(251,146,60,0.3) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(239,68,68,0.3) 0%, transparent 45%)'}} />
            <div className="relative text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="text-sm bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">LIMITED TIME</span>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-semibold">Offer ends soon!</span>
              </div>
              <h3 className="font-bold text-base text-orange-600 dark:text-orange-400 mb-0.5">Get 15 Questions for just Rs.399!</h3>
              <p className="text-sm text-muted-foreground">Unlock detailed insights about your future</p>
            </div>
          </Card>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Question Pack
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock deeper answers — choose a question pack made for your life's biggest decisions.
          </p>

          {/* Infinity Loop Reviews Section - Small Boxes */}
          <div className="relative w-full overflow-hidden py-6">
            <div className="flex animate-scroll-right">
              <div className="flex gap-4 px-2">
                {[...Array(10)].map((_, index) => {
                  const reviews = [
                    { name: "Rahul Sharma", profession: "Student", rating: 5, comment: "Got clarity on my career confusion, felt very accurate" },
                    { name: "Priya Mehta", profession: "Designer", rating: 5, comment: "Pricing is fair, insights were deeper than expected" },
                    { name: "Aman Verma", profession: "Entrepreneur", rating: 5, comment: "Helped me take a risky decision with confidence" },
                    { name: "Neha Kapoor", profession: "Teacher", rating: 5, comment: "Simple language, actually useful in real life situations" },
                    { name: "Arjun Singh", profession: "Freelancer", rating: 5, comment: "Tried many apps, this felt more genuine and detailed" },
                    { name: "Kavya Reddy", profession: "Designer", rating: 5, comment: "Guidance felt personal, not like random AI answers" }
                  ];
                  const review = reviews[index % 6];
                  return (
                    <div key={`review-${index}`} className="flex-shrink-0 bg-card/40 border border-border/60 rounded-xl p-4 min-w-[280px] max-w-[280px]">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src="/optimized/reviews.webp" 
                          alt={`${review.name} profile`} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-foreground">{review.name}</div>
                          <div className="text-xs text-muted-foreground">{review.profession}</div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">"{review.comment}"</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => {
            const isDeepDive = plan.name === 'Deep Dive';
            
            return (
              <Card
                key={plan.name}
                className={`p-6 rounded-2xl border ${isDeepDive ? 'border-accent/60 bg-accent/10' : 'border-border/60 bg-card/40'} transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer relative min-h-[500px] max-w-sm mx-auto w-full`}
                onClick={(e) => {
                  // Prevent navigation if clicking on benefits toggle
                  if ((e.target as HTMLElement).closest('button')) {
                    return;
                  }
                  navigate(`/pricing/onboarding?plan=${encodeURIComponent(plan.name)}&amount=${plan.price}&type=pack`);
                }}
              >
                {isDeepDive && (
                  <div className="absolute -top-3 -left-3">
                    <span className="bg-green-500/20 border border-green-500/50 text-green-300 text-xs px-3 py-1 rounded-full font-bold">
                      🔥687 people bought in 24 hour - best seller
                    </span>
                  </div>
                )}
                {plan.name === "Quick Ask" && (
                  <div className="absolute -top-3 -left-3">
                    <span className="bg-green-500/20 border border-green-500/50 text-green-300 text-xs px-3 py-1 rounded-full font-bold">
                      🔥 {plan.recentBuyers} bought in 24h
                    </span>
                  </div>
                )}
                {plan.name === "The Power Pack" && (
                  <div className="absolute -top-3 -left-3">
                    <span className="bg-green-500/20 border border-green-500/50 text-green-300 text-xs px-3 py-1 rounded-full font-bold">
                      🔥 213 people bought in 24h
                    </span>
                  </div>
                )}
                
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className={`text-2xl font-bold mb-3 ${isDeepDive ? 'text-accent' : 'text-white'}`}>{plan.name}</h2>
                  <p className="text-white text-sm mb-3">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {plan.questions} Questions
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-4xl font-bold ${isDeepDive ? 'text-accent' : 'text-pink-500'}`}>
                      ₹{plan.price}
                    </span>
                    <span className="text-sm text-white">/ {plan.period}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4 text-center">What you get:</h3>
                  <ul className="space-y-3">
                    {(expandedBenefits[plan.name] ? plan.benefits : plan.benefits.slice(0, 2)).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 text-sm mt-1">✓</span>
                        <span className="text-white text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.benefits.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedBenefits(prev => ({ ...prev, [plan.name]: !prev[plan.name] }));
                      }}
                      className="text-xs text-foreground/70 hover:text-foreground mt-2 text-center w-full transition-colors"
                    >
                      {expandedBenefits[plan.name] ? 'Show less' : `Show ${plan.benefits.length - 2} more benefits`}
                    </button>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  <Button
                    variant={isDeepDive ? "default" : "cosmic"}
                    className={`w-full h-12 rounded-lg font-semibold text-base ${isDeepDive ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pricing/onboarding?plan=${encodeURIComponent(plan.name)}&amount=${plan.price}&type=pack`);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Report Pricing Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Detailed Reports</h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[{
              name: "Personal Growth",
              description: "Complete personal growth guidance based on your birth chart",
              price: 199
            },
            {
              name: "Love & Relationships",
              description: "Complete love and relationship guidance based on your birth chart",
              price: 199
            },
            {
              name: "Career & Wealth",
              description: "Complete career and wealth guidance based on your birth chart",
              price: 199
            }].map((report) => (
              <Card
                key={report.name}
                className="p-6 rounded-2xl border border-border/60 bg-card/40 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer relative"
                onClick={() => {
                  navigate(`/pricing/onboarding?plan=${encodeURIComponent(report.name)}&amount=${report.price}&type=report`);
                }}
              >
                {report.name === "Career & Wealth" && (
                  <div className="absolute -top-2 -left-2">
                    <span className="bg-green-500/10 border-green-500/30 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                      🔥156 people bought in 24h
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-foreground mb-2">{report.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{report.description}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-pink-500">
                    ₹{report.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/ report</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-lg font-semibold"
                >
                  Buy Report
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Compatibility Credits Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Compatibility Analysis Credits</h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                name: "1 Compatibility Credit",
                description: "Analyze compatibility with one person",
                credits: 1,
                price: 29
              },
              {
                name: "2 Compatibility Credits",
                description: "Analyze compatibility with two people",
                credits: 2,
                price: 49
              },
              {
                name: "5 Compatibility Credits",
                description: "Best value! Analyze with five people",
                credits: 5,
                price: 99
              }
            ].map((pack) => (
              <Card
                key={pack.name}
                className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                onClick={() => {
                  navigate(`/pricing/onboarding?plan=${encodeURIComponent(pack.name)}&amount=${pack.price}&type=compatibility`);
                }}
              >
                <h3 className="text-lg font-bold text-foreground mb-2">{pack.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{pack.description}</p>
                <div className="text-2xl font-bold text-purple-400 mb-4">
                  ₹{pack.price}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {pack.credits} {pack.credits === 1 ? 'Credit' : 'Credits'}
                </div>
                <Button variant="cosmic" className="w-full">
                  Buy Credits
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 text-left">
            {[
              {
                q: "What are Question Packs?",
                a: "Question Packs give you access to ask personalized astrology questions to our AI-powered Vedika. Each pack includes a specific number of questions that you can use within the validity period.",
              },
              {
                q: "How do I use my questions?",
                a: "You can ask Vedika any astrology-related questions through our chat interface. Questions can be about your career, relationships, health, finances, or any life aspect. Each question gets a detailed, personalized response based on your birth chart.",
              },
              {
                q: "Do questions expire?",
                a: "Yes, each pack has a validity period. Quick Ask (30 days), Deep Dive (60 days), and Power Pack (6 months). You must use your questions within this period.",
              },
              {
                q: "What's the difference between packs?",
                a: "Quick Ask gives you 5 questions for quick guidance (₹9.8/question). Deep Dive offers 15 questions with detailed analysis (₹6.6/question) - Best Value! Power Pack provides 30 questions with maximum value (₹6.6/question).",
              },
              {
                q: "Can I buy multiple packs?",
                a: "Yes! You can purchase multiple packs and they will be added to your account. Questions from different packs don't expire at the same time - each pack has its own validity period.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through Razorpay's secure payment gateway.",
              },
              {
                q: "Is there a money-back guarantee?",
                a: "Yes! We offer a 7-day money-back guarantee if you're not satisfied with our services. No questions asked. Simply contact our support team.",
              },
              {
                q: "Will I be charged GST?",
                a: "All prices displayed are inclusive of GST (18%) unless specified otherwise.",
              }
            ].map((faq, index) => (
              <div key={index} className="p-4 rounded-lg bg-card/60 border border-border/60">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
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
              <p className="text-sm text-muted-foreground mb-2">You got your credits!</p>
              <p className="text-lg font-semibold text-foreground">
                {selectedPlan}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Credits will be available within 24 hours
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

export default Pricing;