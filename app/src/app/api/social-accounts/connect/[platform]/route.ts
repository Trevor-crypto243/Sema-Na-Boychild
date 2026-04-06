import { NextRequest, NextResponse } from "next/server";

const OAUTH_CONFIGS: Record<string, { authUrl: string; scopes: string; clientIdEnv: string }> = {
  facebook: {
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    scopes: "pages_manage_posts,pages_read_engagement,pages_show_list,instagram_basic,instagram_content_publish",
    clientIdEnv: "FACEBOOK_APP_ID",
  },
  instagram: {
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    scopes: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
    clientIdEnv: "FACEBOOK_APP_ID",
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize",
    scopes: "user.info.basic,video.publish,video.upload",
    clientIdEnv: "TIKTOK_CLIENT_KEY",
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl",
    clientIdEnv: "GOOGLE_CLIENT_ID",
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: "tweet.read tweet.write users.read offline.access",
    clientIdEnv: "TWITTER_CLIENT_ID",
  },
};

export async function GET(_: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const config = OAUTH_CONFIGS[platform];

  if (!config) {
    return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
  }

  const clientId = process.env[config.clientIdEnv];
  if (!clientId || clientId.startsWith("your-")) {
    return NextResponse.json(
      {
        error: `${platform} is not configured yet.`,
        instructions: `Set ${config.clientIdEnv} in your .env.local file with your real API key. See PROGRESS.md for setup instructions.`,
      },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social-accounts/callback/${platform}`;
  const state = Buffer.from(JSON.stringify({ platform, ts: Date.now() })).toString("base64");

  let authUrl: string;

  if (platform === "tiktok") {
    authUrl = `${config.authUrl}?client_key=${clientId}&scope=${config.scopes}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  } else if (platform === "twitter") {
    // Twitter uses PKCE
    const codeVerifier = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const codeChallenge = Buffer.from(hash).toString("base64url");

    authUrl = `${config.authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(config.scopes)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  } else {
    authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(config.scopes)}&response_type=code&state=${state}&access_type=offline&prompt=consent`;
  }

  return NextResponse.redirect(authUrl);
}
