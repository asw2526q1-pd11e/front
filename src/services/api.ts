// src/services/api.ts

export const API_URL = "/api/blog/api";
export const COMMUNITIES_API_URL = "/api/communities";
export const ACCOUNTS_API_URL = "/api/accounts";

// -------------------- TYPES --------------------

export interface Post {
  id: number;
  title: string;
  content: string;
  author?: string;
  author_id?: number;
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
  is_saved?: boolean;
  user_vote?: number; // -1 = downvote, 0 = no vote, 1 = upvote
}

export interface Community {
  id: number;
  name: string;
  avatar: string | null;
  banner: string | null;
  subs_count: number;
  posts_count: number;
  comments_count: number;
}

export interface UserProfile {
  user_id: number;
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
    headers['X-API-Key'] = apiKey;
  }

  return headers;
}

// -------------------- POSTS --------------------

export async function fetchPosts(
    apiKey?: string,
    filter: 'all' | 'subscribed' | 'local' = 'all',
    order: 'new' | 'old' | 'comments' | 'votes' = 'new'
): Promise<Post[]> {
  const params = new URLSearchParams({
    filter,
    order
  });

  const res = await fetch(`${API_URL}/posts/?${params.toString()}`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  const posts = await res.json();
  return posts;
}

export async function fetchPostDetail(id: number, apiKey?: string): Promise<Post> {
  const res = await fetch(`${API_URL}/posts/${id}/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch post detail");
  return res.json();
}

export async function createPost(
    apiKey: string,
    data: {
      title: string;
      content: string;
      url?: string;
      image?: File | null;
      communities: string[];
    }
): Promise<Post> {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('content', data.content);

  if (data.url) {
    formData.append('url', data.url);
  }

  if (data.image) {
    formData.append('image', data.image);
  }

  // Afegir comunitats (pot ser array buit)
  data.communities.forEach(community => {
    formData.append('communities', community);
  });

  const res = await fetch(`${API_URL}/posts/create/`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error ${res.status}: No s'ha pogut crear el post`);
  }

  return res.json();
}

export async function updatePost(
    apiKey: string,
    postId: number,
    data: {
      title?: string;
      content?: string;
      url?: string;
      image?: File;
      communities?: string[];
    }
): Promise<Post> {
  const formData = new FormData();

  // Solo añadir campos que tengan valor
  if (data.title && data.title.trim()) {
    formData.append('title', data.title.trim());
  }

  if (data.content && data.content.trim()) {
    formData.append('content', data.content.trim());
  }

  if (data.url && data.url.trim() && !data.url.includes('/blog/posts/') && !data.url.includes('/api/posts/')) {
    formData.append('url', data.url.trim());
  }

  if (data.image) {
    formData.append('image', data.image);
  }

  if (data.communities && data.communities.length > 0) {
    data.communities.forEach(community => {
      formData.append('communities', community);
    });
  }

  const res = await fetch(`${API_URL}/posts/${postId}/edit/`, {
    method: 'PATCH',
    headers: {
      'X-API-Key': apiKey,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { detail: errorText };
    }

    throw new Error(errorData.detail || `Error ${res.status}: Error actualitzant el post`);
  }

  const result = await res.json();

  return result;
}

// -------------------- POST VOTING --------------------

export async function upvotePost(apiKey: string, postId: number): Promise<{ votes: number }> {
  const res = await fetch(`${API_URL}/posts/${postId}/upvote/`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
  });
  if (!res.ok) throw new Error("Failed to upvote post");
  return res.json();
}

export async function downvotePost(apiKey: string, postId: number): Promise<{ votes: number }> {
  const res = await fetch(`${API_URL}/posts/${postId}/downvote/`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
  });
  if (!res.ok) throw new Error("Failed to downvote post");
  return res.json();
}

