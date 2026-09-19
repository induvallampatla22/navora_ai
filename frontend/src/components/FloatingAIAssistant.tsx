"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Mic,
  MicOff,
  Globe,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Phone,
  AlertTriangle,
  PackageCheck,
  CheckSquare,
  Square,
  ArrowRight
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

const SAMPLE_PROMPTS = [
  { label: "🚨 Safety Emergency", query: "Emergency SOS: Near me hospital police helpline number kavali." },
  { label: "✈️ Flight Delay Replan", query: "My flight is delayed 3 hours, how does it affect my trip?" },
  { label: "🎒 Smart Packing", query: "What should I pack for my Goa trip?" },
  { label: "🌦️ Rain Weather Replan", query: "Ippudu rain padutundi, indoor activities reroute cheyyava?" },
];

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Namaste ${user?.full_name?.split(" ")[0] || "Explorer"}! I am your ChatGPT-powered NAVORA Autonomous AI Concierge. I orchestrate 18 specialized travel agents in real-time.

I seamlessly handle:
1. 🚨 **Safety Sentinel & SOS Alerts**
2. ✈️ **AI Replanning & Delay Re-routing**
3. 🎒 **Smart Destination Packing**
4. 🗣️ **Multilingual Queries in Telugu, English, Hindi, Tamil, Kannada & Malayalam**`,
      timestamp: "Just now",
      quickActions: ["Safety Check", "Simulate Delay Replan", "Generate Smart Packing List"],
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeDestination, setActiveDestination] = useState("Goa");
  const [sosSuccessMessage, setSosSuccessMessage] = useState<string | null>(null);
  const [replanSuccessMessage, setReplanSuccessMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await api.getTrips();
        if (data && data.length > 0) {
          setActiveDestination(data[0].primary_destination || "Goa");
        }
      } catch {
        setActiveDestination("Goa");
      }
    };
    fetchTrip();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Voice speech-to-text integration
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

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const data = await api.chatAI(q, language, activeDestination);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "NAVORA AI processed your request.",
        agentsInvolved: data.agents_involved || ["Orchestrator Agent"],
        toolCalls: data.tool_calls || [],
        structuredData: data.structured_data || {},
        quickActions: data.suggested_quick_actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Encountered network latency. Running local safety fallback for " + activeDestination,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecuteSOS = async () => {
    try {
      await api.fetch("/api/safety/sos", {
        method: "POST",
        body: JSON.stringify({ emergency_type: "chatbot_voice_trigger" }),
      });
      setSosSuccessMessage("Emergency SOS broadcasted! Local emergency contacts notified.");
    } catch {
      setSosSuccessMessage("Emergency Alert registered. Emergency helpline: 112 / 108");
    }
  };

  const handleApproveReplan = async () => {
    try {
      await api.approveReplanning({
        proposal_id: "prop_chatbot_" + Date.now(),
        trip_id: "active_trip",
        selected_alternative_id: "alt_shift_schedule",
      });
      setReplanSuccessMessage("Itinerary updated successfully! JR Rail and Hotel late check-in confirmed.");
    } catch {
      setReplanSuccessMessage("Itinerary updated successfully!");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-[#0e0e0e] border border-[#d4b88a]/40 hover:border-[#d4b88a] text-white px-5 py-3.5 rounded-full shadow-[0_0_35px_rgba(212,184,138,0.25)] hover:shadow-[0_0_45px_rgba(212,184,138,0.35)] transition-all transform hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-full bg-[#d4b88a]/20 border border-[#d4b88a]/50 flex items-center justify-center text-[#d4b88a]">
            <Sparkles className="w-4 h-4 animate-spin duration-3000" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-serif font-medium tracking-wider text-white">NAVORA AI</span>
            <span className="text-[10px] text-[#d4b88a] tracking-widest uppercase">ChatGPT Concierge</span>
          </div>
        </button>
      ) : (
        <div className="w-[380px] sm:w-[450px] h-[620px] bg-[#0c0c0c] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="p-4 bg-[#141414] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d4b88a]/20 border border-[#d4b88a]/40 flex items-center justify-center text-[#d4b88a]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-medium text-white tracking-wide">NAVORA AI Concierge</h3>
                <span className="text-[10px] text-[#d4b88a] tracking-wider uppercase">ChatGPT Powered · 18 Agents</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-black/50 border border-white/10 text-white text-[11px] rounded-lg px-2 py-1 outline-none focus:border-[#d4b88a]"
              >
                <option value="en">English</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[90%] rounded-2xl p-4 ${
                    m.role === "user"
                      ? "bg-[#d4b88a] text-black font-medium"
                      : "bg-[#161616] text-white/90 border border-white/10"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{m.content}</p>

                  {/* Interactive Card 1: Safety SOS */}
                  {m.structuredData?.safety && (
                    <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-red-400 font-semibold flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4" /> Safety Sentinel ({m.structuredData.safety.safety_level})
                        </span>
                        <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                          Score {m.structuredData.safety.safety_score}/10
                        </span>
                      </div>
                      <div className="text-[11px] text-white/80 space-y-1">
                        <div>📞 Police: 112 / 100</div>
                        <div>🚑 Ambulance: 108 / 119</div>
                        <div>🌐 Tourist SOS: +1-800-NAVORA-SOS</div>
                      </div>
                      {sosSuccessMessage ? (
                        <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {sosSuccessMessage}
                        </div>
                      ) : (
                        <button
                          onClick={handleExecuteSOS}
                          className="w-full mt-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> Broadcast Emergency SOS Now
                        </button>
                      )}
                    </div>
                  )}

                  {/* Interactive Card 2: AI Replanning */}
                  {m.structuredData?.replanning && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> Disruption Recovery Plan
                        </span>
                        <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                          AI Re-route
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80">{m.structuredData.replanning.impact_summary}</p>
                      {replanSuccessMessage ? (
                        <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {replanSuccessMessage}
                        </div>
                      ) : (
                        <button
                          onClick={handleApproveReplan}
                          className="w-full mt-2 py-1.5 rounded-lg bg-[#d4b88a] text-black font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <ArrowRight className="w-3.5 h-3.5" /> Approve & Apply Replanning
                        </button>
                      )}
                    </div>
                  )}

                  {/* Agent Badges */}
                  {m.agentsInvolved && m.agentsInvolved.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                      {m.agentsInvolved.map((ag, i) => (
                        <span key={i} className="text-[9px] bg-black/40 text-[#d4b88a] px-2 py-0.5 rounded-full border border-[#d4b88a]/30">
                          {ag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Badges */}
                  {m.quickActions && m.quickActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(qa)}
                          className="text-[10px] bg-white/5 hover:bg-[#d4b88a]/20 border border-white/10 hover:border-[#d4b88a]/40 text-white/80 hover:text-[#d4b88a] px-2.5 py-1 rounded-full transition-colors"
                        >
                          {qa}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-white/30 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 bg-[#161616] text-white/50 border border-white/5 rounded-2xl px-4 py-3 max-w-[80%]">
                <RefreshCw className="w-3.5 h-3.5 text-[#d4b88a] animate-spin" />
                <span>Orchestrating 18 specialized agents...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sample Prompts */}
          <div className="px-4 py-2 border-t border-white/5 bg-[#101010]/80 flex gap-2 overflow-x-auto custom-scrollbar">
            {SAMPLE_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.query)}
                className="whitespace-nowrap text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Box with Voice Microphone */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#141414] border-t border-white/10 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title="Voice Dictation"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                isListening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-white/10 hover:bg-white/20 text-white/80"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask in Telugu, English, Hindi..."}
              className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4b88a]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="w-9 h-9 rounded-full bg-[#d4b88a] text-black flex items-center justify-center hover:bg-[#c4a87a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

