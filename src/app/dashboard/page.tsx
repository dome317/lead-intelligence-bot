"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Bell, Flame, UserPlus } from "lucide-react";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  goal: string;
  obstacle: string;
  readiness: string;
  score: number;
  score_label: "HOT" | "WARM" | "COLD";
  conversation_summary: string;
  source: string;
  timestamp: string;
}

interface Notification {
  id: string;
  type: "lead_new" | "lead_hot" | "webhook_sent";
  title: string;
  body: string;
  timestamp: string;
}

interface Stats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  avgScore: number;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) return;
      const data = await res.json();
      setLeads(data.leads);
      setStats(data.stats);
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 3000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const scoreBadge = (label: string) => {
    switch (label) {
      case "HOT":
        return "bg-red-50 text-red-700 border-red-200";
      case "WARM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "COLD":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Lead Dashboard
            </h1>
            <p className="text-xs text-muted">
              Lead Intelligence Bot &middot; Live
            </p>
          </div>
          <div className="flex items-center gap-3">
            {stats.hot > 0 && (
              <span className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold">
                <Flame className="w-3 h-3" />
                {stats.hot} HOT
              </span>
            )}
            <button
              onClick={fetchLeads}
              className="text-muted hover:text-foreground transition-colors cursor-pointer p-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border rounded-xl overflow-hidden border border-border mb-8">
          {[
            { value: stats.total, label: "Total" },
            { value: stats.hot, label: "HOT" },
            { value: stats.warm, label: "WARM" },
            { value: stats.cold, label: "COLD" },
            { value: stats.avgScore, label: "Avg Score" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface p-5 text-center">
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Leads Table - 2/3 width */}
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Leads
            </h2>
            {loading ? (
              <div className="text-center py-16 text-muted text-sm">
                Loading...
              </div>
            ) : leads.length === 0 ? (
              <div className="border border-border rounded-xl bg-surface p-12 text-center">
                <p className="text-muted text-sm mb-2">No leads yet</p>
                <p className="text-muted/50 text-xs">
                  Start a conversation with Alex on the{" "}
                  <a href="/" className="text-accent underline">
                    home page
                  </a>
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                {leads.map((lead, i) => (
                  <div
                    key={lead.id}
                    className={`bg-surface p-4 ${i < leads.length - 1 ? "border-b border-border" : ""} hover:bg-muted-light transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted-light rounded-full flex items-center justify-center text-xs font-semibold text-muted shrink-0">
                          {(lead.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-foreground text-sm">
                            {lead.name || "Unknown"}
                          </span>
                          {lead.email && (
                            <span className="text-muted text-xs ml-2">
                              {lead.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold border ${scoreBadge(lead.score_label)}`}
                        >
                          {lead.score_label} {lead.score}
                        </span>
                        <span className="text-xs text-muted">
                          {timeAgo(lead.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted pl-11 leading-relaxed">
                      {lead.conversation_summary}
                    </p>
                    <div className="flex gap-4 pl-11 mt-2 text-xs text-muted/60">
                      <span>Goal: {lead.goal}</span>
                      <span>Obstacle: {lead.obstacle}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Feed - 1/3 width */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" />
              Live Feed
            </h2>
            {notifications.length === 0 ? (
              <div className="border border-border rounded-xl bg-surface p-8 text-center">
                <p className="text-muted/50 text-xs">
                  No activity yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="border border-border rounded-lg bg-surface p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.type === "lead_hot"
                            ? "bg-red-50 text-red-500"
                            : "bg-muted-light text-muted"
                        }`}
                      >
                        {notif.type === "lead_hot" ? (
                          <Flame className="w-3 h-3" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted mt-0.5 leading-relaxed">
                          {notif.body}
                        </p>
                        <p className="text-[10px] text-muted/50 mt-1">
                          {timeAgo(notif.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Production Note */}
            <div className="mt-6 border border-dashed border-border rounded-lg p-4">
              <p className="text-[10px] text-muted/60 uppercase tracking-widest font-semibold mb-2">
                In Production
              </p>
              <ul className="space-y-1.5 text-xs text-muted/60">
                <li>Slack notification to sales team</li>
                <li>CRM contact created automatically</li>
                <li>Auto-schedule call for HOT leads</li>
              </ul>
              <p className="text-[10px] text-muted/40 mt-2">
                n8n workflow included &rarr; /n8n/lead-workflow.json
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
