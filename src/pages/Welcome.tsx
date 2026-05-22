import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import SwissEPH from "sweph-wasm";

const Welcome = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isPreloading, setIsPreloading] = useState(false);

  // Preload WASM when component mounts
  useEffect(() => {
    const preloadWasm = async () => {
      try {
        const wasmUrl = "/swisseph.wasm";
        const swe = await SwissEPH.init(wasmUrl);
        await swe.swe_set_ephe_path();
        swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
        // Store in global scope for onboarding to use
        (window as any).preloadedSwe = swe;
      } catch (error) {
        console.error("WASM preload failed:", error);
      }
    };

    // Start preloading immediately
    preloadWasm();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Explorer";

  return (
    <div className="relative min-h-screen min-h-[100svh] flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-secondary/10 blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: "0.6s" }} />
        <div className="absolute top-1/3 left-1/5 w-2 h-2 bg-accent rounded-full animate-sparkle" />
        <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-secondary rounded-full animate-sparkle" style={{ animationDelay: "0.8s" }} />
      </div>

      <div className="container max-w-3xl">
        <div className="text-center animate-fade-in">
          {/* Vedika Avatar */}
          <div className="flex justify-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-secondary/40 overflow-hidden shadow-lg">
              <img src="/optimized/vedika.webp" alt="Vedika" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-xl space-y-5 px-1">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08]">
              Hey! <span className="text-gradient">{displayName}</span>
            </h1>

            <p className="text-lg sm:text-xl text-foreground/85 font-medium leading-7">
              Vedika has been waiting for you.
            </p>

            <div className="mx-auto max-w-md space-y-3 border-y border-white/10 py-5">
              <p className="text-base sm:text-lg text-muted-foreground leading-7">
                Your stars are aligned, and there is something important about your 2026 that you need to know.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground/90 leading-6">
                It takes only 20 seconds to unlock your personal reading.
              </p>
            </div>

            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-secondary/90">
              Start your cosmic profile
            </p>
          </div>

          <div className="flex justify-center pt-8">
            <Button
              variant="cosmic"
              size="xl"
              onClick={() => {
                setIsPreloading(true);
                navigate("/onboarding?referral=welcome");
              }}
              disabled={isPreloading}
              className="w-full max-w-sm px-8 text-center leading-tight"
            >
              {isPreloading ? "Preparing your cosmic journey..." : "Let's personalize with onboarding"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
