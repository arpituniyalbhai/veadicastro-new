import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Star,
  XCircle,
  Flame,
  Lock,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Phone,
  User,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const reportPlans = [
  {
    name: "Basic Personalized Report",
    price: "₹999",
    originalPrice: "₹1499",
    pages: "10-15 pages",
    delivery: "24-48 hours",
    description: "Ideal starting point for clear guidance on key life areas.",
    features: ["Career & Finance", "Relationship Insights", "Current Dasha Analysis", "Personalized Remedies", "Lucky Periods"],
  },
  {
    name: "Deep Life Analysis",
    price: "₹1999",
    originalPrice: "₹3499",
    pages: "25-35 pages",
    delivery: "24-48 hours",
    description: "Our best-seller. A complete life blueprint — the most chosen plan.",
    highlighted: true,
    features: [
      "Complete Life Blueprint",
      "Yearly Timeline & Forecast",
      "Marriage Timing",
      "Wealth & Money Periods",
      "Business & Career Roadmap",
      "Strengths & Weaknesses",
      "Detailed Remedies",
      "Lucky Periods & Colors",
    ],
  },
  {
    name: "Premium Expert Guidance",
    price: "₹3999",
    originalPrice: "₹5999",
    pages: "40+ pages + voice note",
    delivery: "Priority delivery",
    description: "High-touch guidance with expert review, support & personal consultation.",
    features: [
      "Expert Astrologer Review",
      "Priority Delivery",
      "WhatsApp Support",
      "Custom Remedies",
      "15 Min Consultation",
    ],
  },
  {
    name: "कर्म चक्र: गहरा कर्म विश्लेषण",
    nameEn: "Karma Chakra",
    price: "₹9999",
    pages: "60+ pages",
    delivery: "72 hours",
    description: "This is not an AI-generated astrology PDF. Every page is manually prepared specifically for your birth chart.",
    ultra: true,
    features: [
      "कर्मों का फल रिपोर्ट (हिंदी में)",
      "Dual Astrologer Analysis (2 experts on your chart)",
      "Complete Karma & Past Life Patterns",
      "Detailed Dasha Breakdown (next 20 years)",
      "Marriage · Wealth · Career Deep Dive",
      "Soul Purpose & Dharma Path",
      "Rare Yoga & Dosha Analysis",
      "Custom Remedies + Mantra Prescription",
      "Unlimited Discussion Session with Assigned Astrologer",
      "Priority WhatsApp Support (30 days)",
      "Voice Note Summary by Lead Astrologer",
    ],
  },
];

const astrologers = [
  {
    initials: "AU",
    name: "Pt. Aman Uniyal",
    title: "Senior Vedic Astrologer",
    exp: "22 years",
    city: "Haridwar",
    specs: ["Kundali Reading", "Marriage Timing", "Career Guidance"],
    charts: "5,000+",
    rating: "4.9",
    photo: "/amanuniyalastrologe.webp",
  },
  {
    initials: "PJ",
    name: "Pt. Prakash Joshi",
    title: "Jyotish Acharya",
    exp: "18 years",
    city: "Varanasi",
    specs: ["Dasha Analysis", "Wealth Periods", "Remedies"],
    charts: "3,200+",
    rating: "4.8",
    photo: null,
  },
  {
    initials: "RS",
    name: "Pt. Ramesh Sharma",
    title: "Vedic Jyotish Pandit",
    exp: "15 years",
    city: "Ujjain",
    specs: ["Transit Predictions", "Navamsa Chart", "Spiritual Guidance"],
    charts: "2,800+",
    rating: "4.8",
    photo: null,
  },
];

const processSteps = [
  {
    step: "01",
    title: "Fill Your Details",
    desc: "Share your DOB, exact birth time, birth place, and main concern. Takes 2 minutes.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Astrologer Studies Your Chart",
    desc: "Your assigned astrologer personally analyzes your birth chart, dashas, transits and planetary combinations.",
    icon: BookOpen,
  },
  {
    step: "03",
    title: "Report Delivered Directly to You",
    desc: "Your fully personalized report lands in your email within 24–48 hrs — prepared and signed by the astrologer.",
    icon: Mail,
  },
];

