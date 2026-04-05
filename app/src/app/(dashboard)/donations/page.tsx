"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Heart, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchData(); }, [methodFilter]);

  async function fetchData() {
    setLoading(true);
    let query = supabase.from("donations").select("*").order("created_at", { ascending: false });
    if (methodFilter !== "all") query = query.eq("payment_method", methodFilter as "mpesa" | "stripe" | "cash" | "bank");
    const [donRes, campRes] = await Promise.all([
      query,
      supabase.from("donation_campaigns").select("*").order("created_at", { ascending: false }),
    ]);
    setDonations(donRes.data || []);
    setCampaigns(campRes.data || []);
    setLoading(false);
  }

  async function handleAddDonation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await supabase.from("donations").insert({
      donor_name: (form.get("donor_name") as string) || null,
      donor_phone: (form.get("donor_phone") as string) || null,
      donor_email: (form.get("donor_email") as string) || null,
      amount: parseFloat(form.get("amount") as string),
      currency: (form.get("currency") as string) as "KES" | "USD",
      payment_method: (form.get("payment_method") as string) as "mpesa" | "stripe" | "cash" | "bank",
      purpose: (form.get("purpose") as string) || null,
      status: "completed",
      is_anonymous: form.get("is_anonymous") === "on",
    });
    setDialogOpen(false);
    fetchData();
  }

  const totalCompleted = donations.filter(d => d.status === "completed").reduce((sum, d) => sum + Number(d.amount), 0);
  const thisMonth = donations
    .filter(d => d.status === "completed" && new Date(d.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const statusColor = { completed: "bg-green-100 text-green-800", pending: "bg-yellow-100 text-yellow-800", failed: "bg-red-100 text-red-800" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Donations</h1>
          <p className="text-muted-foreground">Track all donations and campaigns</p>
        </div>
        <div className="flex gap-2">
          <Link href="/donations/campaigns">
            <Button variant="outline">Campaigns</Button>
          </Link>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90">
                <Plus className="mr-2 h-4 w-4" /> Log Donation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Manual Donation</DialogTitle></DialogHeader>
              <form onSubmit={handleAddDonation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Donor Name</Label>
                    <Input name="donor_name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input name="donor_phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="donor_email" type="email" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input name="amount" type="number" step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <select name="currency" className="w-full rounded-md border px-3 py-2 text-sm">
                      <option value="KES">KES</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <select name="payment_method" className="w-full rounded-md border px-3 py-2 text-sm">
                      <option value="mpesa">M-Pesa</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Input name="purpose" placeholder="e.g. School visit to Nakuru" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="is_anonymous" id="is_anonymous" />
                  <Label htmlFor="is_anonymous">Anonymous donation</Label>
                </div>
                <Button type="submit" className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90">Save Donation</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Donations</CardTitle>
            <Heart className="h-4 w-4 text-[#C1662D]" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">KES {totalCompleted.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">KES {thisMonth.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Campaigns</CardTitle>
            <DollarSign className="h-4 w-4 text-[#D4A373]" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{campaigns.filter(c => c.is_active).length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by donor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={methodFilter} onValueChange={(v) => v && setMethodFilter(v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : donations.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No donations yet</TableCell></TableRow>
              ) : (
                donations
                  .filter(d => !search || (d.donor_name || "").toLowerCase().includes(search.toLowerCase()))
                  .map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.is_anonymous ? "Anonymous" : d.donor_name || "—"}</TableCell>
                      <TableCell>{d.currency} {Number(d.amount).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{d.payment_method}</TableCell>
                      <TableCell>{d.purpose || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColor[d.status as keyof typeof statusColor]}>{d.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
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
