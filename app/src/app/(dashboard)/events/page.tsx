"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchEvents(); fetchSchools(); }, [typeFilter]);

  async function fetchEvents() {
    setLoading(true);
    let query = supabase.from("events").select("*, schools(name)").order("date", { ascending: false });
    if (typeFilter !== "all") query = query.eq("event_type", typeFilter as "seminar" | "school_visit" | "workshop" | "fundraiser" | "community");
    const { data } = await query;
    setEvents(data || []);
    setLoading(false);
  }

  async function fetchSchools() {
    const { data } = await supabase.from("schools").select("*").eq("is_active", true);
    setSchools(data || []);
  }

  async function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("events").insert({
      title: form.get("title") as string,
      description: (form.get("description") as string) || null,
      event_type: form.get("event_type") as "seminar" | "school_visit" | "workshop" | "fundraiser" | "community",
      school_id: (form.get("school_id") as string) || null,
      location: form.get("location") as string,
      county: form.get("county") as string,
      date: form.get("date") as string,
      start_time: (form.get("start_time") as string) || null,
      end_time: (form.get("end_time") as string) || null,
      budget: form.get("budget") ? parseFloat(form.get("budget") as string) : null,
      status: "planned",
      created_by: user!.id,
    });
    setDialogOpen(false);
    fetchEvents();
  }

  const statusColor = { planned: "bg-blue-100 text-blue-800", ongoing: "bg-yellow-100 text-yellow-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };
  const typeColor = { seminar: "bg-purple-100 text-purple-800", school_visit: "bg-[#1B4332]/10 text-[#1B4332]", workshop: "bg-orange-100 text-orange-800", fundraiser: "bg-pink-100 text-pink-800", community: "bg-teal-100 text-teal-800" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Events & Seminars</h1>
          <p className="text-muted-foreground">Plan and track school visits, seminars, and events</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90"><Plus className="mr-2 h-4 w-4" /> Create Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <select name="event_type" required className="w-full rounded-md border px-3 py-2 text-sm">
                    <option value="seminar">Seminar</option>
                    <option value="school_visit">School Visit</option>
                    <option value="workshop">Workshop</option>
                    <option value="fundraiser">Fundraiser</option>
                    <option value="community">Community Event</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>School (if applicable)</Label>
                  <select name="school_id" className="w-full rounded-md border px-3 py-2 text-sm">
                    <option value="">Select...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input name="location" required />
                </div>
                <div className="space-y-2">
                  <Label>County *</Label>
                  <Input name="county" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input name="start_time" type="time" />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input name="end_time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Budget (KES)</Label>
                <Input name="budget" type="number" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" rows={3} />
              </div>
              <Button type="submit" className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90">Create Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter by type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="seminar">Seminar</SelectItem>
              <SelectItem value="school_visit">School Visit</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="fundraiser">Fundraiser</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : events.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No events yet</TableCell></TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        {event.schools?.name && <p className="text-xs text-muted-foreground">{event.schools.name}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={typeColor[event.event_type as keyof typeof typeColor]}>
                        {event.event_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}, {event.county}</span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(event.date).toLocaleDateString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColor[event.status as keyof typeof statusColor]}>{event.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/events/${event.id}`}><Button variant="ghost" size="sm">View</Button></Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
