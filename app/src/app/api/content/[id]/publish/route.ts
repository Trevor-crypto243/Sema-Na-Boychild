import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Get the post
  const { data: post, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const platforms = post.platforms as string[];
  const results = [];

  // Post to each platform (placeholder - integrate actual APIs)
  for (const platform of platforms) {
    try {
      // TODO: Integrate actual social media APIs
      // For now, record as success placeholder
      const { data: result } = await supabase
        .from("content_post_results")
        .insert({
          post_id: id,
          platform,
          status: "success",
          posted_at: new Date().toISOString(),
        })
        .select()
        .single();

      results.push(result);
    } catch {
      await supabase.from("content_post_results").insert({
        post_id: id,
        platform,
        status: "failed",
        error_message: "Platform API not yet integrated",
      });
    }
  }

  // Update post status
  await supabase
    .from("content_posts")
    .update({ status: "posted", posted_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ success: true, results });
}
