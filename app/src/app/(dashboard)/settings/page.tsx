"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, Users, Share2 } from "lucide-react";

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [orgData, setOrgData] = useState({ name: "", address: "", phone: "", email: "" });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const [usersRes, orgRes, socialRes] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("organizations").select("*").limit(1).single(),
      supabase.from("social_accounts").select("platform").eq("is_active", true),
    ]);
    setUsers(usersRes.data || []);
    setConnectedAccounts((socialRes.data || []).map((a: any) => a.platform));
    if (orgRes.data) {
      setOrgData({
        name: orgRes.data.name || "",
        address: orgRes.data.address || "",
        phone: orgRes.data.phone || "",
        email: orgRes.data.email || "",
      });
    }
  }

  async function handleDisconnect(platform: string) {
    await supabase.from("social_accounts").delete().eq("platform", platform);
    setConnectedAccounts(prev => prev.filter(p => p !== platform));
  }

  async function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault();
    const { data: existing } = await supabase.from("organizations").select("id").limit(1).single();
    if (existing) {
      await supabase.from("organizations").update(orgData).eq("id", existing.id);
    } else {
      await supabase.from("organizations").insert(orgData);
    }
  }

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const role = form.get("role") as string;
    const full_name = form.get("full_name") as string;

    // Create auth user via Supabase admin (requires service role in API route)
    const res = await fetch("/api/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, full_name }),
    });

    if (res.ok) {
      setInviteOpen(false);
      fetchData();
    }
  }

  const roleColor = { admin: "bg-red-100 text-red-800", coordinator: "bg-blue-100 text-blue-800", mentor: "bg-green-100 text-green-800" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B4332]">Settings</h1>
        <p className="text-muted-foreground">Manage organization, users, and integrations</p>
      </div>

      <Tabs defaultValue="organization">
        <TabsList>
          <TabsTrigger value="organization" className="gap-2"><Building className="h-4 w-4" />Organization</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2"><Share2 className="h-4 w-4" />Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Update your NGO information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveOrg} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input value={orgData.name} onChange={e => setOrgData({ ...orgData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={orgData.address} onChange={e => setOrgData({ ...orgData, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={orgData.phone} onChange={e => setOrgData({ ...orgData, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={orgData.email} onChange={e => setOrgData({ ...orgData, email: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="bg-[#1B4332] hover:bg-[#1B4332]/90">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Users & Team</CardTitle>
                <CardDescription>Manage team members and their roles</CardDescription>
              </div>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90"><Plus className="mr-2 h-4 w-4" />Invite User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Invite New User</DialogTitle></DialogHeader>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input name="full_name" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Role *</Label>
                      <select name="role" required className="w-full rounded-md border px-3 py-2 text-sm">
                        <option value="mentor">Mentor</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90">Send Invite</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleColor[u.role as keyof typeof roleColor]}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={u.is_active ? "bg-green-100 text-green-800" : "bg-gray-100"}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>M-Pesa (Daraja API)</CardTitle>
                <CardDescription>Configure M-Pesa payment integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Consumer Key</Label>
                  <Input type="password" placeholder="Set in .env.local" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Consumer Secret</Label>
                  <Input type="password" placeholder="Set in .env.local" disabled />
                </div>
                <p className="text-xs text-muted-foreground">Payment credentials are managed via environment variables for security</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Social Media Accounts</CardTitle>
                <CardDescription>Connect your social media for auto-posting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Instagram", id: "instagram" },
                  { label: "TikTok", id: "tiktok" },
                  { label: "YouTube", id: "youtube" },
                  { label: "Facebook", id: "facebook" },
                  { label: "Twitter/X", id: "twitter" },
                ].map(platform => {
                  const connected = connectedAccounts.includes(platform.id);
                  return (
                    <div key={platform.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{platform.label}</span>
                        {connected && <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Connected</Badge>}
                      </div>
                      <div className="flex gap-2">
                        {connected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDisconnect(platform.id)}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/social-accounts/connect/${platform.id}`, '_blank')}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
