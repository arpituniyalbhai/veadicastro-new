import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

const FeedbackPopup = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setOpen(true);
    }, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-6 text-center border-border/60 bg-card/95 backdrop-blur-xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold">
              Got a chance to win 2 free chat!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Just give your feedback and get 2 free questions instantly.
            </DialogDescription>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            variant="cosmic"
            className="w-full rounded-xl gap-2"
            onClick={() => {
              setOpen(false);
              navigate("/feedback");
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Give Feedback
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-xl text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackPopup;