const karmaValueBlocks = [
  {
    title: "3 Days of Manual Analysis",
    text: "Two senior astrologers manually study your kundli, dashas, karmic patterns, yogas, and life timing.",
    icon: Clock,
  },
  {
    title: "Not Template-Based",
    text: "Every page is written specifically for your birth chart. No copy-paste predictions.",
    icon: FileText,
  },
  {
    title: "Deep Karmic Analysis",
    text: "Includes karma patterns, spiritual lessons, destiny cycles, and rare yogas not covered in normal reports.",
    icon: ShieldCheck,
  },
  {
    title: "Personal Guidance Included",
    text: "Includes astrologer support, remedies, and voice explanation for clarity.",
    icon: MessageCircle,
  },
];

const reportInsideItems = [
  "Career & Business Timing",
  "Marriage & Relationship Analysis",
  "Wealth Periods & Financial Growth",
  "Karmic Patterns & Spiritual Lessons",
  "Rare Yogas & Doshas",
  "Detailed Remedies & Mantras",
  "20-Year Dasha Timeline",
];

const comparisonRows = [
  ["Auto generated instantly", "Personally prepared by astrologer"],
  ["Generic predictions", "Deep personalized analysis"],
  ["No astrologer review", "Expert reviewed before delivery"],
  ["Basic surface insights", "Detailed life guidance & timing"],
  ["Same template for everyone", "Customized for your exact chart"],
];

const testimonials = [
  { name: "Rahul S.", location: "Delhi", quote: "I expected a normal astrology PDF, but this felt deeply personal. The career and relationship timing matched my real situation surprisingly well.", rating: 5, initials: "RS" },
  { name: "Priya M.", location: "Mumbai", quote: "The report was detailed and easy to understand. It felt like someone actually studied my chart instead of generating generic predictions.", rating: 5, initials: "PM" },
  { name: "Ankit R.", location: "Bangalore", quote: "The remedies section was my favorite part. It didn't feel copy-pasted like every other astrology report online.", rating: 5, initials: "AR" },
  { name: "Sneha K.", location: "Pune", quote: "I was confused about career and finances. The Deep Life Analysis gave me real clarity and confidence about my next steps.", rating: 5, initials: "SK" },
  { name: "Harsh V.", location: "Jaipur", quote: "You can clearly feel the difference between instant AI reports and this expert-prepared analysis. Worth every rupee.", rating: 5, initials: "HV" },
  { name: "Meera T.", location: "Hyderabad", quote: "Ordered for marriage timing analysis. The astrologer's insight was spot on. Highly recommend the Premium plan.", rating: 5, initials: "MT" },
];

const faqs = [
  { q: "Is this an AI-generated report?", a: "No. Every report is personally prepared and reviewed by an expert Vedic astrologer. Technology may assist with formatting and research, but the final analysis is human-reviewed and fully customized for your chart." },
  { q: "How is the report delivered?", a: "Your report is prepared directly by an assigned astrologer and delivered to your email inbox. It is not an automated PDF — it is a personally written document with your name and chart details." },
  { q: "How long does delivery take?", a: "Most reports are delivered within 24-48 hours. Premium plans receive priority delivery." },
  { q: "What details do I need to provide?", a: "You need your date of birth, exact birth time, birth place, your gender, contact number, and your main concern or question." },
  { q: "Why does the report take time to prepare?", a: "Because astrologers manually analyze your birth chart, planetary combinations, dashas, transits, remedies, and life timing before preparing your final report. No shortcuts." },
  { q: "What if my birth time is not accurate?", a: "Astrology accuracy depends heavily on correct birth details. Even a 10-minute difference can affect accuracy. Provide the most accurate time available." },
  { q: "Are refunds available?", a: "Because reports are manually prepared and personalized, refunds are not available once work has started. Please ensure your birth details are accurate before ordering." },
  { q: "How is this different from free astrology websites?", a: "Free websites generate instant automated reports using templates. Veadicastro reports are manually reviewed, deeply personalized, and focused on practical life guidance — not generic predictions." },
];

// ─── Form Modal ───────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  phone: string;
  email: string;
  concern: string;
}

