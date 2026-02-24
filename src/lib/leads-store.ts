// Persistent lead store using Upstash Redis (Vercel)
// Falls back to in-memory for local development

import { Redis } from "@upstash/redis";

export interface StoredLead {
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

export interface Notification {
  id: string;
  type: "lead_new" | "lead_hot" | "webhook_sent";
  title: string;
  body: string;
  timestamp: string;
}

// --- Redis client (only if env vars are set) ---

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

const LEADS_KEY = "leads:all";
const NOTIFICATIONS_KEY = "leads:notifications";

// --- In-memory fallback for local dev ---

const memoryLeads: StoredLead[] = [];
const memoryNotifications: Notification[] = [];

// --- Public API ---

function createNotification(lead: StoredLead): Notification[] {
  const notifs: Notification[] = [
    {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: "lead_new",
      title: `New Lead: ${lead.name || "Unknown"}`,
      body: `Score ${lead.score}/10 (${lead.score_label}) — ${lead.conversation_summary.slice(0, 80)}...`,
      timestamp: lead.timestamp,
    },
  ];

  if (lead.score >= 7) {
    notifs.push({
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: "lead_hot",
      title: `HOT Lead — Notify Sales Team`,
      body: `${lead.name || "Prospect"} scored ${lead.score}/10. Goal: ${lead.goal}`,
      timestamp: lead.timestamp,
    });
  }

  return notifs;
}

export async function addLead(
  lead: Omit<StoredLead, "id">
): Promise<StoredLead> {
  const stored: StoredLead = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };

  const notifs = createNotification(stored);

  if (redis) {
    const [existingLeads, existingNotifs] = await Promise.all([
      redis.get<StoredLead[]>(LEADS_KEY),
      redis.get<Notification[]>(NOTIFICATIONS_KEY),
    ]);

    const leads = [stored, ...(existingLeads || [])];
    const notifications = [...notifs, ...(existingNotifs || [])];

    await Promise.all([
      redis.set(LEADS_KEY, leads),
      redis.set(NOTIFICATIONS_KEY, notifications),
    ]);
  } else {
    memoryLeads.unshift(stored);
    notifs.forEach((n) => memoryNotifications.unshift(n));
  }

  return stored;
}

export async function getLeads(): Promise<StoredLead[]> {
  if (redis) {
    return (await redis.get<StoredLead[]>(LEADS_KEY)) || [];
  }
  return [...memoryLeads];
}

export async function getNotifications(): Promise<Notification[]> {
  if (redis) {
    return (await redis.get<Notification[]>(NOTIFICATIONS_KEY)) || [];
  }
  return [...memoryNotifications];
}

export async function getLeadStats() {
  const leads = await getLeads();
  const total = leads.length;
  const hot = leads.filter((l) => l.score_label === "HOT").length;
  const warm = leads.filter((l) => l.score_label === "WARM").length;
  const cold = leads.filter((l) => l.score_label === "COLD").length;
  const avgScore =
    total > 0 ? leads.reduce((sum, l) => sum + l.score, 0) / total : 0;

  return {
    total,
    hot,
    warm,
    cold,
    avgScore: Math.round(avgScore * 10) / 10,
  };
}
