import type { PlatformAdapter, SocialAccount, SocialPostRequest, SocialPostResult, SocialCommentRequest } from "./types";

const GRAPH_API = "https://graph.facebook.com/v19.0";

export const instagramAdapter: PlatformAdapter = {
  async post(account: SocialAccount, request: SocialPostRequest): Promise<SocialPostResult> {
    const igUserId = account.metadata?.instagram_user_id;
    if (!igUserId) {
      return { success: false, errorMessage: "No Instagram Business Account ID configured" };
    }

    try {
      if (request.mediaUrls.length === 0) {
        return { success: false, errorMessage: "Instagram requires at least one image or video" };
      }

      const mediaUrl = request.mediaUrls[0];
      const isVideo = mediaUrl.match(/\.(mp4|mov)$/i);

      // Step 1: Create media container
      const containerPayload: Record<string, string> = {
        caption: request.body,
        access_token: account.accessToken,
      };

      if (isVideo) {
        containerPayload.media_type = "REELS";
        containerPayload.video_url = mediaUrl;
      } else {
        containerPayload.image_url = mediaUrl;
      }

      // For carousel (multiple images)
      if (!isVideo && request.mediaUrls.length > 1) {
        // Create individual containers
        const childIds: string[] = [];
        for (const url of request.mediaUrls.slice(0, 10)) {
          const childRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: url,
              is_carousel_item: true,
              access_token: account.accessToken,
            }),
          });
          const childData = await childRes.json();
          if (childData.id) childIds.push(childData.id);
        }

        // Create carousel container
        const carouselRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            media_type: "CAROUSEL",
            children: childIds,
            caption: request.body,
            access_token: account.accessToken,
          }),
        });
        const carouselData = await carouselRes.json();
        if (carouselData.error) return { success: false, errorMessage: carouselData.error.message };

        // Step 2: Publish
        const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: carouselData.id,
            access_token: account.accessToken,
          }),
        });
        const publishData = await publishRes.json();
        if (publishData.error) return { success: false, errorMessage: publishData.error.message };
        return {
          success: true,
          externalPostId: publishData.id,
          postUrl: `https://instagram.com/p/${publishData.id}`,
        };
      }

      // Single media container
      const containerRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerPayload),
      });
      const containerData = await containerRes.json();
      if (containerData.error) return { success: false, errorMessage: containerData.error.message };

      // For video, wait for processing
      if (isVideo) {
        let status = "IN_PROGRESS";
        let attempts = 0;
        while (status === "IN_PROGRESS" && attempts < 30) {
          await new Promise((r) => setTimeout(r, 5000));
          const checkRes = await fetch(
            `${GRAPH_API}/${containerData.id}?fields=status_code&access_token=${account.accessToken}`
          );
          const checkData = await checkRes.json();
          status = checkData.status_code;
          attempts++;
        }
        if (status !== "FINISHED") {
          return { success: false, errorMessage: `Video processing failed: ${status}` };
        }
      }

      // Step 2: Publish the container
      const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: account.accessToken,
        }),
      });
      const publishData = await publishRes.json();
      if (publishData.error) return { success: false, errorMessage: publishData.error.message };

      return {
        success: true,
        externalPostId: publishData.id,
        postUrl: `https://instagram.com/p/${publishData.id}`,
      };
    } catch (err) {
      return { success: false, errorMessage: `Instagram API error: ${err}` };
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
      return { success: false, errorMessage: `Instagram comment error: ${err}` };
    }
  },
};
