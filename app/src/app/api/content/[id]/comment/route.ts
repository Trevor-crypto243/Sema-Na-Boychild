import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("content_posts")
    .select("first_comment, platforms")
    .eq("id", id)
    .single();

  if (!post?.first_comment) {
    return NextResponse.json({ error: "No first comment set" }, { status: 400 });
  }

  const platforms = post.platforms as string[];

  // Get post results to find external IDs
  await supabase
    .from("content_post_results")
    .select("*")
    .eq("post_id", id)
    .eq("status", "success");

  // TODO: For each platform, use the external_post_id to post the first comment
  // This requires integrating with each platform's comment/reply API

  return NextResponse.json({
    success: true,
    message: "First comment posting triggered",
    platforms,
    comment: post.first_comment,
  });
}