interface ReportFormModalProps {
  planName: string;
  amount: string;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const ReportFormModal = ({ planName, amount, onClose, onSubmit }: ReportFormModalProps) => {
  const [form, setForm] = useState<FormData>({
    name: "", dob: "", birthTime: "", birthPlace: "", gender: "", phone: "", email: "", concern: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.dob) e.dob = "Date of birth is required";
    if (!form.birthTime) e.birthTime = "Exact birth time is required";
    if (!form.birthPlace.trim()) e.birthPlace = "Birth place is required";
    if (!form.gender) e.gender = "Please select gender";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Valid 10-digit number required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(form);
  };

  const field = (label: string, icon: any, key: keyof FormData, type = "text", placeholder = "") => {
    const Icon = icon;
    return (
      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "13px", color: "#aaa", display: "block", marginBottom: "6px" }}>{label}</label>
        <div style={{ position: "relative" }}>
          <Icon size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#555" }} />
          <input
            type={type}
            placeholder={placeholder || label}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            style={{
              width: "100%",
              background: "#111",
              border: errors[key] ? "1px solid #ff4444" : "1px solid #222",
              borderRadius: "8px",
              padding: "10px 12px 10px 36px",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        {errors[key] && <p style={{ fontSize: "11px", color: "#ff6666", marginTop: "4px" }}>{errors[key]}</p>}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid #d9277a33",
          borderRadius: "20px",
          padding: "28px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#555", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-block", background: "#d9277a15", border: "1px solid #d9277a44",
              borderRadius: "20px", padding: "4px 14px", fontSize: "12px", color: "#d9277a", marginBottom: "10px",
            }}
          >
            {planName}
          </div>
          <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 6px" }}>Fill Your Birth Details</h2>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
            Your astrologer needs these details to prepare a 100% personalized report. Report will be delivered directly to your email.
          </p>
        </div>

        {/* Name */}
        {field("Full Name", User, "name", "text", "Your full name")}

        {/* DOB + Time in a row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "13px", color: "#aaa", display: "block", marginBottom: "6px" }}>Date of Birth</label>
            <div style={{ position: "relative" }}>
              <Calendar size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#555" }} />
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                style={{
                  width: "100%", background: "#111",
                  border: errors.dob ? "1px solid #ff4444" : "1px solid #222",
                  borderRadius: "8px", padding: "10px 12px 10px 36px",
                  color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            {errors.dob && <p style={{ fontSize: "11px", color: "#ff6666", marginTop: "4px" }}>{errors.dob}</p>}
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#aaa", display: "block", marginBottom: "6px" }}>
              Exact Birth Time <span style={{ color: "#d9277a", fontSize: "11px" }}>*important</span>
            </label>
            <div style={{ position: "relative" }}>
              <Clock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#555" }} />
              <input
                type="time"
                value={form.birthTime}
                onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                style={{
                  width: "100%", background: "#111",
                  border: errors.birthTime ? "1px solid #ff4444" : "1px solid #222",
                  borderRadius: "8px", padding: "10px 12px 10px 36px",
                  color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            {errors.birthTime && <p style={{ fontSize: "11px", color: "#ff6666", marginTop: "4px" }}>{errors.birthTime}</p>}
          </div>
        </div>

        {/* Birth Place */}
        <div style={{ margin: "16px 0" }}>
          {field("Birth Place (City, State)", MapPin, "birthPlace", "text", "e.g. Lucknow, Uttar Pradesh")}
        </div>

        {/* Gender */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", color: "#aaa", display: "block", marginBottom: "8px" }}>Gender</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {["Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                onClick={() => setForm({ ...form, gender: g })}
                style={{
                  flex: 1, padding: "9px", borderRadius: "8px", fontSize: "13px", cursor: "pointer",
                  background: form.gender === g ? "#d9277a22" : "#111",
                  border: form.gender === g ? "1px solid #d9277a" : "1px solid #222",
                  color: form.gender === g ? "#d9277a" : "#888",
                  fontWeight: form.gender === g ? 700 : 400,
                }}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && <p style={{ fontSize: "11px", color: "#ff6666", marginTop: "4px" }}>{errors.gender}</p>}
        </div>

        {/* Phone */}
        {field("WhatsApp Number", Phone, "phone", "tel", "10-digit mobile number")}

        {/* Email */}
        {field("Email (report will be sent here)", Mail, "email", "email", "your@email.com")}

        {/* Main concern */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", color: "#aaa", display: "block", marginBottom: "6px" }}>
            Main Concern / Question <span style={{ color: "#555" }}>(optional)</span>
          </label>
          <textarea
            placeholder="e.g. When will I get married? Is my career on the right path?"
            value={form.concern}
            onChange={(e) => setForm({ ...form, concern: e.target.value })}
            rows={3}
            style={{
              width: "100%", background: "#111", border: "1px solid #222",
              borderRadius: "8px", padding: "10px 12px", color: "#fff",
              fontSize: "14px", outline: "none", resize: "none", boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            background: "#0d0005", border: "1px solid #d9277a22",
            borderRadius: "10px", padding: "12px 14px", marginBottom: "20px",
            fontSize: "12px", color: "#888", lineHeight: 1.6,
          }}
        >
          ✦ Your report will be <strong style={{ color: "#d9277a" }}>personally prepared by an expert astrologer</strong> and delivered directly to your email within 24–48 hours. Your details are private and never shared.
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: "100%", background: "#d9277a", border: "none", borderRadius: "10px",
            padding: "14px", color: "#fff", fontSize: "16px", fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          Proceed to Payment — {amount}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DeepReports = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [slotsLeft] = useState(4);
  const [formModal, setFormModal] = useState<{ planName: string; amount: string } | null>(null);

  // Open form modal instead of directly navigating
  const startReport = (planName: string, amount: string) => {
    setFormModal({ planName, amount });
  };

  // After form submit → save details to localStorage → redirect to payment
  const handleFormSubmit = (data: FormData) => {
    try {
      localStorage.setItem("report_order_details", JSON.stringify(data));
    } catch {}
    const numericAmount = formModal!.amount.replace(/[^0-9]/g, "");
    navigate(
      `/pricing/onboarding?plan=${encodeURIComponent(formModal!.planName)}&amount=${numericAmount}&type=report`
    );
    setFormModal(null);
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Veadicastro Deep Reports",
    description: "Personalized Vedic astrology reports prepared and reviewed by expert astrologers.",
    brand: { "@type": "Brand", name: "Veadicastro" },
    offers: reportPlans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price.replace(/[^0-9]/g, ""),
      priceCurrency: "INR",
      availability: "https://schema.org/LimitedAvailability",
    })),
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:py-10 lg:px-6" style={{ background: "#000000" }}>
      <SEO
        title="Deep Reports - Veadicastro Expert Astrology Reports"
        description="Personally prepared Vedic astrology reports reviewed by expert astrologers. Choose Basic, Deep Life Analysis, or Premium Expert Guidance."
        keywords={["vedic astrology report", "expert astrology report", "personalized kundli report", "deep life analysis", "astrology remedies"]}
        url="https://veadicastro.in/deep-reports"
        schema={schema}
      />

