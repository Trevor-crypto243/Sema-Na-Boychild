import type { PlatformAdapter, SocialAccount, SocialPostRequest, SocialPostResult, SocialCommentRequest } from "./types";

const TIKTOK_API = "https://open.tiktokapis.com/v2";

export const tiktokAdapter: PlatformAdapter = {
  async post(account: SocialAccount, request: SocialPostRequest): Promise<SocialPostResult> {
    try {
      if (request.mediaUrls.length === 0) {
        return { success: false, errorMessage: "TikTok requires a video" };
      }

      const videoUrl = request.mediaUrls[0];

      // Step 1: Initialize video upload via URL
      const initRes = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: request.body.substring(0, 150),
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: videoUrl,
          },
        }),
      });

      const initData = await initRes.json();
      if (initData.error?.code) {
        return { success: false, errorMessage: `TikTok init error: ${initData.error.message}` };
      }

      const publishId = initData.data?.publish_id;
      if (!publishId) {
        return { success: false, errorMessage: "TikTok: No publish_id returned" };
      }

      // Step 2: Poll for publish status
      let status = "PROCESSING_UPLOAD";
      let attempts = 0;
      let postId = "";

      while (status === "PROCESSING_UPLOAD" && attempts < 30) {
        await new Promise((r) => setTimeout(r, 5000));

        const statusRes = await fetch(`${TIKTOK_API}/post/publish/status/fetch/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({ publish_id: publishId }),
        });

        const statusData = await statusRes.json();
        status = statusData.data?.status || "FAILED";
        postId = statusData.data?.publicaly_available_post_id?.[0] || "";
        attempts++;
      }

      if (status === "PUBLISH_COMPLETE" && postId) {
        return {
          success: true,
          externalPostId: postId,
          postUrl: `https://www.tiktok.com/@${account.accountName}/video/${postId}`,
        };
      }

      return { success: false, errorMessage: `TikTok publish status: ${status}` };
    } catch (err) {
      return { success: false, errorMessage: `TikTok API error: ${err}` };
    }
  },

  async comment(account: SocialAccount, request: SocialCommentRequest): Promise<SocialPostResult> {
    try {
      const res = await fetch(`${TIKTOK_API}/comment/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          video_id: request.externalPostId,
          text: request.comment,
        }),
      });

      const data = await res.json();
      if (data.error?.code) {
        return { success: false, errorMessage: `TikTok comment error: ${data.error.message}` };
      }
      return { success: true, externalPostId: data.data?.comment_id };
    } catch (err) {
      return { success: false, errorMessage: `TikTok comment error: ${err}` };
    }
  },

  async refreshToken(account: SocialAccount) {
    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY || "",
        client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
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
