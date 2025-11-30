// src/services/api.ts

export const API_URL = "/api";
export const COMMUNITIES_API_URL = "/api/communities";
export const ACCOUNTS_API_URL = "/api/accounts";

// -------------------- TYPES --------------------

export interface Post {
  id: number;
  title: string;
  content: string;
  author?: string;
  published_date?: string;
  votes: number;
  url: string;
  image?: string | null;
  communities?: { id: number; name: string }[];
}

export interface Comment {
  id: number;
  post: number;
  parent?: number | null;
  content: string;
  author?: string;
  published_date?: string;
  votes: number;
  url?: string;
  image?: string | null;
  replies?: Comment[];
}

export interface Community {
  id: number;
  name: string;
  description: string;
  subscribers?: number;
  created_date?: string;
}

export interface UserProfile {
  username: string;
  nombre: string;
  bio: string;
  avatar: string | null;
  banner: string | null;
  api_key: string;
}

// -------------------- HELPER --------------------

// Helper per afegir l'API key als headers
function getAuthHeaders(apiKey?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['X-API-Key'] = apiKey; // Canviat de Authorization a X-API-Key
  }
  
  return headers;
}

// -------------------- POSTS --------------------

export async function fetchPosts(apiKey?: string): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchPostDetail(id: number, apiKey?: string): Promise<Post> {
  const res = await fetch(`${API_URL}/posts/${id}/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch post detail");
  return res.json();
}

// -------------------- COMMENTS --------------------

export async function fetchPostComments(postId: number, apiKey?: string): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/posts/${postId}/comments/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function fetchPostCommentsTree(postId: number, apiKey?: string): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/posts/${postId}/comments/tree/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch comments tree");
  return res.json();
}

// -------------------- COMMUNITIES --------------------

export async function fetchCommunities(apiKey?: string): Promise<Community[]> {
  const res = await fetch(`${COMMUNITIES_API_URL}/communities/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch communities");
  return res.json();
}

export async function fetchCommunityDetail(id: number, apiKey?: string): Promise<Community> {
  const res = await fetch(`${COMMUNITIES_API_URL}/communities/${id}/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch community detail");
  return res.json();
}

// -------------------- SEARCH --------------------

export async function searchPostsComments(query: string, type: 'posts' | 'comments' | 'both' = 'both', apiKey?: string) {
  const res = await fetch(`${API_URL}/search/?q=${encodeURIComponent(query)}&type=${type}`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to search posts/comments");
  return res.json();
}

// -------------------- USER PROFILE --------------------

export async function fetchUserProfile(apiKey: string): Promise<UserProfile> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/me/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}