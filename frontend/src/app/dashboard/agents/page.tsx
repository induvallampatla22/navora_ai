"use client";

import { Bot, Zap, CheckCircle2, Clock, ArrowRight, Network } from "lucide-react";

const agentNodes = [
  { id: "orchestrator", name: "Trip Orchestrator", status: "Active", description: "Central AI coordinator managing all sub-agents", connections: ["flight", "hotel", "activity", "dining", "weather"] },
  { id: "flight", name: "Flight Agent", status: "Idle", description: "Searches 400+ airlines, optimizes routes & pricing", connections: [] },
  { id: "hotel", name: "Hotel Agent", status: "Working", description: "Compares 2M+ properties across global OTAs", connections: [] },
  { id: "activity", name: "Activity Agent", status: "Idle", description: "Curates experiences, tours, and local attractions", connections: [] },
  { id: "dining", name: "Dining Agent", status: "Completed", description: "Michelin data, local gems, dietary matching", connections: [] },
  { id: "weather", name: "Weather Agent", status: "Completed", description: "Real-time forecasts and travel impact analysis", connections: [] },
];

const recentTasks = [
  { agent: "Hotel Agent", task: "Comparing 24 properties in Kyoto", status: "Working", time: "12s" },
  { agent: "Dining Agent", task: "Found 8 Kaiseki restaurants near Gion", status: "Completed", time: "4s" },
  { agent: "Weather Agent", task: "7-day forecast loaded for Kyoto", status: "Completed", time: "1s" },
  { agent: "Flight Agent", task: "Awaiting user destination confirmation", status: "Idle", time: "—" },
];

export default function AgentsPage() {
  return (
    <div className="space-y-10 pb-20">
      <div className="pt-4">
        <h1 className="text-4xl font-serif font-medium text-white tracking-wide flex items-center gap-3 mb-3">
          <Network className="w-8 h-8 text-primary" /> Agent Orchestration
        </h1>
        <p className="text-lg text-white/60">Visualize the NAVORA multi-agent AI workflow in real time.</p>
      </div>

      <div className="bg-[#111111] rounded-3xl border border-white/10 p-8">
        <h2 className="text-lg font-serif font-medium text-white mb-6">Agent Network</h2>
        <div className="flex flex-col items-center gap-8">
          <div className="bg-primary/10 border-2 border-primary rounded-2xl px-8 py-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-serif font-medium text-white text-lg">Trip Orchestrator</span>
            </div>
            <div className="text-xs text-white/40">Central AI coordinator managing all sub-agents</div>
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Active
            </div>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
            {agentNodes.filter((n) => n.id !== "orchestrator").map((agent) => (
              <div key={agent.id} className={`rounded-2xl p-5 border text-center transition-all hover:border-primary/30 ${
                agent.status === "Working" ? "border-primary/30 bg-primary/5" : agent.status === "Completed" ? "border-green-500/20 bg-green-500/5" : "border-white/10 bg-[#0a0a0a]"
              }`}>
                <Bot className={`w-6 h-6 mx-auto mb-2 ${agent.status === "Working" ? "text-primary" : agent.status === "Completed" ? "text-green-400" : "text-white/30"}`} />
                <div className="font-medium text-sm text-white">{agent.name}</div>
                <div className="text-xs text-white/40 mt-1 leading-tight">{agent.description}</div>
                <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  agent.status === "Working" ? "text-primary bg-primary/10 border border-primary/20"
                    : agent.status === "Completed" ? "text-green-400 bg-green-500/10 border border-green-500/20"
                    : "text-white/40 bg-white/5 border border-white/10"
                }`}>
                  {agent.status === "Working" && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                  {agent.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                  {agent.status === "Idle" && <Clock className="w-3 h-3" />}
                  {agent.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#111111] rounded-3xl border border-white/10 overflow-hidden">
        <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-serif font-medium text-white">Agent Activity Log</h2>
          <span className="text-sm text-white/40">Last 60 seconds</span>
        </div>
        <div className="divide-y divide-white/5">
          {recentTasks.map((task, i) => (
            <div key={i} className="flex items-center gap-5 px-8 py-4 hover:bg-white/5 transition-colors">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                task.status === "Working" ? "bg-primary animate-pulse" : task.status === "Completed" ? "bg-green-400" : "bg-white/20"
              }`} />
              <div className="flex-1">
                <span className="text-sm font-medium text-white">{task.agent}</span>
                <span className="text-sm text-white/40 ml-2">{task.task}</span>
              </div>
              <div className="text-xs font-mono text-white/30">{task.time}</div>
              <ArrowRight className="w-4 h-4 text-white/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
