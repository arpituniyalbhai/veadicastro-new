import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronDown, Loader2, Minus, Plus, Search, ShieldCheck, ShoppingBag, Star, Tag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import SEO, { generateFAQSchema } from "@/components/SEO";

const gallery = [
  "/store/dhan-yog-second-image.webp",
  "/store/dhan-yog-bracelet-main.webp",
  "/store/dhan-yog-male-hand.webp",
  "/store/dhan-yog-female-hand.webp",
  "/store/dhan-yog-real-closeup.webp",
  "/store/dhan-yog-third-image.webp",
  "/store/dhan-yog-forth-image.webp",
  "/store/benefit.webp",
  "/store/digital-proof-card.svg",
];

const packs = [
  { id: "single", label: "Pack of 1", qty: 1, price: 499, note: "Launch price" },
  { id: "couple", label: "Pack of 2", qty: 2, price: 599, note: "Save Rs. 399" },
];

const coupons: Record<string, { label: string; discount: (amount: number) => number }> = {
  DHAN10: { label: "10% off applied", discount: (amount) => Math.round(amount * 0.1) },
  VEDIC100: { label: "Rs. 100 off applied", discount: () => 100 },
};

const productBenefits = [
  "Helps support wealth attraction and prosperity mindset",
  "Boosts focus for better money and career decisions",
  "Supports luck, confidence and positive energy",
  "Provides grounding and stability through daily wear",
  "Made with Tiger's Eye, Pyrite, Citrine and Aventurine inspired stones",
  "Includes digital proof card with order details and product note",
];

const stoneDetails = [
  ["Tiger's Eye", "Confidence, courage and sharper focus for financial decisions."],
  ["Pyrite", "Associated with opportunity, wealth attraction and success."],
  ["Citrine", "Known as a merchant stone for prosperity and abundance."],
  ["Aventurine", "Associated with luck, growth and positive money energy."],
];

const reviews = [
  ["Shivam Singh", "The bracelet looks premium and the proof card made the order feel more genuine."],
  ["Kavya Reddy", "I wear it daily during work. Subtle design, good finishing, and nice packaging."],
  ["Rohit Mehta", "The stone-wise benefits image and wearing guide helped me understand the product clearly."],
];

const imageAltText: Record<string, string> = {
  "/store/dhan-yog-second-image.webp": "Dhan Yog Bracelet main view with money magnet beads",
  "/store/dhan-yog-bracelet-main.webp": "Money Magnet Dhan Yog Bracelet product display",
  "/store/dhan-yog-male-hand.webp": "Male hand wearing Dhan Yog Bracelet for daily use",
  "/store/dhan-yog-female-hand.webp": "Female hand wearing Dhan Yog Bracelet",
  "/store/dhan-yog-real-closeup.webp": "Tiger Eye and Pyrite bead close-up on Dhan Yog Bracelet",
  "/store/dhan-yog-third-image.webp": "Dhan Yog Bracelet angled product photo",
  "/store/dhan-yog-forth-image.webp": "Gold spacer bead detail on Dhan Yog Bracelet",
  "/store/benefit.webp": "Dhan Yog Bracelet benefits card",
  "/store/digital-proof-card.svg": "Digital proof card included with Dhan Yog Bracelet",
};

