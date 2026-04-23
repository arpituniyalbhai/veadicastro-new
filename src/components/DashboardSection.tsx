
const DashboardSection = () => {
  return (
    <section className="py-20 px-4 relative hidden sm:block">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="font-sans text-4xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-normal">
            Your Personal
            <span className="block md:inline bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent"> Cosmic Dashboard</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access your complete astrological profile, daily predictions, birth chart analysis, and personalized insights all in one beautiful interface.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto animate-scale-in">
          {/* Dashboard Preview Image */}
          <div className="relative rounded-2xl overflow-hidden border border-border/50 backdrop-blur-sm">
            <img 
              src="/optimized/dashboard-preview.webp" 
              alt="Astrology AI dashboard showing birth chart, predictions, and cosmic insights interface" 
              loading="lazy"
              className="w-full h-auto"
              onError={(e) => {
                console.log('Dashboard image failed to load');
              }}
            />
            {/* Overlay Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"></div>
          </div>
          
          {/* Decorative Glow Effects */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
