import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_ENDPOINTS: Record<string, { url: string; clientIdEnv: string; clientSecretEnv: string }> = {
  facebook: { url: "https://graph.facebook.com/v19.0/oauth/access_token", clientIdEnv: "FACEBOOK_APP_ID", clientSecretEnv: "FACEBOOK_APP_SECRET" },
  instagram: { url: "https://graph.facebook.com/v19.0/oauth/access_token", clientIdEnv: "FACEBOOK_APP_ID", clientSecretEnv: "FACEBOOK_APP_SECRET" },
  tiktok: { url: "https://open.tiktokapis.com/v2/oauth/token/", clientIdEnv: "TIKTOK_CLIENT_KEY", clientSecretEnv: "TIKTOK_CLIENT_SECRET" },
  youtube: { url: "https://oauth2.googleapis.com/token", clientIdEnv: "GOOGLE_CLIENT_ID", clientSecretEnv: "GOOGLE_CLIENT_SECRET" },
  twitter: { url: "https://api.twitter.com/2/oauth2/token", clientIdEnv: "TWITTER_CLIENT_ID", clientSecretEnv: "TWITTER_CLIENT_SECRET" },
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=${error || "no_code"}`);
  }

  const config = TOKEN_ENDPOINTS[platform];
  if (!config) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=unsupported_platform`);
  }

  const clientId = process.env[config.clientIdEnv] || "";
  const clientSecret = process.env[config.clientSecretEnv] || "";
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social-accounts/callback/${platform}`;

  try {
    let tokenData: Record<string, string>;

    if (platform === "tiktok") {
      const res = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });
      tokenData = await res.json();
    } else if (platform === "twitter") {
      const res = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: "challenge", // In production, retrieve from session
        }),
      });
      tokenData = await res.json();
    } else {
      // Facebook, Instagram, YouTube (Google)
      const res = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });
      tokenData = await res.json();
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || null;
    const expiresIn = parseInt(tokenData.expires_in || "0");

    if (!accessToken) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_token`);
    }

    // Get account name based on platform
    let accountName = platform;
    if (platform === "facebook" || platform === "instagram") {
      const meRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
      const meData = await meRes.json();
      accountName = meData.name || platform;
    } else if (platform === "youtube") {
      const meRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const meData = await meRes.json();
      accountName = meData.items?.[0]?.snippet?.title || platform;
    } else if (platform === "twitter") {
      const meRes = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const meData = await meRes.json();
      accountName = meData.data?.username || platform;
    } else if (platform === "tiktok") {
      accountName = tokenData.open_id || platform;
    }

    // Save to database
    const supabase = await createClient();
    await supabase.from("social_accounts").upsert(
      {
        platform,
        account_name: accountName,
        access_token_encrypted: accessToken, // In production, encrypt this
        refresh_token_encrypted: refreshToken,
        token_expires_at: expiresIn > 0
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : null,
        is_active: true,
      },
      { onConflict: "platform" }
    );

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=${platform}`);
  } catch (err) {
    console.error(`OAuth callback error for ${platform}:`, err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=token_exchange_failed`);
  }
}
