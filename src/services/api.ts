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
  communities?: string[];
  is_saved?: boolean;
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

// -------------------- UPDATE USER PROFILE --------------------
export async function updateUserProfile(
    apiKey: string,
    data: {
      nombre?: string;
      bio?: string;
      avatar?: File | null;
      banner?: File | null;
    }
): Promise<UserProfile> {
  const formData = new FormData();

  if (data.nombre !== undefined) {
    formData.append('nombre', data.nombre);
  }

  if (data.bio !== undefined) {
    formData.append('bio', data.bio);
  }

  if (data.avatar instanceof File) {
    formData.append('avatar', data.avatar);
  }

  if (data.banner instanceof File) {
    formData.append('banner', data.banner);
  }

  const res = await fetch(`${ACCOUNTS_API_URL}/users/me/`, {
    method: 'PUT', // Canviado a PUT como indica el backend
    headers: {
      'X-API-Key': apiKey
      // NO incluimos Content-Type, el navegador lo añade automáticamente con el boundary
    },
    body: formData
  });

  if (!res.ok) throw new Error("Failed to update user profile");
  return res.json();
}

// -------------------- USER POSTS --------------------

export async function fetchUserPosts(apiKey: string): Promise<Post[]> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/me/posts/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) {
    if (res.status === 404) {
      return []; // Usuario sin posts
    }
    throw new Error("Failed to fetch user posts");
  }
  return res.json();
}

// -------------------- USER COMMENTS --------------------

export async function fetchUserComments(apiKey: string): Promise<Comment[]> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/me/comments/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) {
    if (res.status === 404) {
      return []; // Usuario sin comentarios
    }
    throw new Error("Failed to fetch user comments");
  }
  return res.json();
}

// -------------------- SAVED POSTS --------------------

export async function toggleSavePost(apiKey: string, postId: number): Promise<{ saved: boolean }> {
  const res = await fetch(`${ACCOUNTS_API_URL}/api/posts/${postId}/toggle_saved/`, {
    method: 'POST',
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to toggle save post");
  return res.json();
}

export async function fetchSavedPosts(apiKey: string): Promise<Post[]> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/me/saved-posts/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch saved posts");
  }
  return res.json();
}

// -------------------- SAVED COMMENTS --------------------

export async function toggleSaveComment(apiKey: string, commentId: number): Promise<{ saved: boolean }> {
  const res = await fetch(`${ACCOUNTS_API_URL}/api/comments/${commentId}/toggle_saved/`, {
    method: 'POST',
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to toggle save comment");
  return res.json();
}

export async function fetchSavedComments(apiKey: string): Promise<Comment[]> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/me/saved-comments/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch saved comments");
  }
  return res.json();
}

// -------------------- SUBSCRIBED COMMUNITIES --------------------

export async function fetchSubscribedCommunities(apiKey: string): Promise<Community[]> {
  const res = await fetch(`${COMMUNITIES_API_URL}/communities/?filter=subscribed`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch subscribed communities");
  return res.json();
}