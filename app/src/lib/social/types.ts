export interface SocialPostRequest {
  platform: string;
  body: string;
  title?: string;
  mediaUrls: string[]; // URLs from Supabase Storage
  firstComment?: string;
}

export interface SocialPostResult {
  success: boolean;
  externalPostId?: string;
  postUrl?: string;
  errorMessage?: string;
}

export interface SocialCommentRequest {
  platform: string;
  externalPostId: string;
  comment: string;
}

export interface SocialAccount {
  platform: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  accountName: string;
  metadata?: Record<string, string>; // page_id, channel_id, etc.
}

export interface PlatformAdapter {
  post(account: SocialAccount, request: SocialPostRequest): Promise<SocialPostResult>;
  comment(account: SocialAccount, request: SocialCommentRequest): Promise<SocialPostResult>;
  refreshToken?(account: SocialAccount): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: string }>;
}
