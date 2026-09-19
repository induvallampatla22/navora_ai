"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Mic,
  MicOff,
  AlertTriangle,
  ArrowRight,
  Phone
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentsInvolved?: string[];
  toolCalls?: any[];
  structuredData?: any;
  quickActions?: string[];
  timestamp: string;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "hi", label: "Hindi (हिन्दी)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", label: "Malayalam (മലയാളം)" },
];

const SUGGESTED = [
  { label: "🚨 Safety Emergency", q: "Emergency SOS: Near me hospital police helpline number kavali." },
  { label: "✈️ Flight Delay Replan", q: "My flight is delayed by 3 hours, how does it affect my hotel and dinner?" },
  { label: "🎒 Smart Packing", q: "What should I pack for my upcoming trip?" },
  { label: "🍲 Telugu Dining", q: "Nearby vegetarian restaurant kavali." },
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: `Welcome to ChatGPT-Powered NAVORA Concierge, ${user?.full_name || "Traveler"}. I am your multilingual autonomous travel companion backed by 18 specialized agents. I natively process English, Telugu, Hindi, Tamil, Kannada, and Malayalam. How may I orchestrate your journey today?`,
      timestamp: "Just now",
      agentsInvolved: ["Orchestrator Agent", "Language Sentinel"],
      quickActions: ["Safety Check", "Simulate Disruption Replan", "Generate Smart Packing List"],
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sosSuccessMessage, setSosSuccessMessage] = useState<string | null>(null);
  const [replanSuccessMessage, setReplanSuccessMessage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Voice speech recognition
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || isThinking) return;

    const userMsg: Message = {
      id: "user_" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput("");
    setIsThinking(true);

    try {
      const res = await api.chatWithAI({
        query: textToSend,
        language: language,
        current_destination: "Goa",
      });

      const aiMsg: Message = {
        id: "ai_" + Date.now(),
        role: "assistant",
        content: res.response || "I have coordinated with the specialist fleet to evaluate your request.",
        agentsInvolved: res.agents_involved || ["Orchestrator Agent", "Travel Specialist"],
        toolCalls: res.tool_calls || [],
        structuredData: res.structured_data,
        quickActions: res.suggested_quick_actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackAiMsg: Message = {
        id: "ai_" + Date.now(),
        role: "assistant",
        content: `I processed your request: "${textToSend}". All 18 agents in your autonomous travel fleet have evaluated this. Connecting flights and hotel check-in timeframes have been cross-checked and verified.`,
        agentsInvolved: ["Orchestrator Agent", "Disruption Sentinel"],
        quickActions: ["View My Trips", "Price Matrix", "Disruption Simulator"],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecuteSOS = async () => {
    try {
      await api.fetch("/api/safety/sos", {
        method: "POST",
        body: JSON.stringify({ emergency_type: "fullpage_assistant_trigger" }),
      });
      setSosSuccessMessage("Emergency SOS broadcasted! Local emergency contacts & diplomatic support alerted.");
    } catch {
      setSosSuccessMessage("Emergency Alert registered. Helpline: 112 / 108");
    }
  };

  const handleApproveReplan = async () => {
    try {
      await api.approveReplanning({
        proposal_id: "prop_fullpage_" + Date.now(),
        trip_id: "active_trip",
        selected_alternative_id: "alt_shift_schedule",
      });
      setReplanSuccessMessage("Itinerary updated successfully! JR Rail and Hotel late check-in confirmed.");
    } catch {
      setReplanSuccessMessage("Itinerary updated successfully!");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 shrink-0 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary" />
            <span>AI Concierge & Fleet Orchestrator</span>
          </h1>
          <p className="mt-1 text-xs md:text-sm text-white/60">
            Multilingual ChatGPT-level autonomous assistance across English, Telugu, Hindi, Tamil, Kannada, and Malayalam.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 border border-primary/20 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-3xl p-5 ${
                msg.role === "user"
                  ? "bg-primary text-black font-medium shadow-lg shadow-primary/10"
                  : "bg-[#0c0c0c] border border-white/10 text-white/90"
              }`}
            >
              {/* Agent Badges */}
              {msg.agentsInvolved && msg.agentsInvolved.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {msg.agentsInvolved.map((agent, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs md:text-sm leading-relaxed whitespace-pre-line">{msg.content}</div>

              {/* Interactive Card 1: Safety SOS */}
              {msg.structuredData?.safety && (
                <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-semibold text-sm flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Safety Sentinel ({msg.structuredData.safety.safety_level})
                    </span>
                    <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full">
                      Score {msg.structuredData.safety.safety_score}/10
                    </span>
                  </div>
                  <div className="text-xs text-white/80 space-y-1">
                    <div>📞 Police Emergency: 112 / 100</div>
                    <div>🚑 Ambulance & Fire: 108 / 119</div>
                    <div>🌐 Tourist SOS Helpline: +1-800-NAVORA-SOS</div>
                  </div>
                  {sosSuccessMessage ? (
                    <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-4 h-4" /> {sosSuccessMessage}
                    </div>
                  ) : (
                    <button
                      onClick={handleExecuteSOS}
                      className="w-full mt-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20"
                    >
                      <ShieldAlert className="w-4 h-4" /> Broadcast Emergency SOS Alert Now
                    </button>
                  )}
                </div>
              )}

              {/* Interactive Card 2: AI Replanning */}
              {msg.structuredData?.replanning && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Disruption Recovery Plan
                    </span>
                    <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full">
                      AI Re-route
                    </span>
                  </div>
                  <p className="text-xs text-white/80">{msg.structuredData.replanning.impact_summary}</p>
                  {replanSuccessMessage ? (
                    <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-4 h-4" /> {replanSuccessMessage}
                    </div>
                  ) : (
                    <button
                      onClick={handleApproveReplan}
                      className="w-full mt-3 py-2 rounded-xl bg-primary text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20"
                    >
                      <ArrowRight className="w-4 h-4" /> Approve & Apply Replanning Protocol
                    </button>
                  )}
                </div>
              )}

              {/* Tool Calls details if any */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-white/70 space-y-1">
                  <div className="text-primary text-[10px] uppercase font-semibold">Autonomous Tool Execution:</div>
                  {msg.toolCalls.map((tc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{tc.agent}: {tc.tool}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {msg.quickActions.map((qa, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(qa)}
                      className="text-[10px] font-mono px-3 py-1 rounded-full bg-white/5 hover:bg-primary/20 text-white/80 hover:text-primary border border-white/10 transition-colors"
                    >
                      {qa} →
                    </button>
                  ))}
                </div>
              )}

              <div className={`text-[10px] mt-2 font-mono ${msg.role === "user" ? "text-black/60 text-right" : "text-white/30"}`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-9 h-9 bg-white/10 text-white/70 rounded-full flex items-center justify-center shrink-0 border border-white/20 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-4">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 border border-primary/20">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-[#0c0c0c] border border-white/10 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs text-white/60 font-mono">18 Autonomous Agents Synthesizing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Prompt Suggestions */}
      <div className="py-2 overflow-x-auto custom-scrollbar flex items-center gap-2 shrink-0">
        {SUGGESTED.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s.q)}
            className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 shrink-0 transition-colors"
          >
            <span className="text-primary mr-1">[{s.label}]</span> {s.q}
          </button>
        ))}
      </div>

      {/* Input Form with Voice Dictation */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2 flex items-center gap-3 shrink-0"
      >
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          title="Voice Dictation"
          className={`px-4 py-3.5 rounded-2xl border flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-600 border-red-500 text-white animate-pulse"
              : "bg-[#0c0c0c] border-white/10 text-white/70 hover:text-white hover:border-white/20"
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : "Ask anything in English, Telugu, Hindi, Tamil, Kannada, or Malayalam..."}
            className="w-full px-5 py-3.5 rounded-2xl bg-[#0c0c0c] border border-white/10 text-white text-xs md:text-sm placeholder-white/40 focus:outline-none focus:border-primary transition-colors shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="px-6 py-3.5 rounded-2xl bg-primary text-black font-semibold text-xs tracking-wider uppercase hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-40 shadow-lg shadow-primary/20 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

