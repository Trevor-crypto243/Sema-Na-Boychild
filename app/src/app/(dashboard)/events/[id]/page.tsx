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
import { ArrowLeft, CalendarDays, MapPin, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

export default function EventDetailPage() {
  const { id: rawId } = useParams();
  const id = rawId as string;
  const [event, setEvent] = useState<any | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    const [evRes, attRes, notesRes, mediaRes] = await Promise.all([
      supabase.from("events").select("*, schools(name)").eq("id", id).single(),
      supabase.from("event_attendees").select("*, boys(full_name)").eq("event_id", id),
      supabase.from("event_notes").select("*").eq("event_id", id).order("created_at", { ascending: false }),
      supabase.from("event_media").select("*").eq("event_id", id).order("created_at", { ascending: false }),
    ]);
    setEvent(evRes.data);
    setAttendees(attRes.data || []);
    setNotes(notesRes.data || []);
    setMedia(mediaRes.data || []);
    setLoading(false);
  }

  async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("event_notes").insert({
      event_id: id as string,
      user_id: user!.id,
      note: form.get("note") as string,
    });
    e.currentTarget.reset();
    fetchData();
  }

  async function updateStatus(status: 'planned' | 'ongoing' | 'completed' | 'cancelled') {
    await supabase.from("events").update({ status }).eq("id", id);
    fetchData();
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!event) return <div className="p-8 text-center text-muted-foreground">Event not found</div>;

  const statusColor: Record<string, string> = { planned: "bg-blue-100 text-blue-800", ongoing: "bg-yellow-100 text-yellow-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };

  return (
    <div className="space-y-6">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B4332]">{event.title}</h1>
            <Badge variant="secondary" className={statusColor[event.status]}>{event.status}</Badge>
          </div>
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(event.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}, {event.county}</span>
            {event.start_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.start_time} - {event.end_time}</span>}
            {event.budget && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Budget: KES {Number(event.budget).toLocaleString()}</span>}
          </div>
          {event.description && <p className="mt-3 text-gray-600">{event.description}</p>}
        </div>
        <div className="flex gap-2">
          {event.status === "planned" && <Button onClick={() => updateStatus("ongoing")} className="bg-yellow-500 hover:bg-yellow-600">Start</Button>}
          {event.status === "ongoing" && <Button onClick={() => updateStatus("completed")} className="bg-green-600 hover:bg-green-700">Complete</Button>}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
          <TabsTrigger value="media">Media ({media.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Type</CardTitle></CardHeader>
              <CardContent><p className="font-medium capitalize">{event.event_type.replace("_", " ")}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">School</CardTitle></CardHeader>
              <CardContent><p className="font-medium">{event.schools?.name || "N/A"}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Actual Cost</CardTitle></CardHeader>
              <CardContent><p className="font-medium">{event.actual_cost ? `KES ${Number(event.actual_cost).toLocaleString()}` : "Not recorded"}</p></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendees">
          <Card>
            <CardContent className="pt-6">
              {attendees.length === 0 ? (
                <p className="text-muted-foreground">No attendees registered</p>
              ) : (
                <div className="space-y-2">
                  {attendees.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                      <span>{a.boys?.full_name}</span>
                      <Badge variant="secondary" className={a.attended ? "bg-green-100 text-green-800" : "bg-gray-100"}>
                        {a.attended ? "Attended" : "Registered"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardContent className="pt-6">
              {media.length === 0 ? (
                <p className="text-muted-foreground">No media uploaded yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {media.map(m => (
                    <div key={m.id} className="rounded-lg border p-2">
                      <p className="text-xs text-muted-foreground capitalize">{m.media_type}</p>
                      {m.caption && <p className="text-sm mt-1">{m.caption}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Note</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="flex gap-3">
                <Textarea name="note" required placeholder="Add an observation or note..." className="flex-1" rows={2} />
                <Button type="submit" className="bg-[#1B4332] hover:bg-[#1B4332]/90 self-end">Add</Button>
              </form>
            </CardContent>
          </Card>
          {notes.map(n => (
            <Card key={n.id}>
              <CardContent className="pt-6">
                <p className="text-sm">{n.note}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
