"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Heart, CalendarDays, School } from "lucide-react";

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalBoys: 0, activeBoys: 0, graduatedBoys: 0,
    totalMentors: 0, activeMentors: 0,
    totalDonations: 0, donationCount: 0,
    totalEvents: 0, completedEvents: 0,
    schoolCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const [boys, mentors, donations, events, schools] = await Promise.all([
        supabase.from("boys").select("status"),
        supabase.from("mentors").select("is_active"),
        supabase.from("donations").select("amount, status"),
        supabase.from("events").select("status"),
        supabase.from("schools").select("id", { count: "exact", head: true }),
      ]);

      const boysData = boys.data || [];
      const mentorsData = mentors.data || [];
      const donationsData = donations.data || [];
      const eventsData = events.data || [];

      setStats({
        totalBoys: boysData.length,
        activeBoys: boysData.filter(b => b.status === "active").length,
        graduatedBoys: boysData.filter(b => b.status === "graduated").length,
        totalMentors: mentorsData.length,
        activeMentors: mentorsData.filter(m => m.is_active).length,
        totalDonations: donationsData.filter(d => d.status === "completed").reduce((s, d) => s + Number(d.amount), 0),
        donationCount: donationsData.filter(d => d.status === "completed").length,
        totalEvents: eventsData.length,
        completedEvents: eventsData.filter(e => e.status === "completed").length,
        schoolCount: schools.count || 0,
      });
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading reports...</div>;

  const cards = [
    { label: "Total Boys Mentored", value: stats.totalBoys, sub: `${stats.activeBoys} active, ${stats.graduatedBoys} graduated`, icon: Users, color: "text-[#1B4332]" },
    { label: "Mentors", value: stats.totalMentors, sub: `${stats.activeMentors} active`, icon: UserCheck, color: "text-[#C1662D]" },
    { label: "Total Donations", value: `KES ${stats.totalDonations.toLocaleString()}`, sub: `${stats.donationCount} donations`, icon: Heart, color: "text-[#D4A373]" },
    { label: "Events Conducted", value: stats.totalEvents, sub: `${stats.completedEvents} completed`, icon: CalendarDays, color: "text-blue-600" },
    { label: "Partner Schools", value: stats.schoolCount, sub: "Schools visited", icon: School, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B4332]">Impact Reports</h1>
        <p className="text-muted-foreground">Overview of Sema Na Boychild&apos;s impact</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-sm text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
