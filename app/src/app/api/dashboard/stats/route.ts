import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const [boys, mentors, donations, events, activity] = await Promise.all([
    supabase.from("boys").select("id, status"),
    supabase.from("mentors").select("id, is_active"),
    supabase.from("donations").select("amount, status, created_at"),
    supabase.from("events").select("id, status, date"),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(15),
  ]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const completedDonations = (donations.data || []).filter(d => d.status === "completed");

  return NextResponse.json({
    activeBoys: (boys.data || []).filter(b => b.status === "active").length,
    totalBoys: (boys.data || []).length,
    activeMentors: (mentors.data || []).filter(m => m.is_active).length,
    totalDonations: completedDonations.reduce((s, d) => s + Number(d.amount), 0),
    thisMonthDonations: completedDonations
      .filter(d => {
        const dt = new Date(d.created_at);
        return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
      })
      .reduce((s, d) => s + Number(d.amount), 0),
    upcomingEvents: (events.data || []).filter(e => new Date(e.date) >= now).length,
    completedEvents: (events.data || []).filter(e => e.status === "completed").length,
    recentActivity: activity.data || [],
  });
}
