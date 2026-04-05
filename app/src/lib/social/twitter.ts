import type { PlatformAdapter, SocialAccount, SocialPostRequest, SocialPostResult, SocialCommentRequest } from "./types";

const TWITTER_API = "https://api.twitter.com/2";
const TWITTER_UPLOAD = "https://upload.twitter.com/1.1";

export const twitterAdapter: PlatformAdapter = {
  async post(account: SocialAccount, request: SocialPostRequest): Promise<SocialPostResult> {
    try {
      const tweetPayload: Record<string, unknown> = {
        text: request.body.substring(0, 280),
      };

      // Upload media if present
      if (request.mediaUrls.length > 0) {
        const mediaIds: string[] = [];

        for (const url of request.mediaUrls.slice(0, 4)) {
          const mediaRes = await fetch(url);
          if (!mediaRes.ok) continue;

          const buffer = await mediaRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const contentType = mediaRes.headers.get("content-type") || "image/jpeg";

          // Init upload
          const initRes = await fetch(`${TWITTER_UPLOAD}/media/upload.json`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${account.accessToken}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              command: "INIT",
              total_bytes: buffer.byteLength.toString(),
              media_type: contentType,
            }),
          });
          const initData = await initRes.json();
          const mediaId = initData.media_id_string;
          if (!mediaId) continue;

          // Append
          await fetch(`${TWITTER_UPLOAD}/media/upload.json`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${account.accessToken}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              command: "APPEND",
              media_id: mediaId,
              segment_index: "0",
              media_data: base64,
            }),
          });

          // Finalize
          await fetch(`${TWITTER_UPLOAD}/media/upload.json`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${account.accessToken}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              command: "FINALIZE",
              media_id: mediaId,
            }),
          });

          mediaIds.push(mediaId);
        }

        if (mediaIds.length > 0) {
          tweetPayload.media = { media_ids: mediaIds };
        }
      }

      // Post tweet
      const res = await fetch(`${TWITTER_API}/tweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tweetPayload),
      });

      const data = await res.json();
      if (data.errors) {
        return { success: false, errorMessage: data.errors[0]?.message || "Tweet failed" };
      }

      const tweetId = data.data?.id;
      return {
        success: true,
        externalPostId: tweetId,
        postUrl: `https://twitter.com/i/status/${tweetId}`,
      };
    } catch (err) {
      return { success: false, errorMessage: `Twitter API error: ${err}` };
    }
  },

  async comment(account: SocialAccount, request: SocialCommentRequest): Promise<SocialPostResult> {
    try {
      // Reply tweet
      const res = await fetch(`${TWITTER_API}/tweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: request.comment.substring(0, 280),
          reply: {
            in_reply_to_tweet_id: request.externalPostId,
          },
        }),
      });

      const data = await res.json();
      if (data.errors) {
        return { success: false, errorMessage: data.errors[0]?.message || "Reply failed" };
      }
      return { success: true, externalPostId: data.data?.id };
    } catch (err) {
      return { success: false, errorMessage: `Twitter reply error: ${err}` };
    }
  },

  async refreshToken(account: SocialAccount) {
    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refreshToken || "",
      }),
    });
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    };
  },
};
