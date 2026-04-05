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
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchMentors(); }, []);

  async function fetchMentors() {
    setLoading(true);
    const { data } = await supabase
      .from("mentors")
      .select("*, mentor_assignments(id, status)")
      .order("created_at", { ascending: false });
    setMentors(data || []);
    setLoading(false);
  }

  async function handleAddMentor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.from("mentors").insert({
      full_name: form.get("full_name") as string,
      phone: (form.get("phone") as string) || null,
      email: (form.get("email") as string) || null,
      expertise: (form.get("expertise") as string) || null,
      county: (form.get("county") as string) || null,
      is_active: true,
    });
    if (!error) {
      setDialogOpen(false);
      fetchMentors();
    }
  }

  const filtered = mentors.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Mentors</h1>
          <p className="text-muted-foreground">Manage mentor profiles and assignments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90">
              <Plus className="mr-2 h-4 w-4" /> Add Mentor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Mentor</DialogTitle></DialogHeader>
            <form onSubmit={handleAddMentor} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input name="full_name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="phone" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expertise</Label>
                  <Input name="expertise" placeholder="e.g. Career counseling" />
                </div>
                <div className="space-y-2">
                  <Label>County</Label>
                  <Input name="county" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90">Add Mentor</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search mentors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Assigned Boys</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No mentors found</TableCell></TableRow>
              ) : (
                filtered.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell className="font-medium">{mentor.full_name}</TableCell>
                    <TableCell>{mentor.expertise || "—"}</TableCell>
                    <TableCell>{mentor.county || "—"}</TableCell>
                    <TableCell>
                      {mentor.mentor_assignments?.filter((a: any) => a.status === "active").length || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={mentor.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {mentor.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/mentors/${mentor.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
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
