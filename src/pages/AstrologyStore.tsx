import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronDown, FlaskConical, MapPin, PackageCheck, Search, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import SEO from "@/components/SEO";

const product = {
  name: "Money Magnet Dhan Yog Bracelet",
  price: 999,
  mrp: 1999,
  reviews: 1612,
  image: "/store/dhan-yog-second-image.png",
  pagePath: "/dhan-yog-bracelet",
};

const productSlides = [
  { src: "/store/dhan-yog-second-image.png", alt: "Dhan Yog Bracelet product image with prosperity stones" },
  { src: "/store/dhan-yog-real-closeup.png", alt: "Dhan Yog Bracelet closeup beads with Tiger Eye and Pyrite" },
  { src: "/store/dhan-yog-male-hand.png", alt: "Money bracelet on male hand for daily wear" },
  { src: "/store/dhan-yog-female-hand.png", alt: "Female hand wearing Dhan Yog Bracelet" },
];

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Money Magnet Dhan Yog Bracelet",
  image: productSlides.map((slide) => `https://veadicastro.in${slide.src}`),
  description: "Buy Dhan Yog Bracelet made with Tiger's Eye, Pyrite, Citrine and Aventurine inspired stones. Free delivery across India.",
  brand: {
    "@type": "Brand",
    name: "Veadicastro",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1612",
  },
  offers: {
    "@type": "Offer",
    price: "999",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    url: "https://veadicastro.in/dhan-yog-bracelet",
  },
};

