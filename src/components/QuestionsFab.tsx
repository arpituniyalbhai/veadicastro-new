import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; content: string };

const INITIAL_MESSAGE: Msg = {
  id: "init",
  role: "assistant",
  content:
    "Hello! I'm Vedika, your AI Astrologer, here to help you get started. I can provide all the information you need about our website, explain the pricing details, or walk you through the first steps of your consultation.",
};

const useVedikaAssistantState = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MESSAGE]);
  const messagesRef = useRef(messages);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => {
      const next = [...prev, userMsg];
      messagesRef.current = next;
      return next;
    });
    setInput("");
    setLoading(true);

    try {
      const history = messagesRef.current.map((m) => ({ role: m.role, content: m.content }));
      const { VAANI_SYSTEM_PROMPT } = await import("@/lib/chatbot/systemPrompt");
      const systemExtra = VAANI_SYSTEM_PROMPT;

      const r = await fetch("/api/mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, history, systemExtra }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      const assistantText =
        String(data?.text || "").trim() || "I couldn't generate a response. Please try again.";
      const botMsg: Msg = { id: crypto.randomUUID(), role: "assistant", content: assistantText };
      setMessages((prev) => {
        const next = [...prev, botMsg];
        messagesRef.current = next;
        return next;
      });
    } catch (e) {
      const errMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I ran into an issue reaching the AI service. Please try again.",
      };
      setMessages((prev) => {
        const next = [...prev, errMsg];
        messagesRef.current = next;
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  return { input, setInput, loading, messages, sendMessage, onKeyDown, endRef };
};

type AssistantPanelProps = {
  onClose?: () => void;
  className?: string;
  hideCloseButton?: boolean;
};

type AssistantPanelState = ReturnType<typeof useVedikaAssistantState>;

const AssistantPanel = ({ state, onClose, className, hideCloseButton }: AssistantPanelProps & { state: AssistantPanelState }) => {
  const { messages, input, setInput, loading, sendMessage, onKeyDown, endRef } = state;

  return (
    <div
      className={cn(
        "w-[calc(100vw-2rem)] sm:w-[22rem] max-w-[92vw] rounded-2xl border border-white/10 bg-background/95 backdrop-blur p-3 shadow-2xl",
        className,
      )}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <img src="/optimized/vedika.webp" alt="Vedika" className="w-7 h-7 rounded-full object-cover" />
          <div className="font-semibold">Vedika — AI Astrologer</div>
        </div>
        {onClose && !hideCloseButton && (
          <button onClick={onClose} className="px-2 py-1 text-sm rounded-md hover:bg-white/10">
            Close
          </button>
        )}
      </div>

      <div className="mt-3 h-64 overflow-y-auto rounded-lg border border-white/10 p-2 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={cn(
                "inline-block max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-white/5 text-white",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about features, readings, pricing..."
          className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/50 focus:ring-2 focus:ring-secondary/40"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-lg px-3 py-2 text-sm font-medium bg-secondary text-black disabled:opacity-60"
        >
          {loading ? "Sending" : "Send"}
        </button>
      </div>
    </div>
  );
};

const QuestionsFab = () => {
  const state = useVedikaAssistantState();
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showFab, setShowFab] = useState<boolean>(false);

  useEffect(() => {
    // Delay showing the FAB for 7 seconds
    const timer = setTimeout(() => {
      setShowFab(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showFab) return;
    
    try {
      const dismissed = sessionStorage.getItem("vedika_hint_dismissed_session") === "true";
      setShowHint(!dismissed);
    } catch {
      setShowHint(true);
    }
    
    // Cleanup any existing duplicate FAB elements
    const existingFabs = document.querySelectorAll('#questions-fab-root');
    if (existingFabs.length > 1) {
      existingFabs.forEach((fab, index) => {
        if (index > 0) {
          fab.remove();
        }
      });
    }
    
    // Cleanup function to ensure proper unmounting
    return () => {
      setOpen(false);
    };
  }, [showFab]);

  return (
    showFab && (
      <div id="questions-fab-root" className="fixed z-[60] bottom-6 right-6 sm:bottom-8 sm:right-8">
        {open && <AssistantPanel state={state} onClose={() => setOpen(false)} />}

        <button
        onClick={() => {
          setOpen(!open);
          if (showHint) {
            try {
              sessionStorage.setItem("vedika_hint_dismissed_session", "true");
            } catch {
              /* ignore */
            }
            setShowHint(false);
          }
        }}
        className="h-14 w-14 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-transform grid place-items-center overflow-hidden ring-2 ring-white/10"
        aria-label="Chat with Vedika"
      >
        <img src="/optimized/vedika.webp" alt="Open chat" className="w-full h-full object-cover" />
      </button>

      {showHint && (
        <div className="absolute right-20 bottom-4 max-w-[320px] bg-white/10 text-white/90 text-xs px-4 py-2 rounded-lg border border-white/15 backdrop-blur shadow-lg whitespace-nowrap">
          How can I help you?
          <div className="absolute -right-2 top-1.5 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white/15" />
        </div>
      )}
    </div>
    )
  );
};

export const VedikaAssistantPanel = ({ onClose, className, hideCloseButton }: AssistantPanelProps) => {
  const state = useVedikaAssistantState();
  return <AssistantPanel state={state} onClose={onClose} className={className} hideCloseButton={hideCloseButton} />;
};

export default QuestionsFab;
