import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Veadicastro</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto py-20">

          {/* Badge — matches landing page exactly */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-10">
            <span className="text-sm">✦</span>
            <span className="text-sm text-white/80 tracking-wide font-sans">
              Powered by Advanced AI & Vedic Knowledge
            </span>
          </div>

          {/* 404 — white + pink like landing page heading */}
          <h1 className="text-[130px] md:text-[160px] font-extrabold leading-none mb-2 font-serif">
            <span className="text-white">4</span>
            <span className="text-[#e91e8c]">0</span>
            <span className="text-white">4</span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif">
            Page Not Found
          </h2>

          <p className="text-white/50 text-base leading-relaxed mb-10 font-sans max-w-lg mx-auto">
            The page you're looking for doesn't exist or has been moved.
            Let the stars guide you back — try our{" "}
            <Link to="/free-ai-astrologer-chat" className="text-[#e91e8c] underline hover:text-pink-400 transition-colors">
              free AI astrology chat
            </Link>{" "}
            or generate your{" "}
            <Link to="/free-kundli-generator" className="text-[#e91e8c] underline hover:text-pink-400 transition-colors">
              free kundli
            </Link>.
          </p>

          {/* CTA — exact match to "Start From Free" button */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-block px-8 py-3.5 bg-[#e91e8c] text-white font-semibold text-base rounded-xl hover:bg-[#d01879] transition-colors duration-200 font-sans"
            >
              Go to Home Page
            </Link>
          </div>

          {/* Secondary nav pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Home", to: "/" },
              { label: "Blog", to: "/blog" },
              { label: "Free Kundli", to: "/free-kundli-generator" },
              { label: "AI Chat", to: "/free-ai-astrologer-chat" },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-xl text-sm transition-all duration-200 font-sans"
              >
                {label}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default NotFound;