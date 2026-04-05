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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function FinancePage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [expRes, donRes] = await Promise.all([
      supabase.from("expenses").select("*").order("created_at", { ascending: false }),
      supabase.from("donations").select("amount").eq("status", "completed"),
    ]);
    setExpenses(expRes.data || []);
    setTotalDonations(donRes.data?.reduce((s, d) => s + Number(d.amount), 0) || 0);
    setTotalExpenses((expRes.data || []).filter(e => e.status === "approved").reduce((s, e) => s + Number(e.amount), 0));
    setLoading(false);
  }

  async function handleAddExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("expenses").insert({
      category: form.get("category") as "transport" | "materials" | "venue" | "food" | "admin" | "other",
      amount: parseFloat(form.get("amount") as string),
      description: form.get("description") as string,
      status: "pending",
      created_by: user!.id,
    });
    setDialogOpen(false);
    fetchData();
  }

  async function handleApprove(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("expenses").update({ status: "approved", approved_by: user!.id }).eq("id", id);
    fetchData();
  }

  const balance = totalDonations - totalExpenses;
  const statusColor = { pending: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Finance Tracker</h1>
          <p className="text-muted-foreground">All money flows through the system</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90"><Plus className="mr-2 h-4 w-4" /> Log Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log New Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <select name="category" required className="w-full rounded-md border px-3 py-2 text-sm">
                    <option value="transport">Transport</option>
                    <option value="materials">Materials</option>
                    <option value="venue">Venue</option>
                    <option value="food">Food</option>
                    <option value="admin">Admin</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (KES) *</Label>
                  <Input name="amount" type="number" step="0.01" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea name="description" required rows={3} />
              </div>
              <Button type="submit" className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90">Submit Expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">KES {totalDonations.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">KES {totalExpenses.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-[#1B4332]" />
          </CardHeader>
          <CardContent><div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>KES {balance.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : expenses.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No expenses logged</TableCell></TableRow>
              ) : (
                expenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.description}</TableCell>
                    <TableCell className="capitalize">{exp.category}</TableCell>
                    <TableCell>KES {Number(exp.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColor[exp.status as keyof typeof statusColor]}>{exp.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(exp.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {exp.status === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(exp.id)} className="text-green-600">
                          Approve
                        </Button>
                      )}
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
