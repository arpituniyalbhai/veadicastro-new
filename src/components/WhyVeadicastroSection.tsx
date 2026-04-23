import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const WhyVeadicastroSection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5" />
      <div className="absolute top-0 left-0 w-[380px] h-[380px] bg-secondary/10 rounded-full blur-3xl" />
      <div
        className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-primary/10 rounded-full blur-3xl"
        style={{ animationDelay: "0.7s" }}
      />

      <div className="container mx-auto relative z-10 max-w-5xl">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-md shadow-lg mb-8">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-secondary">
            A quick look at how we are different — simple facts, no drama
          </span>
        </div>

        {/* Subline */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl">
          Free clarity, honest guidance, and real Vedic logic — so you never have to depend on fear-based astrology again.
        </p>

        {/* Comparison Table */}
        <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden shadow-xl">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 bg-gradient-to-r from-secondary/20 to-primary/20 border-b border-border/60">
            <div className="p-4 md:p-6">
              <h3 className="font-semibold text-foreground">Features</h3>
            </div>
            <div className="p-4 md:p-6 text-center md:border-x border-border/30">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40 mb-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-secondary">Veadicastro</span>
              </div>
              <p className="text-sm text-muted-foreground">AI + Vedic Wisdom</p>
            </div>
            <div className="p-4 md:p-6 text-center">
              <div className="font-medium text-foreground mb-2">Other Apps</div>
              <p className="text-sm text-muted-foreground">Traditional Platforms</p>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border/30">
            <div className="grid grid-cols-1 md:grid-cols-3 hover:bg-card/20 transition-colors">
              <div className="p-4 md:p-6 border-b md:border-b-0 border-border/30 bg-secondary/5 md:bg-transparent">
                <div className="font-medium text-foreground">Daily Predictions</div>
              </div>
              <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium text-secondary">Free Today + Tomorrow</span>
                </div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-muted-foreground">Paywall for basic predictions</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 hover:bg-card/20 transition-colors">
              <div className="p-4 md:p-6 border-b md:border-b-0 border-border/30 bg-secondary/5 md:bg-transparent">
                <div className="font-medium text-foreground">AI Chat Messages</div>
              </div>
              <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium text-secondary">5 Free Every Day</span>
                </div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-muted-foreground">Charge from day one</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 hover:bg-card/20 transition-colors">
              <div className="p-4 md:p-6 border-b md:border-b-0 border-border/30 bg-secondary/5 md:bg-transparent">
                <div className="font-medium text-foreground">Reports & Insights</div>
              </div>
              <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium text-secondary">Full Insights Free</span>
                </div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sell for 500-5000</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 hover:bg-card/20 transition-colors">
              <div className="p-4 md:p-6 border-b md:border-b-0 border-border/30 bg-secondary/5 md:bg-transparent">
                <div className="font-medium text-foreground">Calculation Logic</div>
              </div>
              <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium text-secondary">Clear Vedic Logic</span>
                </div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hidden calculations</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 hover:bg-card/20 transition-colors">
              <div className="p-4 md:p-6 bg-secondary/5 md:bg-transparent">
                <div className="font-medium text-foreground">Prediction Quality</div>
              </div>
              <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium text-secondary">Vedic-verified, AI-powered insights</span>
                </div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-muted-foreground">Generic one-liners</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing line */}
        <div className="mt-12 text-center">
          <p className="text-xl md:text-2xl font-bold text-foreground">
            That's Why Veadicastro <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">&gt; Every Other Astrology App</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyVeadicastroSection;

