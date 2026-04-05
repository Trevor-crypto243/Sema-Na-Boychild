import type { PlatformAdapter, SocialAccount, SocialPostRequest, SocialPostResult, SocialCommentRequest } from "./types";

const GRAPH_API = "https://graph.facebook.com/v19.0";

export const facebookAdapter: PlatformAdapter = {
  async post(account: SocialAccount, request: SocialPostRequest): Promise<SocialPostResult> {
    const pageId = account.metadata?.page_id;
    if (!pageId) {
      return { success: false, errorMessage: "No Facebook Page ID configured" };
    }

    try {
      // If media is present, post with photo/video
      if (request.mediaUrls.length > 0) {
        const mediaUrl = request.mediaUrls[0];
        const isVideo = mediaUrl.match(/\.(mp4|mov|avi|wmv)$/i);

        if (isVideo) {
          // Video post
          const res = await fetch(`${GRAPH_API}/${pageId}/videos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_url: mediaUrl,
              description: request.body,
              access_token: account.accessToken,
            }),
          });
          const data = await res.json();
          if (data.error) return { success: false, errorMessage: data.error.message };
          return {
            success: true,
            externalPostId: data.id,
            postUrl: `https://facebook.com/${data.id}`,
          };
        } else {
          // Photo post
          const res = await fetch(`${GRAPH_API}/${pageId}/photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: mediaUrl,
              message: request.body,
              access_token: account.accessToken,
            }),
          });
          const data = await res.json();
          if (data.error) return { success: false, errorMessage: data.error.message };
          return {
            success: true,
            externalPostId: data.post_id || data.id,
            postUrl: `https://facebook.com/${data.post_id || data.id}`,
          };
        }
      }

      // Text-only post
      const res = await fetch(`${GRAPH_API}/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: request.body,
          access_token: account.accessToken,
        }),
      });
      const data = await res.json();
      if (data.error) return { success: false, errorMessage: data.error.message };
      return {
        success: true,
        externalPostId: data.id,
        postUrl: `https://facebook.com/${data.id}`,
      };
    } catch (err) {
      return { success: false, errorMessage: `Facebook API error: ${err}` };
    }
  },

  async comment(account: SocialAccount, request: SocialCommentRequest): Promise<SocialPostResult> {
    try {
      const res = await fetch(`${GRAPH_API}/${request.externalPostId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: request.comment,
          access_token: account.accessToken,
        }),
      });
      const data = await res.json();
      if (data.error) return { success: false, errorMessage: data.error.message };
      return { success: true, externalPostId: data.id };
    } catch (err) {
      return { success: false, errorMessage: `Facebook comment error: ${err}` };
    }
  },
};