export async function deletePost(apiKey: string, postId: number): Promise<void> {
  const res = await fetch(`${API_URL}/posts/${postId}/delete/`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': apiKey,
    },
  });

  if (res.ok) {
    return;
  }


  try {
    const errorData = await res.json();
    throw new Error(errorData.detail || `Error ${res.status}: No s'ha pogut eliminar el post`);
  } catch (jsonError) {
    // Si no se puede parsear el JSON, lanzar error genérico
    throw new Error(`Error ${res.status}: No s'ha pogut eliminar el post`);
  }
}


// -------------------- COMMENTS --------------------

export async function fetchPostCommentsTree(
    postId: number,
    apiKey?: string,
    order: 'new' | 'old' | 'top' = 'new'
): Promise<Comment[]> {
  const params = new URLSearchParams({ order });

  const res = await fetch(`${API_URL}/posts/${postId}/comments_tree/?${params.toString()}`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch comments tree");
  return res.json();
}

export async function createComment(
    apiKey: string,
    postId: number,
    data: {
      content: string;
      parent_id?: number;
      image?: File | null;
    }
): Promise<Comment> {
  const formData = new FormData();

  formData.append('content', data.content);

  if (data.parent_id) {
    formData.append('parent_id', data.parent_id.toString());
  }

  if (data.image) {
    formData.append('image', data.image);
  }

  const res = await fetch(`${API_URL}/posts/${postId}/comments/create/`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `Error ${res.status}: No s'ha pogut crear el comentari`);
  }

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
    method: 'PUT',
    headers: {
      'X-API-Key': apiKey
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
      return [];
    }
    throw new Error("Failed to fetch user posts");
  }

  const posts = await res.json();

  const mappedPosts = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author_name || post.author,
    author_id: post.author_id,
    author_bio: post.author_bio,
    published_date: post.published_date,
    votes: post.votes,
    url: post.url,
    image: post.image_url || null,
    communities: post.communities || [],
    is_saved: post.is_saved ?? false,
  }));

  return mappedPosts;
}

// -------------------- SAVED POSTS --------------------
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

  const posts = await res.json();

  // Assignem is_saved: true i transformem image_url → image
  const mappedPosts = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author_name || post.author,
    author_id: post.author_id,
    author_bio: post.author_bio,
    published_date: post.published_date,
    votes: post.votes,
    url: post.url,
    image: post.image_url || null,
    communities: post.communities || [],
    is_saved: true, // sempre true perquè són desats
  }));

  return mappedPosts;
}


// -------------------- USER COMMENTS --------------------

export async function fetchUserComments(apiKey: string): Promise<Comment[]> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/me/comments/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch user comments");
  }
  const comments = await res.json();

  const mappedComments = comments.map((comment: any) => ({
    id: comment.id,
    post: comment.post,
    parent: comment.parent,
    content: comment.content,
    author: comment.author,
    published_date: comment.published_date,
    votes: comment.votes,
    url: comment.url,
    image: comment.image,
    is_saved: comment.is_saved ?? false,
  }));

  return mappedComments;
}

// -------------------- SAVED POSTS --------------------

