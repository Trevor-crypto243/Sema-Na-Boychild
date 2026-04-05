import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Heart, CalendarDays, TrendingUp, Activity } from "lucide-react";

async function getStats() {
  const supabase = await createClient();

  const [boysRes, mentorsRes, donationsRes, eventsRes, recentActivityRes] = await Promise.all([
    supabase.from("boys").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("mentors").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("donations").select("amount").eq("status", "completed"),
    supabase.from("events").select("id", { count: "exact", head: true }).gte("date", new Date().toISOString().split("T")[0]),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  const totalDonations = donationsRes.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  return {
    activeBoys: boysRes.count || 0,
    activeMentors: mentorsRes.count || 0,
    totalDonations,
    upcomingEvents: eventsRes.count || 0,
    recentActivity: recentActivityRes.data || [],
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "Active Boys",
      value: stats.activeBoys,
      description: "Currently being mentored",
      icon: Users,
      color: "text-[#1B4332]",
      bg: "bg-[#1B4332]/10",
    },
    {
      title: "Active Mentors",
      value: stats.activeMentors,
      description: "Volunteering their time",
      icon: UserCheck,
      color: "text-[#C1662D]",
      bg: "bg-[#C1662D]/10",
    },
    {
      title: "Total Donations",
      value: `KES ${stats.totalDonations.toLocaleString()}`,
      description: "All time contributions",
      icon: Heart,
      color: "text-[#D4A373]",
      bg: "bg-[#D4A373]/10",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      description: "Seminars & school visits",
      icon: CalendarDays,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B4332]">Dashboard</h1>
        <p className="text-muted-foreground">Overview of Sema Na Boychild operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#1B4332]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a href="/boys" className="rounded-lg border p-3 hover:bg-gray-50 transition-colors block">
              <span className="font-medium">Add New Boy</span>
              <span className="block text-sm text-muted-foreground">Register a boy for mentorship</span>
            </a>
            <a href="/events" className="rounded-lg border p-3 hover:bg-gray-50 transition-colors block">
              <span className="font-medium">Create Event</span>
              <span className="block text-sm text-muted-foreground">Plan a school visit or seminar</span>
            </a>
            <a href="/content/new" className="rounded-lg border p-3 hover:bg-gray-50 transition-colors block">
              <span className="font-medium">Post Content</span>
              <span className="block text-sm text-muted-foreground">Create & distribute to social media</span>
            </a>
            <a href="/donations" className="rounded-lg border p-3 hover:bg-gray-50 transition-colors block">
              <span className="font-medium">View Donations</span>
              <span className="block text-sm text-muted-foreground">Track incoming donations</span>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#1B4332]" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[#1B4332]" />
                    <div>
                      <span className="font-medium capitalize">{activity.action}</span>
                      {" "}
                      <span className="text-muted-foreground">{activity.entity_type}</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
