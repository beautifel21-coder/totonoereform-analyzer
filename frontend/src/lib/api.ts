const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export type Platform = "instagram" | "x";

export interface Competitor {
  id: number;
  username: string;
  display_name: string | null;
  platform: Platform;
  category: string;
  note: string | null;
}

export interface EngagementRow {
  username: string;
  avg_engagement: number;
  post_count: number;
  avg_likes: number;
  avg_comments: number;
}

export interface HashtagRow {
  tag: string;
  count: number;
  avg_engagement: number;
}

export interface ContentTypeRow {
  content_type: string;
  count: number;
  avg_engagement: number;
  avg_likes: number;
}

export interface TopPost {
  username: string;
  content_type: string;
  caption: string;
  hashtags: string[];
  like_count: number;
  comment_count: number;
  engagement_rate: number;
  posted_at: string | null;
}

export const api = {
  competitors: {
    list: () => get<Competitor[]>("/competitors/"),
    create: (data: Omit<Competitor, "id">) => post<Competitor>("/competitors/", data),
    delete: (id: number) => del<{ ok: boolean }>(`/competitors/${id}`),
  },
  fetch: {
    one: (id: number) => post<{ ok: boolean; posts_fetched: number; followers: number }>(`/fetch/${id}`),
    all: () => post<{ username: string; ok: boolean }[]>("/fetch/all"),
  },
  analytics: {
    followerTrends: (platform?: Platform, days = 90) => {
      const q = new URLSearchParams({ days: String(days) });
      if (platform) q.set("platform", platform);
      return get<Record<string, { date: string; followers: number }[]>>(`/analytics/follower-trends?${q}`);
    },
    engagement: (platform?: Platform, days = 30) => {
      const q = new URLSearchParams({ days: String(days) });
      if (platform) q.set("platform", platform);
      return get<EngagementRow[]>(`/analytics/engagement?${q}`);
    },
    hashtags: (platform?: Platform, days = 30, top = 30) => {
      const q = new URLSearchParams({ days: String(days), top: String(top) });
      if (platform) q.set("platform", platform);
      return get<HashtagRow[]>(`/analytics/hashtags?${q}`);
    },
    contentTypes: (platform?: Platform, days = 30) => {
      const q = new URLSearchParams({ days: String(days) });
      if (platform) q.set("platform", platform);
      return get<ContentTypeRow[]>(`/analytics/content-types?${q}`);
    },
    topPosts: (platform?: Platform, days = 30) => {
      const q = new URLSearchParams({ days: String(days) });
      if (platform) q.set("platform", platform);
      return get<TopPost[]>(`/analytics/top-posts?${q}`);
    },
    postFrequency: (platform?: Platform, days = 30) => {
      const q = new URLSearchParams({ days: String(days) });
      if (platform) q.set("platform", platform);
      return get<Record<string, { date: string; count: number }[]>>(`/analytics/post-frequency?${q}`);
    },
  },
  exportCsv: () => `${BASE}/export/posts.csv`,
};
