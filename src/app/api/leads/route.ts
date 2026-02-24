import { NextResponse } from "next/server";
import { getLeads, getLeadStats, getNotifications } from "@/lib/leads-store";

export async function GET() {
  const [leads, stats, notifications] = await Promise.all([
    getLeads(),
    getLeadStats(),
    getNotifications(),
  ]);

  return NextResponse.json({ leads, stats, notifications });
}
