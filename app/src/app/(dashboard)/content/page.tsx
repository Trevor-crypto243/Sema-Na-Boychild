"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ContentPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase
      .from("content_posts")
      .select("*, content_post_results(*)")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  const statusIcon = { draft: FileText, scheduled: Clock, posted: CheckCircle, failed: AlertCircle };
  const statusColor = { draft: "bg-gray-100 text-gray-800", scheduled: "bg-blue-100 text-blue-800", posted: "bg-green-100 text-green-800", failed: "bg-red-100 text-red-800" };

  const platformColors: Record<string, string> = {
    instagram: "bg-pink-100 text-pink-800",
    tiktok: "bg-gray-800 text-white",
    youtube: "bg-red-100 text-red-800",
    facebook: "bg-blue-100 text-blue-800",
    twitter: "bg-sky-100 text-sky-800",
  };

  function filterByStatus(status: string) {
    if (status === "all") return posts;
    return posts.filter(p => p.status === status);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">Content Management</h1>
          <p className="text-muted-foreground">Create and distribute content across social media</p>
        </div>
        <Link href="/content/new">
          <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90">
            <Plus className="mr-2 h-4 w-4" /> Create Post
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {(["draft", "scheduled", "posted", "failed"] as const).map((status) => {
          const Icon = statusIcon[status];
          const count = posts.filter(p => p.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="flex items-center gap-3 pt-6">
                <Icon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm capitalize text-muted-foreground">{status}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="posted">Posted</TabsTrigger>
        </TabsList>

        {["all", "draft", "scheduled", "posted"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : filterByStatus(tab).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No {tab === "all" ? "" : tab} posts yet.{" "}
                  <Link href="/content/new" className="text-[#1B4332] underline">Create one</Link>
                </CardContent>
              </Card>
            ) : (
              filterByStatus(tab).map(post => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className={statusColor[post.status as keyof typeof statusColor]}>
                            {post.status}
                          </Badge>
                          {(post.platforms as string[] || []).map((p: string) => (
                            <Badge key={p} variant="secondary" className={platformColors[p] || "bg-gray-100"}>
                              {p}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-medium">{post.title || "Untitled Post"}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                        {post.first_comment && (
                          <p className="mt-1 text-xs text-muted-foreground italic">First comment: {post.first_comment.substring(0, 80)}...</p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          {post.scheduled_at ? `Scheduled: ${new Date(post.scheduled_at).toLocaleString()}` : `Created: ${new Date(post.created_at).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
