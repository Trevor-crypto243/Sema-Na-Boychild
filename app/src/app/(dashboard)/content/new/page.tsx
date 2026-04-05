"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Clock } from "lucide-react";
import Link from "next/link";

const platforms = [
  { id: "instagram", label: "Instagram", color: "bg-pink-500" },
  { id: "tiktok", label: "TikTok", color: "bg-gray-900" },
  { id: "youtube", label: "YouTube", color: "bg-red-500" },
  { id: "facebook", label: "Facebook", color: "bg-blue-600" },
  { id: "twitter", label: "Twitter/X", color: "bg-sky-500" },
];

export default function NewContentPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(status: "draft" | "scheduled" | "posted") {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("content_posts").insert({
      title: title || null,
      body,
      media_urls: [],
      platforms: selectedPlatforms,
      first_comment: firstComment || null,
      status,
      scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      posted_at: status === "posted" ? new Date().toISOString() : null,
      created_by: user!.id,
    });

    if (!error) {
      router.push("/content");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/content" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Content
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1B4332]">Create New Post</h1>
        <p className="text-muted-foreground">Write content and distribute across social media platforms</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Post Content</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Title (optional)</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..." />
          </div>

          <div className="space-y-2">
            <Label>Body / Caption *</Label>
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your post content here..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>First Comment (auto-posted as first comment on each platform)</Label>
            <Textarea
              value={firstComment}
              onChange={e => setFirstComment(e.target.value)}
              placeholder="e.g. #SemaNaBoychild #MentoringBoys #Kenya ..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              The system will automatically post this as the first comment on every selected platform
            </p>
          </div>

          <div className="space-y-3">
            <Label>Target Platforms</Label>
            <div className="flex flex-wrap gap-3">
              {platforms.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                    selectedPlatforms.includes(p.id)
                      ? `${p.color} text-white border-transparent`
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Schedule (optional)</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={!body || saving}
            >
              Save as Draft
            </Button>
            {scheduledAt && (
              <Button
                variant="outline"
                onClick={() => handleSubmit("scheduled")}
                disabled={!body || selectedPlatforms.length === 0 || saving}
                className="text-blue-600"
              >
                <Clock className="mr-2 h-4 w-4" /> Schedule
              </Button>
            )}
            <Button
              onClick={() => handleSubmit("posted")}
              disabled={!body || selectedPlatforms.length === 0 || saving}
              className="bg-[#1B4332] hover:bg-[#1B4332]/90"
            >
              <Send className="mr-2 h-4 w-4" /> Post Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