export async function toggleSavePost(apiKey: string, postId: number): Promise<{ saved: boolean }> {
  const res = await fetch(`${ACCOUNTS_API_URL}/api/posts/${postId}/toggle_saved/`, {
    method: 'POST',
    headers: getAuthHeaders(apiKey)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Failed to toggle save post");
  }

  const result = await res.json();
  return result;
}

// -------------------- SAVED COMMENTS --------------------

export async function toggleSaveComment(apiKey: string, commentId: number): Promise<{ saved: boolean }> {
  const res = await fetch(`${ACCOUNTS_API_URL}/api/comments/${commentId}/toggle_saved/`, {
    method: 'POST',
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) {
    throw new Error("Failed to toggle save comment");
  }
  const result = await res.json();
  return result;
}

// -------------------- COMMUNITIES --------------------

export async function fetchSubscribedCommunities(apiKey: string): Promise<Community[]> {
  const res = await fetch(`${COMMUNITIES_API_URL}/communities/?filter=subscribed`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch subscribed communities");
  return res.json();
}

export async function fetchCommunities(apiKey: string, filter: 'all' | 'subscribed' | 'local' = 'all'): Promise<Community[]> {
  try {
    const res = await fetch(`${COMMUNITIES_API_URL}/communities/?filter=${filter}`, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${res.status}: No s'han pogut carregar les comunitats`);
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.communities)) {
      return data.communities;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
}

export async function createCommunity(
    apiKey: string,
    data: {
      name: string;
      avatar?: File;
      banner?: File;
    }
): Promise<Community> {
  const formData = new FormData();

  formData.append('name', data.name);

  if (data.avatar) {
    formData.append('avatar', data.avatar);
  }

  if (data.banner) {
    formData.append('banner', data.banner);
  }

  const res = await fetch(`${COMMUNITIES_API_URL}/api/communities/create/`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error creant la comunitat');
  }

  return res.json();
}

export async function fetchCommunityPosts(communityId: number, apiKey?: string): Promise<Post[]> {
  const res = await fetch(`${COMMUNITIES_API_URL}/communities/${communityId}/posts/`, {
    headers: getAuthHeaders(apiKey)
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Comunitat no trobada');
    }
    throw new Error('No s\'han pogut carregar els posts de la comunitat');
  }

  return res.json();
}

// -------------------- COMMENT VOTING --------------------

export async function upvoteComment(apiKey: string, commentId: number): Promise<{ votes: number; user_vote: number }> {
  const res = await fetch(`${API_URL}/comments/${commentId}/upvote/`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
  });
  if (!res.ok) throw new Error("Failed to upvote comment");
  return res.json();
}

export async function downvoteComment(apiKey: string, commentId: number): Promise<{ votes: number; user_vote: number }> {
  const res = await fetch(`${API_URL}/comments/${commentId}/downvote/`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
  });
  if (!res.ok) throw new Error("Failed to downvote comment");
  return res.json();
}
// -------------------- OTHER USER PROFILE --------------------

export async function fetchOtherUserProfile(apiKey: string, userId: number): Promise<UserProfile> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/${userId}/`, {
    headers: getAuthHeaders(apiKey)
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function fetchOtherUserPosts(apiKey: string, userId: number): Promise<Post[]> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/${userId}/posts/`, {
    headers: getAuthHeaders(apiKey)
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch user posts");
  }

  const posts = await res.json();

  const mappedPosts = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author_name || post.author,
    author_id: post.author_id,
    author_bio: post.author_bio,
    published_date: post.published_date,
    votes: post.votes,
    url: post.url,
    image: post.image_url || null,
    communities: post.communities || [],
    is_saved: post.is_saved ?? false,
  }));

  return mappedPosts;
}

export async function fetchOtherUserComments(apiKey: string, userId: number): Promise<Comment[]> {
  const res = await fetch(`${ACCOUNTS_API_URL}/users/${userId}/comments/`, {
    headers: getAuthHeaders(apiKey)
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error("Failed to fetch user comments");
  }

  const comments = await res.json();

  const mappedComments = comments.map((comment: any) => ({
    id: comment.id,
    post: comment.post,
    parent: comment.parent,
    content: comment.content,
    author: comment.author,
    published_date: comment.published_date,
    votes: comment.votes,
    url: comment.url,
    image: comment.image,
    is_saved: comment.is_saved ?? false,
  }));

  return mappedComments;
}

export const updateComment = async (apiKey: string, commentId: number, content: string, image?: File | null) => {
  const formData = new FormData();
  formData.append('content', content);

  if (image instanceof File) {
    formData.append('image', image);
  }

  const response = await fetch(`${API_URL.replace('/api', '')}/comments/${commentId}/edit/`, {
    method: 'PUT',
    headers: {
      'X-API-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error actualitzant el comentari');
  }

  return response.json();
};

export const deleteComment = async (apiKey: string, commentId: number) => {
  const response = await fetch(`${API_URL.replace('/api', '')}/comments/${commentId}/delete/`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error('Error eliminant el comentari');
  }

  // DELETE normalment retorna 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
};