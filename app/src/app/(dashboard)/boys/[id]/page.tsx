"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, BookOpen, Heart, Brain, Crown } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";

const categoryIcons = {
  academic: BookOpen,
  emotional: Heart,
  behavioral: Brain,
  leadership: Crown,
};

export default function BoyDetailPage() {
  const { id: rawId } = useParams();
  const id = rawId as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [boy, setBoy] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notes, setNotes] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const [boyRes, notesRes, assignRes] = await Promise.all([
      supabase.from("boys").select("*, schools(name)").eq("id", id).single(),
      supabase.from("progress_notes").select("*, mentors(full_name)").eq("boy_id", id).order("date", { ascending: false }),
      supabase.from("mentor_assignments").select("*, mentors(full_name)").eq("boy_id", id).order("assigned_date", { ascending: false }),
    ]);
    setBoy(boyRes.data);
    setNotes(notesRes.data || []);
    setAssignments(assignRes.data || []);
    setLoading(false);
  }

  async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    // Get mentor record for current user
    const { data: mentor } = await supabase
      .from("mentors")
      .select("id")
      .eq("user_id", user!.id)
      .single();

    if (!mentor) return;

    await supabase.from("progress_notes").insert({
      boy_id: id as string,
      mentor_id: mentor.id,
      category: form.get("category") as "academic" | "emotional" | "behavioral" | "leadership",
      note: form.get("note") as string,
      rating: parseInt(form.get("rating") as string),
      date: new Date().toISOString().split("T")[0],
    } as Database["public"]["Tables"]["progress_notes"]["Insert"]);

    e.currentTarget.reset();
    fetchData();
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!boy) return <div className="p-8 text-center text-muted-foreground">Boy not found</div>;

  const age = boy.date_of_birth
    ? Math.floor((Date.now() - new Date(boy.date_of_birth as string).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="space-y-6">
      <Link href="/boys" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Boys
      </Link>

      <div className="flex items-start gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B4332]">
          <User className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B4332]">{boy.full_name}</h1>
            <Badge variant="secondary" className={
              boy.status === "active" ? "bg-green-100 text-green-800" :
              boy.status === "graduated" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
            }>
              {boy.status}
            </Badge>
          </div>
          <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
            {age && <span>Age {age}</span>}
            <span>{boy.schools?.name || "No school assigned"}</span>
            <span>{boy.county}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Guardian</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{boy.guardian_name || "—"}</p>
            <p className="text-sm text-muted-foreground">{boy.guardian_phone || "No phone"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Enrolled</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{new Date(boy.enrollment_date).toLocaleDateString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Current Mentor</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">
              {assignments.find((a) => a.status === "active")?.mentors?.full_name || "Unassigned"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes">Progress Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="mentors">Mentor History ({assignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Progress Note</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select name="category" required className="w-full rounded-md border px-3 py-2 text-sm">
                      <option value="academic">Academic</option>
                      <option value="emotional">Emotional</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="leadership">Leadership</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <select name="rating" required className="w-full rounded-md border px-3 py-2 text-sm">
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea name="note" required rows={3} />
                </div>
                <Button type="submit" className="bg-[#1B4332] hover:bg-[#1B4332]/90">Add Note</Button>
              </form>
            </CardContent>
          </Card>

          {notes.map((note) => {
            const Icon = categoryIcons[note.category as keyof typeof categoryIcons] || BookOpen;
            return (
              <Card key={note.id}>
                <CardContent className="flex gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4332]/10">
                    <Icon className="h-5 w-5 text-[#1B4332]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{note.category}</Badge>
                      <span className="text-sm text-muted-foreground">Rating: {note.rating}/5</span>
                      <span className="text-sm text-muted-foreground ml-auto">{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-sm">{note.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">By {note.mentors?.full_name}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="mentors">
          <Card>
            <CardContent className="pt-6">
              {assignments.length === 0 ? (
                <p className="text-muted-foreground">No mentor assignments yet</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{a.mentors?.full_name}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