const AstrologyStore = () => {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const openProduct = () => navigate(product.pagePath);
  const scrollToProduct = () => document.getElementById("store-product")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToPurpose = () => document.getElementById("store-trust")?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % productSlides.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#171717]">
      <SEO
        title="Veadicastro Store - Astrology Related Products"
        description="Buy Dhan Yog Bracelet at Rs. 999. Tiger's Eye, Pyrite, Citrine and Aventurine. Free delivery all India. 1600+ buyers. Order now on Veadicastro."
        url="https://veadicastro.in/astrology-store"
        type="product"
        schema={productSchema}
      />

      <div className="bg-black px-4 py-2 text-center text-sm font-semibold text-white">
        Launch Offer - Extra 50% OFF on Money Bracelet
      </div>

      <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
            <img src="/optimized/logo.webp" alt="Veadicastro" className="h-9 w-9 rounded" />
            <span className="text-2xl font-semibold">Veadicastro Store</span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <button onClick={scrollToProduct} className="flex items-center gap-1">Products <ChevronDown className="h-4 w-4" /></button>
            <button onClick={scrollToPurpose} className="flex items-center gap-1">Shop By Purpose <ChevronDown className="h-4 w-4" /></button>
            <button onClick={openProduct}>Money Bracelet</button>
            <button onClick={openProduct}>Dhan Yog</button>
            <button onClick={() => setSupportOpen(true)}>Support</button>
          </nav>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5" />
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#efe1c8]">
        <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#7b3f22]">Money Magnet Bracelet</p>
            <h1 className="font-serif text-5xl leading-tight text-[#6f2d3d] md:text-7xl">
              Dhan Yog Money Bracelet for Wealth & Prosperity
            </h1>
            <div className="inline-flex rounded-full border border-[#6f2d3d]/50 px-8 py-4 text-3xl font-bold text-[#6f2d3d]">
              Rs. 999
            </div>
            <p className="max-w-md text-lg leading-relaxed text-[#4f3b2f]">
              A prosperity bracelet made with Tiger's Eye, Pyrite, Citrine and Aventurine for wealth attraction, focus, luck and stability.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#4f3b2f]">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2"><Truck className="h-4 w-4" /> Free Delivery</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2"><MapPin className="h-4 w-4" /> All India Shipping</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2"><FlaskConical className="h-4 w-4" /> Lab Tested</span>
            </div>
            <Button className="rounded-full bg-[#6f2d3d] px-10 py-6 text-lg font-semibold text-white hover:bg-[#5b2130]" onClick={openProduct}>
              Shop Now
            </Button>
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={openProduct} className="block cursor-pointer">
              <img src={product.image} alt="Dhan Yog Bracelet main product image for wealth and prosperity" className="pointer-events-none max-h-[520px] w-full max-w-[520px] rounded-3xl object-cover shadow-2xl" />
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-4xl">Money Bracelet</h2>
          <p className="mt-3 text-sm text-black/60">One focused product with free delivery, all-India shipping, and trusted quality checks.</p>
        </div>

        <div id="store-product" className="max-w-md scroll-mt-28 overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <button type="button" onClick={openProduct} className="block w-full text-left">
            <div className="relative aspect-square w-full overflow-hidden bg-[#f3f1ed]">
              {productSlides.map((slide, index) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === slideIndex ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {productSlides.map((slide, index) => (
                  <span key={slide.src} className={`h-1.5 rounded-full transition-all ${index === slideIndex ? "w-6 bg-white" : "w-1.5 bg-white/55"}`} />
                ))}
              </div>
            </div>
            <div className="p-5">
              <h3 className="mb-2 text-lg font-semibold">{product.name}</h3>
              <div className="mb-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1 text-sm text-black/60">{product.reviews} reviews</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">Rs. {product.price}</span>
                  <span className="text-sm text-black/40 line-through">Rs. {product.mrp}</span>
                </div>
                <span className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Add</span>
              </div>
            </div>
          </button>
        </div>

        <section className="mt-10 rounded-2xl bg-white p-7 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#6f2d3d]">Dhan Yog Bracelet Online</p>
          <h2 className="font-serif text-3xl leading-tight">Buy a money bracelet made for daily prosperity intention.</h2>
          <p className="mt-4 text-sm leading-relaxed text-black/65">
            Veadicastro Store helps you buy the Money Magnet Dhan Yog Bracelet online with clear product photos, stone-wise details, free delivery across India, and transparent checkout. This bracelet combines Tiger's Eye, Pyrite, Citrine, and Aventurine inspired stones for people who want a simple daily reminder for wealth, focus, confidence, and positive money decisions.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link to="/dhan-yog-bracelet" className="rounded-full bg-[#6f2d3d] px-4 py-2 text-white hover:bg-[#5b2130]">View Dhan Yog Bracelet</Link>
            <Link to="/today-horoscope" className="rounded-full border border-black/10 px-4 py-2 text-black hover:bg-black/5">Today Horoscope</Link>
            <Link to="/free-kundli-generator" className="rounded-full border border-black/10 px-4 py-2 text-black hover:bg-black/5">Free Kundli Generator</Link>
            <Link to="/free-ai-astrologer-chat" className="rounded-full border border-black/10 px-4 py-2 text-black hover:bg-black/5">Ask Vedika AI</Link>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl bg-white shadow-sm">
          <img
            src="/store/spiritual-crystal-charging-banner.png"
            alt="Spiritual crystal charging altar with gemstones and diya"
            className="h-[260px] w-full object-cover sm:h-[320px] lg:h-[380px]"
          />
          <p className="bg-[#171717] px-5 py-3 text-center text-sm font-semibold text-white">
            Sacred energy, mindful intention, and crystal-inspired prosperity for your daily path.
          </p>
        </section>

        <article className="mt-12 max-w-4xl text-base leading-8 text-black/75">
          <h2 className="font-serif text-4xl leading-tight text-[#171717]">Veadicastro Store for Astrology Products and Dhan Yog Bracelet</h2>
          <p className="mt-5">
            Veadicastro Store is created for people who want simple, authentic, and purpose-based astrology products online. Our main product right now is the Money Magnet Dhan Yog Bracelet, also known as a money bracelet or wealth bracelet. This bracelet is made for people who want to keep a daily spiritual reminder for money growth, better focus, confidence, business energy, and prosperity intention. We do not want to make the store confusing with too many random products. We keep the store focused, clear, and useful so every buyer can understand what they are ordering.
          </p>
          <p className="mt-5">
            Veadicastro is already known for Vedic astrology guidance, AI astrology tools, kundli insights, horoscope guidance, and spiritual support. The store is a natural part of that same mission. Many people ask us for simple remedies and products they can use in daily life. The Dhan Yog Bracelet is one such product. It is designed with stones traditionally connected with money energy, courage, opportunity, abundance, and luck. The bracelet includes Tiger's Eye, Pyrite, Citrine, and Aventurine inspired stones. These stones are popular among people searching for a pyrite bracelet for wealth, citrine bracelet for money, tiger eye bracelet for confidence, and aventurine bracelet for luck.
          </p>
          <p className="mt-5">
            We focus on authenticity because spiritual products should not be sold carelessly. Every Dhan Yog Bracelet goes through a quality check before dispatch. We check the finishing, bead arrangement, comfort, and overall look of the bracelet. We also do proper puja and spiritual energizing of every product before sending it to the customer. This is important because many buyers are not only buying a fashion accessory. They are buying a product connected with belief, intention, and spiritual discipline. Our goal is to send a bracelet that feels clean, positive, and ready for daily use.
          </p>
          <img
            src="/store/dhan-yog-real-closeup.png"
            alt="Closeup of Dhan Yog Bracelet real gemstone beads"
            className="my-8 w-full rounded-lg object-cover"
          />
          <p className="mt-5">
            The Dhan Yog Bracelet is priced at Rs. 999 as a launch offer because we want more people in India to try a quality astrology product without paying a very high amount. Many spiritual bracelets online are either too cheap with poor quality or too expensive without clear explanation. We are keeping the price simple. At Rs. 999, you get a carefully selected money bracelet, free delivery across India, product guidance, digital proof card support, and Veadicastro trust. The low launch price does not mean low quality. It means we are keeping our margin controlled during the launch period so more customers can experience the product.
          </p>
          <p className="mt-5">
            Our working process is simple. First, we select the bracelet design and stones based on the purpose of the product. For the Money Magnet Dhan Yog Bracelet, the purpose is wealth, prosperity, focus, confidence, and luck. Second, we check the product quality and make sure the bracelet is wearable for daily life. Third, we do puja and energizing for the bracelet. Fourth, after the order is placed, our support team contacts the buyer for final delivery details and helps with dispatch. This process keeps the order personal and trustworthy instead of making it feel like a random online purchase.
          </p>
          <p className="mt-5">
            The bracelet can be worn by students, business owners, working professionals, shopkeepers, creators, and anyone who wants a daily prosperity reminder. It is not a magic shortcut and we do not promise overnight money results. Vedic remedies and spiritual products work best when they are used with right intention, discipline, good decisions, and honest effort. The Dhan Yog Bracelet helps you stay connected with that intention. It can remind you to stay focused, take better money decisions, remain confident, and keep your energy positive.
          </p>
          <p className="mt-5">
            We also guide customers on care. You can wear the bracelet during work, business meetings, study, or daily activity. Remove it before bathing, swimming, washing clothes, or using harsh chemicals. Keep it in a clean and dry place when you are not wearing it. Friday morning or Thursday morning after bathing is considered a good time to start wearing a prosperity bracelet, but you can also wear it when your mind is calm and your intention is clear.
          </p>
          <img
            src="/store/dhan-yog-male-hand.png"
            alt="Dhan Yog money bracelet worn on hand for daily prosperity intention"
            className="my-8 w-full rounded-lg object-cover"
          />
          <p className="mt-5">
            Veadicastro Store is built for Indian customers who want astrology products with clear details, not confusing claims. We provide product images, stone-wise benefits, free shipping, all India delivery support, and simple checkout through Razorpay. After payment, our team contacts you within 24 hours for delivery confirmation. This makes the process easy for customers who want personal support before their product is dispatched.
          </p>
          <p className="mt-5">
            If you are searching online for buy Dhan Yog Bracelet, money bracelet online, pyrite bracelet for wealth, bracelet for prosperity, vastu money bracelet, or astrology bracelet in India, Veadicastro Store gives you a focused and trusted option. Our aim is not to sell hundreds of random items. Our aim is to create a small collection of astrology products that have a clear purpose and proper spiritual handling. The Money Magnet Dhan Yog Bracelet is the first step in that direction.
          </p>
          <p className="mt-5">
            You can also use Veadicastro's astrology tools along with the store. Generate your kundli, check today's horoscope, or ask Vedika AI for guidance before choosing a spiritual product. This makes Veadicastro different from a normal ecommerce store. We combine astrology knowledge, product quality, customer support, and spiritual intention in one place.
          </p>
        </article>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            [Truck, "Free Delivery", "No extra delivery charge on the Money Magnet Dhan Yog Bracelet."],
            [MapPin, "All India Shipping", "We deliver across India with careful packing for safe product handling."],
            [FlaskConical, "Lab Tested", "Bracelet materials go through lab-tested quality assurance before dispatch."],
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

        <section id="store-trust" className="mt-10 grid scroll-mt-28 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#6f2d3d]">Trusted Store</p>
            <h2 className="font-serif text-3xl leading-tight">Built for customers who want clarity before buying.</h2>
            <p className="mt-4 text-sm leading-relaxed text-black/65">
              Veadicastro Store keeps the buying experience simple: clear product photos, stone-wise benefits, wearing guidance, delivery support, and a digital proof card with every bracelet order.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                "Transparent product details before checkout",
                "Digital proof card included with order details",
                "Support for delivery and product questions",
                "Focused spiritual products selected for daily use",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-black/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, "Quality Checked", "Each bracelet is checked for finish, bead placement, and wearable comfort."],
              [PackageCheck, "Safe Packing", "Packed carefully so the bracelet reaches you clean and ready to wear."],
              [Star, "Customer Loved", `${product.reviews}+ reviews shown for social proof and confidence.`],
              [ShoppingBag, "Easy Store Flow", "Open the product, choose a pack, add details, and place your order simply."],
            ].map(([Icon, title, text]) => {
              const IconComp = Icon as typeof Truck;
              return (
                <div key={String(title)} className="rounded-2xl bg-white p-6 shadow-sm">
                  <IconComp className="mb-4 h-6 w-6 text-[#6f2d3d]" />
                  <h3 className="mb-2 font-semibold">{String(title)}</h3>
                  <p className="text-sm leading-relaxed text-black/60">{String(text)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl bg-[#171717] text-white">
          <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
            <div className="p-7 md:p-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#ffd36a]">Why Buy From Veadicastro</p>
              <h2 className="font-serif text-3xl leading-tight md:text-4xl">A focused astrology store with delivery, testing, and trust built in.</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
                The Money Magnet Dhan Yog Bracelet is presented with real product visuals, stone-wise benefits, care instructions, and a simple checkout experience for customers across India.
              </p>
              <Button className="mt-6 rounded-full bg-white px-8 text-black hover:bg-white/90" onClick={openProduct}>
                View Bracelet
              </Button>
            </div>
            <div className="grid grid-cols-2">
              <img src="/store/dhan-yog-male-hand.png" alt="Male hand wearing Money Magnet Dhan Yog Bracelet" className="h-full min-h-[260px] w-full object-cover" />
              <img src="/store/dhan-yog-female-hand.png" alt="Female hand wearing Money Magnet Dhan Yog Bracelet" className="h-full min-h-[260px] w-full object-cover" />
            </div>
          </div>
        </section>
      </main>

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

export default AstrologyStore;
