"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Target } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchCampaigns(); }, []);

  async function fetchCampaigns() {
    setLoading(true);
    const { data } = await supabase.from("donation_campaigns").select("*").order("created_at", { ascending: false });
    setCampaigns(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await supabase.from("donation_campaigns").insert({
      name: form.get("name") as string,
      description: (form.get("description") as string) || null,
      target_amount: parseFloat(form.get("target_amount") as string),
      raised_amount: 0,
      start_date: form.get("start_date") as string,
      end_date: (form.get("end_date") as string) || null,
      is_active: true,
    });
    setDialogOpen(false);
    fetchCampaigns();
  }

  return (
    <div className="space-y-6">
      <Link href="/donations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Donations
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Donation Campaigns</h1>
          <p className="text-muted-foreground">Create and manage fundraising campaigns</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90"><Plus className="mr-2 h-4 w-4" /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Name *</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" rows={3} /></div>
              <div className="space-y-2"><Label>Target Amount (KES) *</Label><Input name="target_amount" type="number" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date *</Label><Input name="start_date" type="date" required /></div>
                <div className="space-y-2"><Label>End Date</Label><Input name="end_date" type="date" /></div>
              </div>
              <Button type="submit" className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90">Create Campaign</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="col-span-2 text-center py-8 text-muted-foreground">Loading...</p>
        ) : campaigns.length === 0 ? (
          <p className="col-span-2 text-center py-8 text-muted-foreground">No campaigns yet</p>
        ) : (
          campaigns.map(c => {
            const progress = c.target_amount > 0 ? (Number(c.raised_amount) / Number(c.target_amount)) * 100 : 0;
            return (
              <Card key={c.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{c.name}</CardTitle>
                    {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                  </div>
                  <Badge variant="secondary" className={c.is_active ? "bg-green-100 text-green-800" : "bg-gray-100"}>
                    {c.is_active ? "Active" : "Ended"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-[#C1662D]" />
                    <span className="text-sm font-medium">KES {Number(c.raised_amount).toLocaleString()} / {Number(c.target_amount).toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div className="h-3 rounded-full bg-[#1B4332] transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{Math.round(progress)}% of goal</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
