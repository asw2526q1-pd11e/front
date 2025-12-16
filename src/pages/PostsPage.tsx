import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPosts, toggleSavePost as apiToggleSavePost } from "../services/api";
import { useAuth } from '../hooks/useAuth';
import CreatePostModal from '../components/CreatePostModal';
import EditPostModal from '../components/EditPostModal';

interface Post {
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

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

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
        loadPosts();
    };

    const handlePostUpdated = () => {
        loadPosts();
        setEditingPost(null);
    };

    const handleEditPost = (post: Post) => {
        setEditingPost(post);
    };

    const toggleSavePost = async (postId: number) => {
        if (!user?.apiKey) return;

        try {
            const result = await apiToggleSavePost(user.apiKey, postId);

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId ? { ...post, is_saved: result.saved } : post
                )
            );
        } catch (err) {
            console.error('Error guardant post:', err);
        }
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
        <div className="min-h-screen bg-gray-50">
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
            <div className="max-w-3xl mx-auto px-4 py-8">
                {posts.length === 0 ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-roseTheme-dark text-2xl font-semibold mb-2">Cap post disponible</p>
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
                    <div className="space-y-4">
                        {posts.map(post => (
                            <div
                                key={post.id}
                                className="bg-white border border-roseTheme-light rounded-xl p-5 hover:shadow-lg transition"
                            >
                                <div className="flex items-start gap-4">
                                    {post.image && (
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        {post.author && (
                                            <p className="text-roseTheme-dark/80 text-xs font-semibold mb-2">
                                                👤 {post.author}
                                            </p>
                                        )}                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 
                                className="font-bold text-lg text-roseTheme-dark flex-1 cursor-pointer hover:text-rose-600 transition-colors"
                                onClick={() => navigate(`/posts/${post.id}`)}
                            >
                                {post.title}
                            </h3>
                                            {post.communities && post.communities.length > 0 && (
                                                <div className="flex flex-wrap gap-1 justify-end">
                                                    {post.communities.map((community, idx) => (
                                                        <span key={idx} className="bg-roseTheme-light text-roseTheme-dark px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                                            📁 {community}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-roseTheme-dark/70 text-sm mb-3 line-clamp-2">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-roseTheme-dark/60">
                                            <span>❤️ {post.votes} likes</span>
                                            {post.published_date && (
                                                <span>📅 {new Date(post.published_date).toLocaleDateString('ca-ES')}</span>
                                            )}
                                            {user && (
                                                <button
                                                    onClick={() => toggleSavePost(post.id)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: '0',
                                                        boxShadow: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    className="hover:scale-110 transition-transform"
                                                    title={post.is_saved ? "Desguardar" : "Guardar"}
                                                >
                                                    {post.is_saved ? (
                                                        <span className="text-lg">🌟</span>
                                                    ) : (
                                                        <span className="text-lg text-gray-400 hover:text-yellow-400 transition-colors">⭐</span>
                                                    )}
                                                </button>
                                            )}
                                            {user && (
                                                <button
                                                    onClick={() => handleEditPost(post)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: '0',
                                                        boxShadow: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    className="text-rose-600 hover:text-rose-800 hover:scale-110 transition-transform font-semibold"
                                                    title="Editar post"
                                                >
                                                    ✏️ Editar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {post.url && post.url !== `/blog/posts/${post.id}/` && (
                                    <a
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-roseTheme-dark hover:underline text-sm mt-3 block"
                                    >
                                        🔗 Veure més
                                    </a>
                                )}
                            </div>
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

            {/* Modal de editar post */}
            {editingPost && user?.apiKey && (
                <EditPostModal
                    post={editingPost}
                    apiKey={user.apiKey}
                    onClose={() => setEditingPost(null)}
                    onPostUpdated={handlePostUpdated}
                />
            )}
        </div>
    );
}