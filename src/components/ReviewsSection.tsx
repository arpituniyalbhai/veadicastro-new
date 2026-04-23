import React from "react";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Priya Sharma",
    profession: "Government Servant, Delhi",
    rating: 5,
    date: "Mar 15, 2026",
    boldTitle: null,
    text: "Vedika AI answered my career question instantly. {Today and tomorrow predictions are genuinely useful} for planning my day. Worth every rupee.",
  },
  {
    name: "Rohan Mehta",
    profession: "Founder, IconGPT",
    rating: 5,
    date: "Mar 18, 2026",
    boldTitle: "Monthly predictions are scarily accurate",
    text: "Vedika AI is impressive — {feels like talking to a real astrologer}. Vedic calculations are solid and align well with actual planetary transits.",
  },
  {
    name: "Kavitha Nair",
    profession: "IAS Officer, Kerala",
    rating: 5,
    date: "Mar 1, 2026",
    boldTitle: "Fast, clear and totally worth it",
    text: "Daily predictions {help me plan my week as an IAS officer}. ₹9 per question is nothing compared to what traditional astrologers charge. Vedika AI is fast, clear, and fear-free.",
  },
  {
    name: "Ananya Iyer",
    profession: "Astrology Enthusiast, Bangalore",
    rating: 5,
    date: "Mar 20, 2026",
    boldTitle: null,
    text: "At just ₹9 per question, {this is unbelievably affordable}. Vedika AI knows her stuff and the monthly predictions were surprisingly on point.",
  },
  {
    name: "Sarah Mitchell",
    profession: "Wellness Coach, California, USA",
    rating: 5,
    date: "Mar 10, 2026",
    boldTitle: null,
    text: "Vedika AI explains everything so clearly. {Today's prediction was spot on.} Nothing like this exists in the West at this price point.",
  },
  {
    name: "Deepika Verma",
    profession: "Homemaker, Lucknow",
    rating: 5,
    date: "Mar 22, 2026",
    boldTitle: null,
    text: "Not really into astrology but tried it anyway. {Some answers from Vedika AI were surprisingly accurate.} Today's health prediction was oddly specific.",
  },
];

function parseText(text) {
  const parts = text.split(/\{([^}]+)\}/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={i}
        style={{
          background: "rgba(234, 179, 8, 0.25)",
          color: "#fde047",
          borderRadius: "3px",
          padding: "0 3px",
          fontWeight: 600,
        }}
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const StarRating = ({ rating }) => (
  <div style={{ display: "flex", gap: 2, margin: "10px 0 8px" }}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        style={{
          width: 16,
          height: 16,
          fill: i < rating ? "#eab308" : "transparent",
          color: i < rating ? "#eab308" : "hsl(var(--muted-foreground) / 0.3)",
          filter: i < rating ? "drop-shadow(0 0 2px rgba(234,179,8,0.4))" : "none",
        }}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "linear-gradient(135deg, hsl(var(--card) / 0.80), hsl(var(--card) / 0.40))",
        backdropFilter: "blur(16px)",
        border: `1px solid ${hovered ? "hsl(var(--secondary) / 0.60)" : "hsl(var(--border) / 0.40)"}`,
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        boxShadow: hovered
          ? "0 16px 48px hsl(0 0% 0% / 0.35)"
          : "0 8px 32px hsl(0 0% 0% / 0.20)",
      }}
    >
      {/* Hover overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, hsl(var(--secondary)/0.05), transparent)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      />

      {/* Header: Avatar + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
        {/* Avatar with reviews.webp, zoomed */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid hsl(var(--secondary)/0.40)",
            boxShadow: hovered
              ? "0 0 0 3px hsl(var(--secondary)/0.30)"
              : "0 0 0 2px hsl(var(--secondary)/0.15)",
            flexShrink: 0,
            transition: "box-shadow 0.3s",
            overflow: "hidden",
          }}
        >
          <img
            src="/optimized/reviews.webp"
            alt={review.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: hovered ? "hsl(var(--secondary))" : "hsl(var(--foreground))",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              transition: "color 0.3s",
            }}
          >
            {review.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "hsl(var(--muted-foreground))",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "hsl(var(--secondary)/0.50)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {review.profession}
          </div>
        </div>
      </div>

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Bold title */}
      {review.boldTitle && (
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "hsl(var(--foreground))",
            margin: "0 0 8px",
            lineHeight: 1.4,
            position: "relative",
            zIndex: 1,
          }}
        >
          {review.boldTitle}
        </p>
      )}

      {/* Review text */}
      <p
        style={{
          fontSize: 13,
          color: "hsl(var(--foreground) / 0.85)",
          lineHeight: 1.65,
          margin: "0 0 12px",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {parseText(review.text)}
      </p>

      {/* Date */}
      <p
        style={{
          fontSize: 11,
          color: "hsl(var(--muted-foreground) / 0.55)",
          margin: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {review.date}
      </p>
    </div>
  );
};

const ReviewsSection = () => {
  return (
    <section style={{ position: "relative", padding: "80px 24px", overflow: "hidden" }}>
      {/* Background blobs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, hsl(var(--secondary)/0.10), hsl(var(--background)/0.90), hsl(var(--primary)/0.10))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 400,
          height: 400,
          background: "hsl(var(--secondary)/0.10)",
          borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 500,
          height: 500,
          background: "hsl(var(--primary)/0.10)",
          borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 6s ease-in-out infinite",
          animationDelay: "1s",
        }}
      />

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes sparkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.5)} }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) { .reviews-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 580px)  { .reviews-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Sparkle dots */}
      <div style={{ position: "absolute", top: 80, left: 40, width: 8, height: 8, background: "hsl(var(--secondary))", borderRadius: "50%", boxShadow: "0 0 8px hsl(var(--secondary)/0.5)", animation: "sparkle 2s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: 160, right: 80, width: 6, height: 6, background: "hsl(var(--primary))", borderRadius: "50%", boxShadow: "0 0 8px hsl(var(--primary)/0.5)", animation: "sparkle 2s ease-in-out infinite", animationDelay: "0.5s" }} />
      <div style={{ position: "absolute", bottom: 128, left: "25%", width: 8, height: 8, background: "hsl(var(--accent))", borderRadius: "50%", boxShadow: "0 0 8px hsl(var(--accent)/0.5)", animation: "sparkle 2s ease-in-out infinite", animationDelay: "1s" }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 600,
            color: "hsl(var(--foreground))",
            marginTop: "1rem",
            marginBottom: "2rem",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            position: "relative",
          }}>
            <span style={{
              position: "relative",
              zIndex: 10,
              background: "linear-gradient(to right, hsl(var(--foreground)), hsl(var(--foreground)), hsl(var(--foreground)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 20px hsl(var(--secondary)/0.3))",
            }}>
              What Our Users Say
            </span>
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, hsl(var(--secondary)/0.2), hsl(var(--accent)/0.2), hsl(var(--primary)/0.2))",
              filter: "blur(20px)",
              zIndex: -1,
            }}></div>
          </h2>
        </div>

        {/* 3-column grid */}
        <div className="reviews-grid">
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>

        {/* Attribution */}
        <p
          style={{
            textAlign: "center",
            marginTop: 32,
            fontSize: 12,
            color: "hsl(var(--muted-foreground)/0.50)",
          }}
        >
          Gathered from Trustpilot, Sitejabber, Capterra
        </p>
      </div>
    </section>
  );
};

export default ReviewsSection;