import { createClient } from "@/lib/supabase/server";
import { commentOnPlatform } from "@/lib/social";
import type { SocialAccount } from "@/lib/social";
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

  // Get post results with external IDs
  const { data: postResults } = await supabase
    .from("content_post_results")
    .select("*")
    .eq("post_id", id)
    .eq("status", "success");

  if (!postResults || postResults.length === 0) {
    return NextResponse.json({ error: "No successful posts to comment on" }, { status: 400 });
  }

  // Get social accounts
  const platforms = (post.platforms as string[]) || [];
  const { data: dbAccounts } = await supabase
    .from("social_accounts")
    .select("*")
    .in("platform", platforms)
    .eq("is_active", true);

  const accounts: SocialAccount[] = (dbAccounts || []).map((a) => ({
    platform: a.platform,
    accessToken: a.access_token_encrypted,
    refreshToken: a.refresh_token_encrypted || undefined,
    tokenExpiresAt: a.token_expires_at || undefined,
    accountName: a.account_name,
  }));

  const results = [];

  for (const postResult of postResults) {
    if (!postResult.external_post_id) continue;

    const account = accounts.find((a) => a.platform === postResult.platform);
    if (!account) continue;

    const result = await commentOnPlatform(postResult.platform, account, {
      platform: postResult.platform,
      externalPostId: postResult.external_post_id,
      comment: post.first_comment,
    });

    results.push({ platform: postResult.platform, ...result });
  }

  return NextResponse.json({ success: true, results });
}
