import { facebookAdapter } from "./facebook";
import { instagramAdapter } from "./instagram";
import { tiktokAdapter } from "./tiktok";
import { youtubeAdapter } from "./youtube";
import { twitterAdapter } from "./twitter";
import type { PlatformAdapter, SocialAccount, SocialPostRequest, SocialPostResult, SocialCommentRequest } from "./types";

const adapters: Record<string, PlatformAdapter> = {
  facebook: facebookAdapter,
  instagram: instagramAdapter,
  tiktok: tiktokAdapter,
  youtube: youtubeAdapter,
  twitter: twitterAdapter,
};

export function getAdapter(platform: string): PlatformAdapter | null {
  return adapters[platform] || null;
}

export async function publishToplatform(
  platform: string,
  account: SocialAccount,
  request: SocialPostRequest
): Promise<SocialPostResult> {
  const adapter = getAdapter(platform);
  if (!adapter) {
    return { success: false, errorMessage: `Unsupported platform: ${platform}` };
  }

  // Check if token needs refresh
  if (account.tokenExpiresAt && adapter.refreshToken) {
    const expiresAt = new Date(account.tokenExpiresAt);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
      try {
        const refreshed = await adapter.refreshToken(account);
        account.accessToken = refreshed.accessToken;
        if (refreshed.refreshToken) account.refreshToken = refreshed.refreshToken;
        if (refreshed.expiresAt) account.tokenExpiresAt = refreshed.expiresAt;
      } catch {
        // Continue with existing token
      }
    }
  }

  return adapter.post(account, request);
}

export async function commentOnPlatform(
  platform: string,
  account: SocialAccount,
  request: SocialCommentRequest
): Promise<SocialPostResult> {
  const adapter = getAdapter(platform);
  if (!adapter) {
    return { success: false, errorMessage: `Unsupported platform: ${platform}` };
  }
  return adapter.comment(account, request);
}

export async function publishToAllPlatforms(
  platforms: string[],
  accounts: SocialAccount[],
  request: Omit<SocialPostRequest, "platform">
): Promise<{ platform: string; result: SocialPostResult }[]> {
  const results: { platform: string; result: SocialPostResult }[] = [];

  for (const platform of platforms) {
    const account = accounts.find((a) => a.platform === platform);
    if (!account) {
      results.push({
        platform,
        result: { success: false, errorMessage: `No connected ${platform} account` },
      });
      continue;
    }

    const result = await publishToplatform(platform, account, { ...request, platform });
    results.push({ platform, result });

    // Small delay between platforms to avoid rate issues
    await new Promise((r) => setTimeout(r, 1000));
  }

  return results;
}
