import { getToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postForm<T>(path: string, body: Record<string, string>): Promise<T> {
  const form = new URLSearchParams(body);
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "エラーが発生しました" }));
    throw new Error(err.detail ?? "エラーが発生しました");
  }
  return res.json();
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
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

export interface SearchedAccount {
  username: string;
  display_name: string;
  followers: number;
  post_count: number;
  avg_likes: number;
  top_likes: number;
  avg_engagement: number;
  buzz_score: number;
  platform: Platform;
}

export interface TopPost {
  username: string;
  content_type: string;
  caption: string;
  hashtags: string[];
  like_count: number;
  comment_count: number;
  repost_count?: number;
  engagement_rate: number;
  posted_at: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: { id: number; email: string; created_at: string };
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      post<AuthToken>("/auth/register", { email, password }),
    login: (email: string, password: string) =>
      postForm<AuthToken>("/auth/login", { username: email, password }),
  },
  competitors: {
    list: () => get<Competitor[]>("/competitors/"),
    create: (data: Omit<Competitor, "id">) => post<Competitor>("/competitors/", data),
    delete: (id: number) => del<{ ok: boolean }>(`/competitors/${id}`),
    recordSnapshot: (id: number, follower_count: number) =>
      post<{ ok: boolean }>(`/competitors/${id}/snapshot`, { follower_count }),
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
  search: {
    accounts: (hashtags: string, minFollowers: number) => {
      const q = new URLSearchParams({ hashtags, min_followers: String(minFollowers) });
      return get<SearchedAccount[]>(`/search/accounts?${q}`);
    },
  },
  billing: {
    me: () => get<{ plan: string; limit: number }>("/billing/me"),
    checkout: (plan: string) =>
      post<{ url: string }>("/billing/checkout", {
        plan,
        success_url: `${window.location.origin}/pricing?success=1`,
        cancel_url: `${window.location.origin}/pricing`,
      }),
    portal: () => post<{ url: string }>("/billing/portal", {}),
  },
  exportCsv: () => {
    const token = getToken();
    return `${BASE}/export/posts.csv${token ? `?token=${token}` : ""}`;
  },
};
