import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { setAuthOpen, user } = useAuth();
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-20"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      {/* Single subtle glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(217,39,122,0.08) 0%, transparent 70%)'
        }}
      />

      <div className="container relative z-10 px-4 sm:px-6 mx-auto">
        <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto">

          {/* Badge */}
          <div className="mb-8 md:mb-0" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(217,39,122,0.3)',
            background: 'rgba(217,39,122,0.08)',
            maxWidth: '100%',
          }}>
            <span style={{ color: '#d9277a', fontSize: '13px', fontWeight: 500 }}>
              ✦ Powered by Advanced AI & Vedic Knowledge
            </span>
          </div>

          {/* H1 — single catchy title, no hyphen */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 7vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#f2f2f2',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Your Stars Know<br />
            <span style={{ color: '#d9277a' }}>What's Coming Next</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: '#c4c4d4',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
            lineHeight: 1.7,
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            AI-powered Vedic astrology that predicts your{' '}
            <span style={{ color: '#d9277a', fontWeight: 600 }}>love</span>,{' '}
            <span style={{ color: '#d9277a', fontWeight: 600 }}>career</span> and{' '}
            <span style={{ color: '#d9277a', fontWeight: 600 }}>money</span> — instantly.
          </p>

          {/* CTA Button — capsule shape */}
          <div>
            <button
              onClick={() => {
                if (user) {
                  navigate('/dashboard?referral=hero');
                } else {
                  setAuthOpen(true);
                }
              }}
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                color: 'white',
                border: 'none',
                padding: '16px clamp(28px, 12vw, 52px)',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: 'min(100%, 240px)',
                minHeight: '56px',
                boxShadow: '0 8px 32px hsl(var(--primary) / 0.35)',
                letterSpacing: '0.01em',
              }}
            >
              See My Future →
            </button>
          </div>

          {/* Stars */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: '#facc15',
              fontSize: '20px',
              letterSpacing: '3px',
              marginBottom: '6px'
            }}>
              ★★★★★
            </div>
            <p style={{ color: '#f2f2f2', fontSize: '14px', margin: 0 }}>
              Chosen by 21,500+ Users Worldwide
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
