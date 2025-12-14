import { useEffect, useState } from "react";
import { fetchPosts } from "../services/api";
import PostCard from "../components/PostCard";
import { useAuth } from '../hooks/useAuth';
import CreatePostModal from '../components/CreatePostModal';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  const loadPosts = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadPosts();
  }, [user]);

  const handlePostCreated = () => {
    loadPosts(); // Recarregar posts després de crear-ne un
  };

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

  return (
      <div className="min-h-screen">
        {/* Botó flotant per crear post */}
        {user && (
            <button
                onClick={() => setShowCreateModal(true)}
                className="fixed bottom-8 right-8 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold px-6 py-4 rounded-full shadow-2xl hover:shadow-rose-500/50 hover:scale-110 transition-all duration-300 flex items-center gap-2 z-40"
            >
              <span className="text-2xl">✍️</span>
              <span className="hidden sm:inline">Crear Post</span>
            </button>
        )}

        {/* Timeline vertical */}
        <div className="max-w-2xl mx-auto pb-24">
          {posts.length === 0 ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <p className="text-roseTheme-dark text-2xl font-semibold mb-2">📭 Cap post disponible</p>
                  <p className="text-roseTheme-dark/60 mb-4">Sigues el primer en publicar!</p>
                  {user && (
                      <button
                          onClick={() => setShowCreateModal(true)}
                          className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition shadow-lg"
                      >
                        ✍️ Crear el primer post
                      </button>
                  )}
                </div>
              </div>
          ) : (
              <div className="divide-y divide-roseTheme-light bg-white border-x border-roseTheme-light">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
              </div>
          )}
        </div>

        {/* Modal de crear post */}
        {showCreateModal && user?.apiKey && (
            <CreatePostModal
                apiKey={user.apiKey}
                onClose={() => setShowCreateModal(false)}
                onPostCreated={handlePostCreated}
            />
        )}
      </div>
  );
}