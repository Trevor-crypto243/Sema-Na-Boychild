import type { PlatformAdapter, SocialAccount, SocialPostRequest, SocialPostResult, SocialCommentRequest } from "./types";

const YT_API = "https://www.googleapis.com/youtube/v3";
const YT_UPLOAD = "https://www.googleapis.com/upload/youtube/v3";

export const youtubeAdapter: PlatformAdapter = {
  async post(account: SocialAccount, request: SocialPostRequest): Promise<SocialPostResult> {
    try {
      if (request.mediaUrls.length === 0) {
        return { success: false, errorMessage: "YouTube requires a video file" };
      }

      const videoUrl = request.mediaUrls[0];

      // Step 1: Download video to upload
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) {
        return { success: false, errorMessage: "Failed to fetch video for YouTube upload" };
      }
      const videoBuffer = await videoRes.arrayBuffer();

      // Step 2: Initialize resumable upload
      const initRes = await fetch(
        `${YT_UPLOAD}/videos?uploadType=resumable&part=snippet,status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Type": "video/*",
            "X-Upload-Content-Length": videoBuffer.byteLength.toString(),
          },
          body: JSON.stringify({
            snippet: {
              title: request.title || request.body.substring(0, 100),
              description: request.body,
              tags: ["SemaNaBoychild", "MentoringBoys", "Kenya"],
              categoryId: "22", // People & Blogs
            },
            status: {
              privacyStatus: "public",
              selfDeclaredMadeForKids: false,
            },
          }),
        }
      );

      if (!initRes.ok) {
        const err = await initRes.text();
        return { success: false, errorMessage: `YouTube init error: ${err}` };
      }

      const uploadUrl = initRes.headers.get("Location");
      if (!uploadUrl) {
        return { success: false, errorMessage: "YouTube: No upload URL returned" };
      }

      // Step 3: Upload the video
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "video/*",
          "Content-Length": videoBuffer.byteLength.toString(),
        },
        body: videoBuffer,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.error) {
        return { success: false, errorMessage: `YouTube upload error: ${uploadData.error.message}` };
      }

      return {
        success: true,
        externalPostId: uploadData.id,
        postUrl: `https://youtube.com/watch?v=${uploadData.id}`,
      };
    } catch (err) {
      return { success: false, errorMessage: `YouTube API error: ${err}` };
    }
  },

  async comment(account: SocialAccount, request: SocialCommentRequest): Promise<SocialPostResult> {
    try {
      const res = await fetch(`${YT_API}/commentThreads?part=snippet`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            videoId: request.externalPostId,
            topLevelComment: {
              snippet: {
                textOriginal: request.comment,
              },
            },
          },
        }),
      });

      const data = await res.json();
      if (data.error) {
        return { success: false, errorMessage: `YouTube comment error: ${data.error.message}` };
      }
      return { success: true, externalPostId: data.id };
    } catch (err) {
      return { success: false, errorMessage: `YouTube comment error: ${err}` };
    }
  },

  async refreshToken(account: SocialAccount) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: account.refreshToken || "",
      }),
    });
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: account.refreshToken || "",
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    };
  },
};