const faqs = [
  {
    q: "Which hand should I wear the Dhan Yog Bracelet on?",
    a: "You can wear the Dhan Yog Bracelet on the wrist you use most comfortably for daily work. Many customers prefer the right hand for action and money decisions, while some prefer the left hand for receiving positive energy.",
  },
  {
    q: "Is the Dhan Yog Bracelet made with real stones?",
    a: "The bracelet is made with Tiger's Eye, Pyrite, Citrine and Aventurine inspired stones and goes through quality checks before dispatch. Product details and a digital proof card are included for clarity.",
  },
  {
    q: "Does the Pyrite bracelet work for money and wealth?",
    a: "Pyrite is traditionally associated with opportunity, confidence and prosperity intention. The bracelet should be used as a spiritual support and daily reminder, not as a guaranteed financial result.",
  },
  {
    q: "Is delivery available across India?",
    a: "Yes, Veadicastro Store offers free delivery across India for the Money Magnet Dhan Yog Bracelet.",
  },
  {
    q: "Is COD available for the Dhan Yog Bracelet?",
    a: "Currently checkout is handled through Razorpay prepaid payment. After successful payment, our support team contacts you within 24 hours to collect delivery details.",
  },
];

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Dhan Yog Bracelet for Money & Wealth",
  image: gallery.map((image) => `https://veadicastro.in${image}`),
  description: "Buy Dhan Yog Money Bracelet online with Tiger Eye, Pyrite, Citrine and Aventurine inspired stones. Free delivery across India.",
  brand: {
    "@type": "Brand",
    name: "Veadicastro",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1612",
  },
  review: reviews.map(([name, text]) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5",
      bestRating: "5",
    },
    reviewBody: text,
  })),
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "499",
    highPrice: "599",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    url: "https://veadicastro.in/dhan-yog-bracelet",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://veadicastro.in",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Astrology Store",
      item: "https://veadicastro.in/astrology-store",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Dhan Yog Bracelet",
      item: "https://veadicastro.in/dhan-yog-bracelet",
    },
  ],
};

type CartItem = {
  id: string;
  product: string;
  pack: string;
  quantity: number;
  price: number;
  total: number;
  originalTotal: number;
  coupon: string | null;
  discount: number;
  image: string;
  addedAt: string;
};

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
};

type RazorpayWindow = Window & {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
};

