import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeepReasoningData = {
  question: string;
  result: string;
  createdAt?: number;
};

const renderInline = (text: string) => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
  part.startsWith("**") && part.endsWith("**")
    ? <strong key={`${part}-${index}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    : part,
);

const renderAnalysis = (result: string) => result.split("\n").map((rawLine, index) => {
  const line = rawLine.trim();
  if (!line) return <div key={`space-${index}`} className="h-2" />;
  if (["Direct answer", "Chart evidence", "What this means for you", "Practical next steps"].some((label) => line.toLowerCase() === label.toLowerCase() || line.toLowerCase() === `${label.toLowerCase()}:`)) {
    return <h2 key={index} className="mb-2 mt-7 text-lg font-semibold tracking-tight text-foreground first:mt-0">{line.replace(/:$/, "")}</h2>;
  }
  if (line.startsWith("## ")) return <h2 key={index} className="mb-2 mt-7 text-lg font-semibold tracking-tight text-foreground first:mt-0">{renderInline(line.slice(3))}</h2>;
  if (line.startsWith("# ")) return <h2 key={index} className="mb-2 mt-7 text-lg font-semibold tracking-tight text-foreground first:mt-0">{renderInline(line.slice(2))}</h2>;
  if (/^[-•*]\s+/.test(line)) return (
    <div key={index} className="my-2 flex gap-3 pl-1 text-[15px] leading-7 text-foreground/80">
      <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400" />
      <p>{renderInline(line.replace(/^[-•*]\s+/, ""))}</p>
    </div>
  );
  if (/^\d+[.)]\s+/.test(line)) return (
    <div key={index} className="my-2 flex gap-3 text-[15px] leading-7 text-foreground/80">
      <span className="min-w-6 font-semibold text-pink-300">{line.match(/^\d+/)?.[0]}.</span>
      <p>{renderInline(line.replace(/^\d+[.)]\s+/, ""))}</p>
    </div>
  );
  return <p key={index} className="text-[15px] leading-7 text-foreground/80">{renderInline(line)}</p>;
});

export default function DeepReasoningResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = useMemo<DeepReasoningData | null>(() => {
    const routeState = location.state as DeepReasoningData | null;
    if (routeState?.question && routeState?.result) return routeState;
    try {
      const stored = JSON.parse(sessionStorage.getItem("vedika_deep_reasoning_result") || "null");
      return stored?.question && stored?.result ? stored : null;
    } catch {
      return null;
    }
  }, [location.state]);

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/chat")} className="mb-5 -ml-2 rounded-full text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to chat
        </Button>

        {!data ? (
          <div className="rounded-3xl border border-border/70 bg-card p-8 text-center shadow-xl sm:p-12">
            <Brain className="mx-auto h-10 w-10 text-pink-300" />
            <h1 className="mt-4 text-2xl font-semibold">No Deep Reasoning result found</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create a new detailed analysis from the Deep Reasoning option in chat.</p>
            <Button variant="cosmic" onClick={() => navigate("/chat")} className="mt-6 rounded-full">Open chat</Button>
          </div>
        ) : (
          <>
            <header className="relative overflow-hidden rounded-[30px] border border-pink-400/20 bg-gradient-to-br from-card via-card to-pink-400/[0.08] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:p-9">
              <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-pink-500/10 blur-3xl" aria-hidden="true" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-pink-400/25 bg-pink-400/10 text-pink-300">
                  <Brain className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-300">Vedika analysis</p>
                  <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">Deep Reasoning</h1>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date(data.createdAt || Date.now()))}
                  </p>
                </div>
              </div>
            </header>

            <section className="mt-5 rounded-2xl border border-border/60 bg-card/55 p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your complete question</p>
              <p className="mt-2 text-base leading-7 text-foreground/90">{data.question}</p>
            </section>

            <article className="mt-5 rounded-[28px] border border-border/70 bg-card p-6 shadow-[0_20px_55px_rgba(0,0,0,0.18)] sm:p-9">
              {renderAnalysis(data.result)}
            </article>

            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => navigate("/chat")} className="rounded-full px-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ask another question
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