      {/* Form Modal */}
      {formModal && (
        <ReportFormModal
          planName={formModal.planName}
          amount={formModal.amount}
          onClose={() => setFormModal(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0;transform:translateY(8px);} to {opacity:1;transform:translateY(0);} }
        .plan-card:hover { transform: translateY(-4px); transition: transform 0.3s ease; }
        .btn-primary { background:#d9277a;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.2s ease;display:inline-flex;align-items:center;gap:8px; }
        .btn-primary:hover { background:#c01f6a;transform:translateY(-1px); }
        .btn-outline { background:transparent;color:#d9277a;border:1.5px solid #d9277a55;border-radius:10px;padding:14px 28px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s ease;display:inline-flex;align-items:center;gap:8px; }
        .btn-outline:hover { border-color:#d9277a;background:#d9277a11; }
        .section-title { font-size:clamp(26px,4vw,38px);font-weight:700;color:#fff;line-height:1.25; }
        .section-sub { font-size:16px;color:#888;margin-top:8px; }
        .pink { color:#d9277a; }
        .card-dark { background:#0a0a0a;border:1px solid #1e1e1e;border-radius:16px;padding:24px; }
        .card-pink-border { background:#0a0a0a;border:1px solid #d9277a44;border-radius:16px;padding:24px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Back button */}
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "transparent", border: "1px solid #222", borderRadius: "8px", color: "#888", padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>

        {/* Social proof bar */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", flexWrap: "wrap", marginBottom: "40px" }}>
          {[
            { val: "95+", label: "Reports Delivered" },
            { val: "4.9★", label: "Average Rating" },
            { val: "3", label: "Expert Astrologers" },
            { val: "48hr", label: "Max Delivery Time" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#d9277a" }}>{item.val}</div>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Hero */}
        <section style={{ marginBottom: "64px" }}>
          <div style={{ background: "linear-gradient(135deg,#0d0d0d 0%,#110008 100%)", border: "1px solid #d9277a22", borderRadius: "24px", padding: "clamp(32px,5vw,64px)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", background: "radial-gradient(circle,#d9277a18 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-block", background: "#d9277a15", border: "1px solid #d9277a44", borderRadius: "20px", padding: "6px 16px", fontSize: "13px", color: "#d9277a", marginBottom: "20px", fontWeight: 600 }}>
                ✦ Personally Prepared · Directly Delivered by Your Astrologer
              </div>
              <h1 style={{ fontSize: "clamp(30px,5vw,54px)", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "20px", maxWidth: "700px" }}>
                Your Birth Chart Holds Answers You Haven't Found Yet
              </h1>
              <p style={{ fontSize: "17px", color: "#aaa", lineHeight: 1.7, maxWidth: "580px", marginBottom: "32px" }}>
                Get a deeply personal Vedic astrology report — career, marriage timing, wealth periods, and remedies — written and delivered directly by one of our 3 expert astrologers.
              </p>
              <p style={{ fontSize: "15px", color: "#e5e5e5", lineHeight: 1.7, maxWidth: "620px", marginBottom: "24px", background: "#111", border: "1px solid #d9277a33", borderRadius: "10px", padding: "12px 14px" }}>
                This is not an AI-generated astrology PDF. Every page is manually prepared specifically for your birth chart.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1a0000", border: "1px solid #ff444433", borderRadius: "8px", padding: "10px 16px", marginBottom: "28px", fontSize: "14px", color: "#ff7777" }}>
                <Flame size={15} />
                Only <strong style={{ color: "#ff4444" }}>{slotsLeft} manual report slots</strong> available this week
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => startReport("Deep Life Analysis", "₹1999")}>
                  Get My Deep Life Analysis <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Astrologers */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">Meet Your Astrologers</h2>
            <p className="section-sub">Your report will be personally prepared and delivered by one of these experts.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px" }}>
            {astrologers.map((a) => (
              <div key={a.name} className="card-pink-border">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  {a.photo ? (
                    <img src={a.photo} alt={a.name} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #d9277a44" }} />
                  ) : (
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg,#d9277a33,#d9277a11)", border: "2px solid #d9277a44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, color: "#d9277a", flexShrink: 0 }}>
                      {a.initials}
                    </div>
                  )}
                  <div>
                    <h3 style={{ color: "#fff", fontSize: "17px", fontWeight: 700, margin: "0 0 2px" }}>{a.name}</h3>
                    <p style={{ color: "#d9277a", fontSize: "12px", margin: "0 0 2px" }}>{a.title}</p>
                    <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>{a.city} · {a.exp} experience</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                  {a.specs.map((s) => (
                    <span key={s} style={{ background: "#d9277a12", border: "1px solid #d9277a33", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", color: "#d9277a" }}>{s}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>{a.charts}</div>
                    <div style={{ fontSize: "11px", color: "#555" }}>Charts Analyzed</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#d9277a" }}>{a.rating}★</div>
                    <div style={{ fontSize: "11px", color: "#555" }}>Rating</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#444" }}>
            ✦ Your report is assigned to and directly delivered by one of these astrologers — not auto-generated
          </p>
        </section>

        {/* Real Proof Screenshots */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">Real People. Real Results.</h2>
            <p className="section-sub">We sent a report — here's what happened next.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "24px", alignItems: "start" }}>
            <div className="card-dark" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={15} style={{ color: "#d9277a" }} />
                <span style={{ fontSize: "13px", color: "#888" }}>Email we sent to the user</span>
              </div>
              <img src="/deep-reports-image/reviews.webp" alt="Veadicastro report delivery email" style={{ width: "100%", display: "block" }} />
            </div>
            <div className="card-dark" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageCircle size={15} style={{ color: "#22c55e" }} />
                <span style={{ fontSize: "13px", color: "#888" }}>User's honest reply after receiving report</span>
              </div>
              <img src="/deep-reports-image/user-reply.webp" alt="User honest reply after receiving Veadicastro report" style={{ width: "100%", display: "block" }} />
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#555", fontStyle: "italic" }}>
            Real screenshots · Not staged · Shared with user permission
          </p>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">3 simple steps. Report delivered directly to your inbox within 48 hours.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px" }}>
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="card-dark" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", fontWeight: 800, color: "#d9277a11", lineHeight: 1, marginBottom: "12px" }}>{step.step}</div>
                  <div style={{ width: "48px", height: "48px", background: "#d9277a15", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#d9277a" }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>{step.title}</h3>
                  <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why Karma Chakra costs 9999 */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">How These Reports Are Different</h2>
            <p className="section-sub">This is not an AI-generated astrology PDF. Every page is manually prepared specifically for your birth chart.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "18px" }}>
            {karmaValueBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <div key={block.title} className="card-pink-border">
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#d9277a15", display: "flex", alignItems: "center", justifyContent: "center", color: "#d9277a", marginBottom: "14px" }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ color: "#fff", fontSize: "17px", fontWeight: 700, margin: "0 0 10px" }}>{block.title}</h3>
                  <p style={{ color: "#777", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{block.text}</p>
                </div>
              );
            })}
          </div>
          <p style={{ textAlign: "center", margin: "24px auto 0", fontSize: "15px", color: "#e5e5e5", maxWidth: "720px", lineHeight: 1.7 }}>
            Because every Karma Chakra report is manually prepared, only limited reports are accepted each week.
          </p>
        </section>

        {/* Report contents */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "28px", alignItems: "center" }}>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div style={{ position: "absolute", inset: "14% 6%", background: "radial-gradient(circle,#d9277a24,transparent 70%)", filter: "blur(24px)", pointerEvents: "none" }} />
              <img
                src="/deep-reports-image/karma-chakra-horoscope.png"
                alt="Karma Chakra horoscope wheel"
                style={{ position: "relative", width: "100%", maxHeight: "420px", objectFit: "contain", display: "block" }}
              />
            </div>
            <div>
              <h2 className="section-title">What's Inside The Report</h2>
              <p className="section-sub" style={{ marginBottom: "22px" }}>
                This is not an AI-generated astrology PDF. Every page is manually prepared specifically for your birth chart.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "10px" }}>
                {reportInsideItems.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "12px" }}>
                    <CheckCircle2 size={15} style={{ color: "#22c55e", flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: "#ccc", fontSize: "14px", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">Choose Your Report</h2>
            <p className="section-sub">Each plan is personally prepared and delivered directly by an expert astrologer.</p>
            <p style={{ color: "#e5e5e5", fontSize: "14px", marginTop: "10px" }}>
              This is not an AI-generated astrology PDF. Every page is manually prepared specifically for your birth chart.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px" }}>
            {reportPlans.map((plan) => (
              <div
                key={plan.name}
                className="plan-card"
                style={{
                  background: plan.highlighted ? "#0d0005" : "#0a0a0a",
                  border: plan.highlighted ? "1.5px solid #d9277a66" : "1px solid #1e1e1e",
                  borderRadius: "20px", padding: "28px", position: "relative",
                  display: "flex", flexDirection: "column",
                  boxShadow: plan.highlighted ? "0 0 40px #d9277a18" : "none",
                }}
              >
                {plan.highlighted && (
                  <div style={{ position: "absolute", top: "-13px", left: "24px", background: "#d9277a", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "4px 14px", borderRadius: "20px" }}>
                    ✦ BEST SELLER
                  </div>
                )}
                <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>{plan.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 800, color: "#d9277a" }}>{plan.price}</span>
                  {plan.originalPrice && <span style={{ fontSize: "16px", color: "#444", textDecoration: "line-through" }}>{plan.originalPrice}</span>}
                  {plan.ultra && <span style={{ fontSize: "12px", color: "#f7d56b", border: "1px solid #f7d56b55", borderRadius: "20px", padding: "4px 10px", fontWeight: 700 }}>Launch Price</span>}
                </div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>{plan.pages}</span>
                  <span style={{ fontSize: "12px", color: "#555" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#555" }}>{plan.delivery}</span>
                </div>
                <p style={{ color: "#777", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>{plan.description}</p>

                {/* Direct delivery badge */}
                <div style={{ background: "#0d1a0d", border: "1px solid #22c55e33", borderRadius: "8px", padding: "8px 12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={13} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#22c55e" }}>Delivered directly to your email by your astrologer</span>
                </div>

                <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px", marginBottom: "20px", flex: 1 }}>
                  <p style={{ fontSize: "12px", color: "#555", marginBottom: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>What's included</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#aaa" }}>
                        <CheckCircle2 size={13} style={{ color: "#22c55e", flexShrink: 0, marginTop: "2px" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className={plan.highlighted ? "btn-primary" : "btn-outline"}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => startReport(plan.name, plan.price)}
                >
                  {plan.highlighted ? "Get This Report →" : "Select Plan"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">Why People Choose Veadicastro</h2>
          </div>
          <div className="card-dark" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#111", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#666", borderRight: "1px solid #1a1a1a" }}>Generic AI Reports</div>
              <div style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#d9277a" }}>Veadicastro Expert Reports</div>
            </div>
            {comparisonRows.map(([generic, expert], i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: i < comparisonRows.length - 1 ? "1px solid #111" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "14px 20px", fontSize: "13px", color: "#555", borderRight: "1px solid #111" }}>
                  <XCircle size={14} style={{ color: "#ff4444", flexShrink: 0, marginTop: "2px" }} /> {generic}
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "14px 20px", fontSize: "13px", color: "#ccc" }}>
                  <CheckCircle2 size={14} style={{ color: "#22c55e", flexShrink: 0, marginTop: "2px" }} /> {expert}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-sub">95+ reports delivered. Here's what people felt.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px" }}>
            {testimonials.map((t) => (
              <div key={t.name} className="card-dark">
                <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={13} style={{ color: "#d9277a", fill: "#d9277a" }} />
                  ))}
                </div>
                <p style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.7, marginBottom: "16px" }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#d9277a18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#d9277a", flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#fff" }}>{t.name}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ background: "linear-gradient(135deg,#0d0005,#110008)", border: "1px solid #d9277a33", borderRadius: "24px", padding: "48px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,#d9277a14,transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1a0000", border: "1px solid #ff444433", borderRadius: "8px", padding: "8px 16px", marginBottom: "24px", fontSize: "14px", color: "#ff7777" }}>
                <Flame size={14} />
                <strong style={{ color: "#ff4444" }}>{slotsLeft} manual report slots left this week.</strong>
              </div>
              <h2 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>
                Ready to Know What Your Chart Actually Says?
              </h2>
              <p style={{ color: "#888", fontSize: "16px", marginBottom: "32px", maxWidth: "520px", margin: "0 auto 32px" }}>
                Stop guessing about career, money, and relationships. Get a personalized analysis prepared and delivered directly by a real astrologer.
              </p>
              <p style={{ color: "#e5e5e5", fontSize: "14px", margin: "0 auto 24px", maxWidth: "640px", lineHeight: 1.7 }}>
                This is not an AI-generated astrology PDF. Every page is manually prepared specifically for your birth chart.
              </p>
              <button className="btn-primary" onClick={() => startReport("Deep Life Analysis", "₹1999")}>
                Book Deep Life Analysis — ₹1999 <ArrowRight size={16} />
              </button>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "20px", fontSize: "13px", color: "#555" }}>
                <Lock size={12} /> Secure payment via Razorpay · Report delivered to your email in 24–48 hrs
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "720px", margin: "0 auto" }}>
            {faqs.map((faq, i) => (
              <div key={i} className="card-dark" style={{ cursor: "pointer", padding: "18px 20px" }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>{faq.q}</h3>
                  {openFaq === i ? <ChevronUp size={16} style={{ color: "#d9277a", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "#555", flexShrink: 0 }} />}
                </div>
                {openFaq === i && <p style={{ fontSize: "14px", color: "#888", marginTop: "12px", lineHeight: 1.7, marginBottom: 0 }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DeepReports;
