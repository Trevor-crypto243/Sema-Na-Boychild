"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadMultipleMedia } from "@/lib/storage/upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Clock, Upload, X, Image, Video } from "lucide-react";
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
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(action: "draft" | "schedule" | "post") {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Upload media files
    let mediaUrls: string[] = [];
    if (files.length > 0) {
      setUploading(true);
      mediaUrls = await uploadMultipleMedia(files, "content");
      setUploading(false);
    }

    const status = action === "draft" ? "draft" : action === "schedule" ? "scheduled" : "draft";

    // Create the post
    const { data: post, error } = await supabase.from("content_posts").insert({
      title: title || null,
      body,
      media_urls: mediaUrls,
      platforms: selectedPlatforms,
      first_comment: firstComment || null,
      status,
      scheduled_at: action === "schedule" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      created_by: user!.id,
    }).select().single();

    if (error || !post) {
      setSaving(false);
      return;
    }

    // If "Post Now", trigger publish immediately
    if (action === "post") {
      const publishRes = await fetch(`/api/content/${post.id}/publish`, { method: "POST" });
      const publishData = await publishRes.json();

      if (publishData.success) {
        router.push("/content");
      } else {
        // Still redirect but show results
        router.push("/content");
      }
    } else {
      router.push("/content");
    }

    setSaving(false);
  }

  const isVideo = (file: File) => file.type.startsWith("video/");

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

          {/* Media Upload */}
          <div className="space-y-3">
            <Label>Media (photos & videos)</Label>
            <div
              className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-[#1B4332]/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click to upload photos or videos</p>
              <p className="text-xs text-gray-400">PNG, JPG, MP4, MOV up to 100MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {files.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {files.map((file, i) => (
                  <div key={i} className="relative rounded-lg border bg-gray-50 p-3 flex items-center gap-2">
                    {isVideo(file) ? (
                      <Video className="h-5 w-5 text-red-500" />
                    ) : (
                      <Image className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="text-sm max-w-[150px] truncate">{file.name}</span>
                    <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                    <button onClick={() => removeFile(i)} className="ml-1 text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                onClick={() => handleSubmit("schedule")}
                disabled={!body || selectedPlatforms.length === 0 || saving}
                className="text-blue-600"
              >
                <Clock className="mr-2 h-4 w-4" /> Schedule
              </Button>
            )}
            <Button
              onClick={() => handleSubmit("post")}
              disabled={!body || selectedPlatforms.length === 0 || saving}
              className="bg-[#1B4332] hover:bg-[#1B4332]/90"
            >
              <Send className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : saving ? "Publishing..." : "Post Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
