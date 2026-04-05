"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCheck, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function MentorDetailPage() {
  const { id: rawId } = useParams();
  const id = rawId as string;
  const [mentor, setMentor] = useState<any | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const [mRes, aRes] = await Promise.all([
        supabase.from("mentors").select("*").eq("id", id).single(),
        supabase.from("mentor_assignments").select("*, boys(full_name, status)").eq("mentor_id", id).order("assigned_date", { ascending: false }),
      ]);
      setMentor(mRes.data);
      setAssignments(aRes.data || []);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!mentor) return <div className="p-8 text-center text-muted-foreground">Mentor not found</div>;

  return (
    <div className="space-y-6">
      <Link href="/mentors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Mentors
      </Link>

      <div className="flex items-start gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C1662D]">
          <UserCheck className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">{mentor.full_name}</h1>
          <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
            {mentor.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{mentor.email}</span>}
            {mentor.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{mentor.phone}</span>}
            {mentor.county && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{mentor.county}</span>}
          </div>
          {mentor.expertise && <p className="mt-2 text-sm">Expertise: {mentor.expertise}</p>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Boys ({assignments.filter(a => a.status === "active").length} active)</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground">No boys assigned yet</p>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Link href={`/boys/${a.boy_id}`} className="font-medium hover:underline">{a.boys?.full_name}</Link>
                    <p className="text-sm text-muted-foreground">Since {new Date(a.assigned_date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="secondary" className={a.status === "active" ? "bg-green-100 text-green-800" : ""}>
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
