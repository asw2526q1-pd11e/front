import { useEffect, useState } from "react";
import { fetchPosts } from "../services/api";
import PostCard from "../components/PostCard";
import { useAuth } from '../hooks/useAuth';

interface Post {
  id: number;
  title: string;
  content: string;
  author?: string;
  published_date?: string;
  votes: number;
  url: string;
  image?: string | null;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts(user?.apiKey)
      .then(data => {
        setPosts(data);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
        setError(err.message || "No s'han pogut carregar els posts");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
          <p className="text-roseTheme-dark text-lg">Carregant posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-5 rounded-xl max-w-md w-full shadow-lg">
          <h2 className="font-bold text-xl mb-3">❌ Error</h2>
          <p className="mb-3">{error}</p>
          <p className="text-sm mb-4 text-red-600">
            Assegura't que el backend Django està corrent a http://127.0.0.1:8000
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition"
          >
            🔄 Recarregar
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-roseTheme-dark text-2xl font-semibold mb-2">📭 Cap post disponible</p>
          <p className="text-roseTheme-dark/60">Sigues el primer en publicar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Timeline vertical */}
      <div className="max-w-2xl mx-auto">
        <div className="divide-y divide-roseTheme-light bg-white border-x border-roseTheme-light">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}