import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadMembers, type MemberRecord } from "@/lib/astroMock";
import { ArrowLeft, Loader } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { FeaturePaywall } from "@/components/FeaturePaywall";

const Members = () => {
  const members = loadMembers();
  const hasAny = Array.isArray(members) && members.length > 0;
  const navigate = useNavigate();
  const { planName, loading: planLoading } = usePlan();
  const allowMembers = planName === "Premium";

  const openFuture = (member: MemberRecord) => {
    navigate(`/future?member=${member.id}`);
  };

  const openChat = (member: MemberRecord) => {
    const promptName = member.name || "my family member";
    navigate("/chat", { state: { query: `Share insights for ${promptName}` } });
  };

  if (planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  if (!allowMembers) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <FeaturePaywall
          title="Members Exclusive"
          description="Upgrade to Premium to add, view, and chat about your family members (up to 4 members)."
          ctaLabel="Unlock Members"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-10">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold">Family Members</h1>
          <Button asChild variant="cosmic" className="rounded-lg sm:rounded-xl text-xs sm:text-sm">
            <Link to="/members/add">+ Add</Link>
          </Button>
        </div>

        {!hasAny && (
          <Card className="p-6 sm:p-8 bg-card/40 backdrop-blur border border-white/10 rounded-2xl text-center">
            <div className="text-base sm:text-lg font-semibold mb-2">No members yet</div>
            <p className="text-xs sm:text-sm text-white/70 mb-4">Add your family members to get personalized insights for them.</p>
            <Button asChild variant="secondary" className="rounded-lg sm:rounded-xl text-xs sm:text-sm"> 
              <Link to="/members/add">Add your first member</Link>
            </Button>
          </Card>
        )}

        {hasAny && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {members.map((m: MemberRecord) => (
              <Card key={m.id} className="p-5 bg-card/40 backdrop-blur border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-white/10">
                    <img src={m.photo || "/optimized/vedika.webp"} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{m.name}</div>
                    <div className="text-xs text-white/60 truncate">{m.date} {m.time ? `• ${m.time}` : ''} {m.place ? `• ${m.place}` : ''}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {m.details.slice(0,4).map((d) => (
                    <div key={d.label} className="rounded-lg bg-background/50 border border-white/10 p-2">
                      <div className="text-[11px] text-white/60">{d.label}</div>
                      <div>{d.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button variant="cosmic" className="flex-1" onClick={() => openFuture(m)}>
                    His Future
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => openChat(m)}>
                    Ask Vedika
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