type OrderData = {
  orderId: string;
  amount: number;
  currency?: string;
  keyId: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const DhanYogBracelet = () => {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [selectedPack, setSelectedPack] = useState(packs[0]);
  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [buyer, setBuyer] = useState({ name: "", phone: "", location: "", pincode: "" });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const total = useMemo(() => selectedPack.price * quantity, [selectedPack, quantity]);
  const originalTotal = useMemo(() => selectedPack.qty * 999 * quantity, [selectedPack, quantity]);
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return Math.min(total - 1, coupons[appliedCoupon]?.discount(total) || 0);
  }, [appliedCoupon, total]);
  const payableTotal = total - discount;
  const savings = Math.max(0, originalTotal - payableTotal);
  const checkoutReady = Boolean(
    buyer.name.trim() &&
    buyer.phone.trim() &&
    buyer.location.trim() &&
    buyer.pincode.trim()
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => {
        const currentIndex = gallery.indexOf(current);
        return gallery[(currentIndex + 1) % gallery.length];
      });
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("veadicastro_store_cart") || "[]") as CartItem[]);
    } catch {
      setCart([]);
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem("veadicastro_store_cart", JSON.stringify(items));
  };

  const loadRazorpayScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if ((window as RazorpayWindow).Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load payment system. Please refresh and try again."));
      document.head.appendChild(script);
    });
  }, []);

  const cartItem = () => ({
    id: `cart-${Date.now()}`,
    product: "Money Magnet Dhan Yog Bracelet",
    pack: selectedPack.label,
    quantity,
    price: selectedPack.price,
    total: payableTotal,
    originalTotal: total,
    coupon: appliedCoupon || null,
    discount,
    image: activeImage,
    addedAt: new Date().toISOString(),
  });

  const addToCart = () => {
    const next = [...cart, cartItem()];
    saveCart(next);
    setCartMessage("Saved in cart.");
  };

  const showCheckout = () => {
    setCheckoutOpen(true);
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const applyCoupon = () => {
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) {
      setAppliedCoupon("");
      setCouponMessage("");
      return;
    }
    if (!coupons[normalized]) {
      setAppliedCoupon("");
      setCouponMessage("Invalid coupon code.");
      return;
    }
    setAppliedCoupon(normalized);
    setCouponMessage(coupons[normalized].label);
  };

  const savePaidOrder = (payment: RazorpayPaymentResponse) => {
    const order = {
      id: `VA-STORE-${Date.now()}`,
      ...cartItem(),
      buyer,
      paymentId: payment.razorpay_payment_id,
      orderId: payment.razorpay_order_id,
      status: "Payment successful - support follow-up pending",
    };
    const current = JSON.parse(localStorage.getItem("veadicastro_store_orders") || "[]");
    localStorage.setItem("veadicastro_store_orders", JSON.stringify([...current, order]));
    saveCart([]);
  };

  const openCheckout = async () => {
    if (!checkoutReady) return;

    setIsProcessingPayment(true);
    try {
      await loadRazorpayScript();
      const API_BASE = import.meta.env?.VITE_API_BASE || "";
      const planName = `Money Magnet Dhan Yog Bracelet - Pack of ${selectedPack.qty}`;
      const createOrderResponse = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: "INR",
          planName,
          promoCode: appliedCoupon || undefined,
        }),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create payment order.");
      }

      const orderData = (await createOrderResponse.json()) as OrderData;
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        order_id: orderData.orderId,
        name: "Veadicastro Store",
        description: planName,
        image: "https://veadicastro.in/optimized/logo.webp",
        prefill: {
          name: buyer.name,
          email: "",
          contact: buyer.phone,
        },
        notes: {
          product: "Money Magnet Dhan Yog Bracelet",
          pack: selectedPack.label,
          quantity: String(quantity),
          coupon: appliedCoupon || "",
          name: buyer.name,
          phone: buyer.phone,
          location: buyer.location,
          pincode: buyer.pincode,
        },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verifyResponse = await fetch(`${API_BASE}/api/razorpay/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName,
                amount: orderData.amount,
                userId: buyer.phone,
                email: null,
                displayName: buyer.name || buyer.phone,
                type: "store",
                deliveryDetails: {
                  name: buyer.name,
                  phone: buyer.phone,
                  location: buyer.location,
                  pincode: buyer.pincode,
                },
              }),
            });
            const verifyData = await verifyResponse.json().catch(() => ({}));
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }
            savePaidOrder(response);
            setCheckoutOpen(false);
            setSuccessOpen(true);
          } catch (error: unknown) {
            alert(`Payment verification failed: ${getErrorMessage(error, "Please contact support.")}`);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessingPayment(false),
        },
        theme: { color: "#6f2d3d" },
      };

      const Razorpay = (window as RazorpayWindow).Razorpay;
      if (!Razorpay) throw new Error("Payment system was not loaded. Please refresh and try again.");

      const razorpay = new Razorpay(options);
      razorpay.on("payment.failed", (response: RazorpayFailureResponse) => {
        alert(`Payment failed: ${response.error?.description || "Please try again."}`);
        setIsProcessingPayment(false);
      });
      razorpay.open();
    } catch (error: unknown) {
      alert(`Payment Error: ${getErrorMessage(error, "Please try again.")}`);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#171717]">
      <SEO
        title="Buy Dhan Yog Money Bracelet Online - Tiger Eye & Pyrite"
        description="Buy Dhan Yog Bracelet at Rs. 499. Tiger's Eye, Pyrite, Citrine and Aventurine inspired stones with free delivery all India and 1600+ buyer reviews."
        url="https://veadicastro.in/dhan-yog-bracelet"
        type="product"
        schema={[productSchema, generateFAQSchema(faqs), breadcrumbSchema]}
      />

      <div className="bg-black px-4 py-2 text-center text-sm font-semibold text-white">
        Launch Offer - Extra 10% OFF + Free Shipping
      </div>
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <button onClick={() => navigate("/astrology-store")} className="flex items-center gap-2">
            <img src="/optimized/logo.webp" alt="Veadicastro" className="h-9 w-9 rounded" />
            <span className="text-2xl font-semibold">Veadicastro Store</span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <button onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })} className="flex items-center gap-1">Products <ChevronDown className="h-4 w-4" /></button>
            <button onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}>Dhan Yog</button>
            <button onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}>Money Bracelet</button>
            <button onClick={() => setSupportOpen(true)}>Support</button>
          </nav>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5" />
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-black/55">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link to="/astrology-store" className="hover:text-black">Store</Link>
          <span>/</span>
          <span className="font-semibold text-black">Dhan Yog Bracelet</span>
        </nav>

        <Button variant="outline" size="sm" className="mb-8 gap-2 bg-white" onClick={() => navigate("/astrology-store")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Button>

        <section className="grid gap-10 lg:grid-cols-[0.95fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
              <img src={activeImage} alt={imageAltText[activeImage] || "Dhan Yog Bracelet product image"} className="aspect-square w-full rounded-xl bg-[#f3f1ed] object-contain" />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {gallery.map((image) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(image)}
                  className={`overflow-hidden rounded-xl border bg-white p-1 ${activeImage === image ? "border-[#6f2d3d]" : "border-black/10"}`}
                >
                  <img src={image} alt={imageAltText[image] || "Dhan Yog Bracelet thumbnail"} className="aspect-square w-full rounded-lg object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h1 className="font-serif text-4xl leading-tight md:text-5xl">Dhan Yog Bracelet for Money & Wealth | Veadicastro</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-black/60">1612 reviews</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#ffd36a] px-4 py-2 text-sm">Attracts wealth</span>
              <span className="rounded-full bg-[#dedcff] px-4 py-2 text-sm">Boosts focus</span>
              <span className="rounded-full bg-[#dff4df] px-4 py-2 text-sm">Supports luck</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl font-bold">Rs. {payableTotal}</span>
              <span className="text-xl text-black/35 line-through">Rs. {originalTotal.toLocaleString("en-IN")}</span>
              <span className="font-bold text-green-700">{appliedCoupon ? `${appliedCoupon} applied` : "Launch 10% OFF"}</span>
              <span className="rounded-full bg-[#6f2d3d] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Only 50 pieces left
              </span>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide">Select quantity</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {packs.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack)}
                    className={`relative rounded-xl border bg-white p-4 text-center ${selectedPack.id === pack.id ? "border-[#f3b338] bg-[#fff8e8]" : "border-black/15"}`}
                  >
                    {pack.id === "couple" && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#f3b338] px-3 py-1 text-[10px] font-bold">
                        Most Popular
                      </span>
                    )}
                    <p>{pack.label}</p>
                    <p className="text-2xl font-bold">Rs. {pack.price}</p>
                    <p className="text-xs text-green-700">{pack.note}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#f3b338] bg-[#fff8d8] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Launch Special Sale Offer</h3>
                  <p className="text-sm text-black/60">Digital proof card + free shipping included. Try coupon DHAN10 or VEDIC100.</p>
                </div>
                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">Save Rs. {savings}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <Label htmlFor="coupon-code" className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Tag className="h-4 w-4" />
                Coupon Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="DHAN10"
                  className="h-11 bg-white"
                />
                <Button variant="outline" className="h-11 bg-white" onClick={applyCoupon}>Apply</Button>
              </div>
              {couponMessage && (
                <p className={`mt-2 text-sm ${appliedCoupon ? "text-green-700" : "text-red-600"}`}>{couponMessage}</p>
              )}
              <div className="mt-3 grid gap-2 text-sm text-black/65">
                <div className="flex justify-between"><span>Subtotal</span><span>Rs. {total}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>- Rs. {discount}</span></div>
                <div className="flex justify-between border-t border-black/10 pt-2 font-bold text-black"><span>Payable</span><span>Rs. {payableTotal}</span></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center rounded-lg border border-black/15 bg-white">
                <button className="px-4" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center font-semibold">{quantity}</span>
                <button className="px-4" onClick={() => setQuantity((q) => q + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button variant="outline" className="h-12 bg-white" onClick={addToCart}>Add to Cart</Button>
              <Button className="h-12 bg-black px-8 font-bold text-white hover:bg-black/85" onClick={showCheckout}>
                Checkout - Rs. {payableTotal}
              </Button>
            </div>
            {cartMessage && <p className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800">{cartMessage}</p>}

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">
                  <ShoppingBag className="h-5 w-5" />
                  Saved Cart
                </h3>
                <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">{cart.length} item{cart.length === 1 ? "" : "s"}</span>
              </div>
              {cart.length ? (
                <div className="grid gap-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-xl border border-black/10 p-3">
                      <img src={item.image} alt={item.product} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.product}</p>
                        <p className="text-xs text-black/55">{item.pack} x {item.quantity}</p>
                        <p className="text-sm font-bold">Rs. {item.total}</p>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="h-9 w-9 rounded-lg border border-black/10 text-black/60 hover:text-red-600">
                        <Trash2 className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-[#f8f6f1] p-4 text-sm text-black/60">Your saved cart is empty. Add the bracelet to save it here.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-3xl">Money Bracelet Benefits</h2>
            <div className="grid gap-3">
              {productBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-sm leading-relaxed text-black/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-3xl">Best Day to Wear</h2>
            <p className="mb-4 text-sm leading-relaxed text-black/70">
              Best day: Friday morning or Thursday morning after bathing. You can wear it all day for work, business, study and daily activity.
            </p>
            <p className="text-sm leading-relaxed text-black/70">
              Care note: remove it before using the washroom, bathing, swimming, or washing clothes. Keep it in a clean dry place when not wearing it.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <img src="/store/money-bracelet-benefits.svg" alt="Benefits of Money Magnet Bracelet" className="w-full rounded-2xl bg-white shadow-sm" />
          <img src="/store/digital-proof-card.svg" alt="Digital proof card included" className="w-full rounded-2xl bg-white shadow-sm" />
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-serif text-3xl">Stone Wise Benefits</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {stoneDetails.map(([name, detail]) => (
              <div key={name} className="rounded-xl border border-black/10 p-4">
                <h3 className="mb-2 font-semibold">{name}</h3>
                <p className="text-sm leading-relaxed text-black/65">{detail}</p>
              </div>
            ))}
          </div>
          <img src="/store/stone-wise-benefits.svg" alt="Stone wise benefits for Money Magnet Bracelet" className="mt-8 w-full rounded-2xl border border-black/10" />
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            [Truck, "Free Shipping", "Free shipping across India on every order."],
            [ShieldCheck, "Why Veadicastro Store", "Focused spiritual products, transparent details, digital proof card and support after purchase."],
            [ShoppingBag, "Simple Checkout", "Add to cart, fill delivery details and save your order locally."],
          ].map(([Icon, title, text]) => {
            const IconComp = Icon as typeof Truck;
            return (
              <div key={String(title)} className="rounded-2xl bg-white p-6 shadow-sm">
                <IconComp className="mb-4 h-7 w-7 text-[#6f2d3d]" />
                <h3 className="mb-2 text-lg font-semibold">{String(title)}</h3>
                <p className="text-sm leading-relaxed text-black/60">{String(text)}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-serif text-3xl">Customer Reviews</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map(([name, text]) => (
              <div key={name} className="rounded-xl border border-black/10 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>
                <div className="mb-3 flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-3.5 w-3.5 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-black/65">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-3xl">How to Order Dhan Yog Bracelet Online</h2>
            <div className="grid gap-4 text-sm leading-relaxed text-black/70">
              <p>
                To buy the Dhan Yog Bracelet online, select your pack, apply a coupon if available, save it to cart, and continue to Razorpay checkout. After successful payment, Veadicastro support contacts you within 24 hours to collect delivery details and guide the dispatch process.
              </p>
              <p>
                This Money Magnet bracelet is made for customers looking for a simple wealth and prosperity bracelet with Tiger's Eye, Pyrite, Citrine, and Aventurine inspired stones. It can be worn during work, business, study, and daily activity as a spiritual reminder for focus, confidence, and positive money decisions.
              </p>
              <div className="flex flex-wrap gap-3 font-semibold">
                <Link to="/astrology-store" className="rounded-full border border-black/10 px-4 py-2 hover:bg-black/5">Back to Store</Link>
                <Link to="/today-horoscope" className="rounded-full border border-black/10 px-4 py-2 hover:bg-black/5">Today Horoscope</Link>
                <Link to="/free-ai-astrologer-chat" className="rounded-full border border-black/10 px-4 py-2 hover:bg-black/5">Ask Vedika AI</Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-3xl">Money Bracelet Buying Guide</h2>
            <div className="grid gap-3 text-sm leading-relaxed text-black/70">
              <p>
                A Dhan Yog money bracelet is usually selected for intention, daily discipline, and symbolic support for prosperity. Tiger's Eye is associated with courage and focus, Pyrite with opportunity, Citrine with abundance, and Aventurine with luck and growth.
              </p>
              <p>
                For best use, wear the bracelet on a clean wrist and avoid wearing it while bathing, swimming, washing clothes, or using harsh chemicals. Keep it in a clean dry place when not wearing it.
              </p>
              <p>
                You can explore more Vedic astrology guidance in the <Link to="/blog" className="font-semibold text-[#6f2d3d] hover:underline">Veadicastro astrology blog</Link> or generate your <Link to="/free-kundli-generator" className="font-semibold text-[#6f2d3d] hover:underline">free kundli</Link> before choosing spiritual products.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-serif text-3xl">Dhan Yog Bracelet FAQs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-black/10 p-4">
                <h3 className="mb-2 font-semibold">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-black/65">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="left-0 top-0 h-[100dvh] max-h-[100dvh] max-w-none translate-x-0 translate-y-0 overflow-y-auto border-0 bg-[#f8f6f1] p-0 text-[#171717] shadow-2xl sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:overflow-y-auto sm:rounded-lg sm:border sm:border-black/10 sm:p-6">
          <div className="min-h-full px-5 pb-14 pt-8 sm:min-h-0 sm:px-0 sm:pb-0 sm:pt-0">
            <DialogTitle className="pr-10 font-serif text-2xl text-[#6f2d3d]">Reserve Your Dhan Yog Bracelet</DialogTitle>
            <DialogDescription className="mt-4 text-base leading-relaxed text-black/65 sm:mt-0">
              Please enter your delivery contact details in this step. The Dhan Yog Bracelet is a rare spiritual product, so after payment our support team will contact you within 24 hours to confirm dispatch, care guidance, and final delivery support.
            </DialogDescription>
            <div className="mt-5 grid gap-4 sm:mt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-name-popup">Name</Label>
                  <Input id="store-name-popup" className="bg-white" value={buyer.name} onChange={(e) => setBuyer((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-phone-popup">Phone Number</Label>
                  <Input id="store-phone-popup" className="bg-white" value={buyer.phone} onChange={(e) => setBuyer((prev) => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-location-popup">Location</Label>
                  <Input id="store-location-popup" className="bg-white" value={buyer.location} onChange={(e) => setBuyer((prev) => ({ ...prev, location: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-pincode-popup">Pin Code</Label>
                  <Input id="store-pincode-popup" className="bg-white" value={buyer.pincode} onChange={(e) => setBuyer((prev) => ({ ...prev, pincode: e.target.value }))} />
                </div>
                <p className="text-xs text-black/55 sm:col-span-2">Name, location, phone number, and pin code are required for reservation.</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 text-sm">
                <span>Total payable</span>
                <span className="text-lg font-bold">Rs. {payableTotal}</span>
              </div>
              <div className="flex gap-3 pb-[env(safe-area-inset-bottom)]">
                <Button variant="outline" className="flex-1 bg-white" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                <Button disabled={!checkoutReady || isProcessingPayment} className="flex-1 bg-[#6f2d3d] text-white hover:bg-[#5b2130]" onClick={openCheckout}>
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening Razorpay
                    </>
                  ) : (
                    "Continue to Razorpay"
                  )}
                </Button>
              </div>
              <div className="rounded-xl border border-[#f3b338]/40 bg-white p-4 text-sm leading-relaxed text-black/70">
                Your payment opens securely through Razorpay. These details are saved with your store order in Firestore so the support team can contact you quickly.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="text-center sm:max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-700" />
          </div>
          <DialogTitle className="text-2xl">Payment Successful</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Your support team contact you within 24 hour, where you can gave delivery details.
          </DialogDescription>
          <Button className="bg-black text-white hover:bg-black/85" onClick={() => setSuccessOpen(false)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="text-center sm:max-w-md">
          <DialogTitle>Store Support</DialogTitle>
          <DialogDescription className="text-base">
            For product, payment, or delivery help, email us at{" "}
            <a href="mailto:support@veadicastro.in" className="font-semibold text-[#6f2d3d] hover:underline">
              support@veadicastro.in
            </a>
          </DialogDescription>
          <Button className="bg-black text-white hover:bg-black/85" onClick={() => setSupportOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DhanYogBracelet;
