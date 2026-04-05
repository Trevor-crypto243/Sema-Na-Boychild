"use client";

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
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";

type Boy = Database["public"]["Tables"]["boys"]["Row"] & { schools?: { name: string } | null };
type School = Database["public"]["Tables"]["schools"]["Row"];

export default function BoysPage() {
  const [boys, setBoys] = useState<Boy[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchBoys();
    fetchSchools();
  }, [statusFilter]);

  async function fetchBoys() {
    setLoading(true);
    let query = supabase
      .from("boys")
      .select("*, schools(name)")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as "active" | "graduated" | "inactive");
    }

    const { data } = await query;
    setBoys((data as Boy[]) || []);
    setLoading(false);
  }

  async function fetchSchools() {
    const { data } = await supabase.from("schools").select("*").eq("is_active", true);
    setSchools(data || []);
  }

  async function handleAddBoy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("boys").insert({
      full_name: form.get("full_name") as string,
      date_of_birth: (form.get("date_of_birth") as string) || null,
      school_id: (form.get("school_id") as string) || null,
      county: form.get("county") as string,
      sub_county: (form.get("sub_county") as string) || null,
      guardian_name: (form.get("guardian_name") as string) || null,
      guardian_phone: (form.get("guardian_phone") as string) || null,
      notes: (form.get("notes") as string) || null,
      enrollment_date: new Date().toISOString().split("T")[0],
      status: "active",
      created_by: user!.id,
    });

    if (!error) {
      setDialogOpen(false);
      fetchBoys();
    }
  }

  const filtered = boys.filter((b) =>
    b.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = { active: "bg-green-100 text-green-800", graduated: "bg-blue-100 text-blue-800", inactive: "bg-gray-100 text-gray-800" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Boys Database</h1>
          <p className="text-muted-foreground">Track and manage mentored boys</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90">
              <Plus className="mr-2 h-4 w-4" /> Add Boy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register New Boy</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBoy} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" name="full_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input id="date_of_birth" name="date_of_birth" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="county">County *</Label>
                  <Input id="county" name="county" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub_county">Sub-County</Label>
                  <Input id="sub_county" name="sub_county" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school_id">School</Label>
                <select name="school_id" className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">Select school...</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input id="guardian_name" name="guardian_name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input id="guardian_phone" name="guardian_phone" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
              <Button type="submit" className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90">
                Register Boy
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>School</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No boys found</TableCell>
                </TableRow>
              ) : (
                filtered.map((boy) => (
                  <TableRow key={boy.id}>
                    <TableCell className="font-medium">{boy.full_name}</TableCell>
                    <TableCell>{boy.schools?.name || "—"}</TableCell>
                    <TableCell>{boy.county}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColor[boy.status as keyof typeof statusColor]}>
                        {boy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(boy.enrollment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Link href={`/boys/${boy.id}`}>
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
