import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { getDbInstance } from "@/lib/firebase";
import { ArrowLeft, Star, Sparkles, Gift, CheckCircle2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MOOD_OPTIONS = [
  { emoji: "😐", label: "Okay", value: 2 },
  { emoji: "🙂", label: "Good", value: 3 },
  { emoji: "😊", label: "Great", value: 4 },
  { emoji: "🤩", label: "Loved it", value: 5 },
];

const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARS = 500;
  const MIN_WORDS = 10;

  const displayName = (() => {
    try {
      return localStorage.getItem("profile_name") || user?.displayName || user?.email?.split("@")[0] || "User";
    } catch {
      return user?.displayName || user?.email?.split("@")[0] || "User";
    }
  })();

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setFeedback(val);
      setCharCount(val.length);
      setWordCount(val.trim() ? val.trim().split(/\s+/).length : 0);
    }
  };

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!feedback.trim() || rating === 0) return;
    setIsSubmitting(true);
    try {
      const db = await getDbInstance();
      const { collection, addDoc } = await import("firebase/firestore");
      await addDoc(collection(db, "Feedback"), {
        email: user?.email || "unknown",
        rating,
        feedback: feedback.trim(),
      });
    } catch (err) {
      console.error("Failed to save feedback:", err);
    }
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const trustpilotUrl = "https://www.trustpilot.com/review/veadicastro.in";

  const ratingLabel: Record<number, string> = {
    1: "Poor",
    2: "Okay",
    3: "Good",
    4: "Very Good",
    5: "Excellent ✨",
  };

  const progressPct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const progressColor =
    charCount > MAX_CHARS * 0.85 ? "#ef4444" : charCount > MAX_CHARS * 0.5 ? "#f59e0b" : "hsl(var(--secondary))";

  return (
    <div className="min-h-screen bg-background px-4 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 via-purple-500/10 to-transparent p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(236,72,153,0.18),transparent_70%)] pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-xl font-bold leading-snug">Share your thoughts, get 2 free questions</p>
              <p className="text-sm text-muted-foreground mt-0.5">No expiry · Takes less than a minute</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <Card className="p-6 sm:p-8 space-y-7 bg-card/50 border-border/60">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Hey {displayName}, how's your experience?</h1>
            <p className="text-sm text-muted-foreground">Honest feedback — good or bad — genuinely helps us</p>
          </div>

          {/* Mood Selector */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">How do you feel about Veadicastro?</p>
            <div className="grid grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => handleMoodSelect(mood.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200",
                    selectedMood === mood.value
                      ? "border-secondary/60 bg-secondary/10 scale-105 shadow-sm"
                      : "border-border/40 bg-background/40 hover:border-secondary/30 hover:bg-secondary/5"
                  )}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-muted-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating — shown after mood */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Rate us with stars</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-7 h-7 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/20"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-secondary">{ratingLabel[rating]}</span>
              )}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                Your feedback
              </label>
              <span className={cn("text-xs", wordCount > 0 && wordCount < MIN_WORDS ? "text-red-400" : charCount > MAX_CHARS * 0.85 ? "text-red-400" : "text-muted-foreground/60")}>
                {wordCount}/{MIN_WORDS} words · {charCount}/{MAX_CHARS}
              </span>
            </div>
            <Textarea
              placeholder="Tell us what you liked, what could be better, or anything you'd like to see..."
              value={feedback}
              onChange={handleFeedbackChange}
              className="min-h-[120px] bg-background/50 border-border/60 resize-none focus-visible:ring-secondary/40"
            />
            <div className="h-0.5 w-full bg-border/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
              />
            </div>
            {wordCount > 0 && wordCount < MIN_WORDS && (
              <p className="text-xs text-red-400 mt-1">Please write at least {MIN_WORDS} words ({MIN_WORDS - wordCount} more needed)</p>
            )}
          </div>

          <Button
            variant="cosmic"
            size="lg"
            className="w-full gap-2"
            disabled={!feedback.trim() || rating === 0 || isSubmitting || wordCount < MIN_WORDS}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Submit & Claim 2 Free Questions
              </>
            )}
          </Button>
        </Card>

        {/* Trustpilot */}
        <Card className="p-5 bg-card/40 border-border/50">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Also on Trustpilot</p>
              <p className="text-xs text-muted-foreground">Your public review helps others discover us</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.open(trustpilotUrl, "_blank")} className="hover:opacity-80 transition-opacity">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRhjBoEJn3jpwaCAX4S7OFeUCGL63WofOEcpWdgRXN2Q&s=10"
                  alt="Trustpilot"
                  className="h-8 object-contain"
                />
              </button>
              <Button variant="outline" size="sm" onClick={() => window.open(trustpilotUrl, "_blank")}>
                Write a review
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground/40 pb-4">
          Your feedback is private and used only to improve Veadicastro
        </p>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 text-center border-border/60 bg-card/95 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <DialogTitle className="text-xl font-semibold">Thanks for your review, {displayName}!</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              We will review your feedback and your credit is added to your account within 12 hours.
            </DialogDescription>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              variant="cosmic"
              className="w-full rounded-xl"
              onClick={() => {
                setShowSuccess(false);
                navigate("/dashboard");
              }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-xl text-muted-foreground"
              onClick={() => setShowSuccess(false)}
            >
              Continue giving feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedback;
