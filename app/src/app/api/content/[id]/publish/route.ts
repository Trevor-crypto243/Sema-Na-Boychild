import { createClient } from "@/lib/supabase/server";
import { publishToAllPlatforms } from "@/lib/social";
import type { SocialAccount } from "@/lib/social";
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
  const mediaUrls = (post.media_urls as string[]) || [];

  // Get connected social accounts for requested platforms
  const { data: dbAccounts } = await supabase
    .from("social_accounts")
    .select("*")
    .in("platform", platforms)
    .eq("is_active", true);

  const accounts: SocialAccount[] = (dbAccounts || []).map((a) => ({
    platform: a.platform,
    accessToken: a.access_token_encrypted, // In production, decrypt this
    refreshToken: a.refresh_token_encrypted || undefined,
    tokenExpiresAt: a.token_expires_at || undefined,
    accountName: a.account_name,
    metadata: {}, // Load from settings_json if needed
  }));

  // Publish to all platforms
  const results = await publishToAllPlatforms(platforms, accounts, {
    body: post.body,
    title: post.title || undefined,
    mediaUrls,
    firstComment: post.first_comment || undefined,
  });

  // Save results to DB
  let hasSuccess = false;
  for (const { platform, result } of results) {
    await supabase.from("content_post_results").insert({
      post_id: id,
      platform,
      external_post_id: result.externalPostId || null,
      post_url: result.postUrl || null,
      status: result.success ? "success" : "failed",
      error_message: result.errorMessage || null,
      posted_at: result.success ? new Date().toISOString() : null,
    });

    // Update token if refreshed
    if (result.success) hasSuccess = true;

    // Auto-post first comment if post succeeded and comment exists
    if (result.success && post.first_comment && result.externalPostId) {
      const account = accounts.find((a) => a.platform === platform);
      if (account) {
        const { commentOnPlatform } = await import("@/lib/social");
        await commentOnPlatform(platform, account, {
          platform,
          externalPostId: result.externalPostId,
          comment: post.first_comment,
        });
      }
    }
  }

  // Update post status
  const newStatus = hasSuccess ? "posted" : "failed";
  await supabase
    .from("content_posts")
    .update({
      status: newStatus,
      posted_at: hasSuccess ? new Date().toISOString() : null,
    })
    .eq("id", id);

  return NextResponse.json({
    success: hasSuccess,
    results: results.map(({ platform, result }) => ({
      platform,
      success: result.success,
      postUrl: result.postUrl,
      error: result.errorMessage,
    })),
  });
}
