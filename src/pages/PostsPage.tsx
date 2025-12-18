import { useEffect, useState } from "react";
import { fetchPosts } from "../services/api";
import { useAuth } from '../hooks/useAuth';
import CreatePostModal from '../components/CreatePostModal';
import EditPostModal from '../components/EditPostModal';
import PostCard from '../components/PostCard';
import type { Post } from '../services/api';

type FilterType = 'all' | 'subscribed' | 'local';
type OrderType = 'new' | 'old' | 'comments' | 'votes';

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [activeOrder, setActiveOrder] = useState<OrderType>('new');
    const { user } = useAuth();

    const loadPosts = () => {
        setLoading(true);
        setError(null);

        fetchPosts(user?.apiKey, activeFilter, activeOrder)
            .then(data => {
                setPosts(data);
                setError(null);
            })
            .catch(err => {
                setError(err.message || "No s'han pogut carregar els posts");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadPosts();
    }, [user, activeFilter, activeOrder]);

    const handlePostCreated = () => {
        loadPosts();
    };

    const handlePostUpdated = () => {
        loadPosts();
        setEditingPost(null);
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
        <div className="min-h-screen bg-roseTheme-soft pb-24">
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

            {/* Timeline de posts */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-roseTheme-dark mb-1">
                                Inici
                            </h1>
                            <p className="text-roseTheme-dark/70">
                                Descobreix els últims posts de la comunitat
                            </p>
                        </div>

                        {/* Filtres compactes en una línia */}
                        <div className="flex items-center gap-3">
                            {/* Filtre per tipus */}
                            <div className="relative">
                                <select
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value as FilterType)}
                                    disabled={!user && (activeFilter === 'subscribed' || activeFilter === 'local')}
                                    className="appearance-none bg-white border-2 border-roseTheme-light rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-roseTheme-dark hover:border-roseTheme focus:outline-none focus:border-roseTheme transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="all">Tots els posts</option>
                                    <option value="subscribed" disabled={!user}>Posts subscrits</option>
                                    <option value="local" disabled={!user}>Posts locals</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-roseTheme-dark pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Ordenació */}
                            <div className="relative">
                                <select
                                    value={activeOrder}
                                    onChange={(e) => setActiveOrder(e.target.value as OrderType)}
                                    className="appearance-none bg-white border-2 border-roseTheme-light rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-roseTheme-dark hover:border-roseTheme focus:outline-none focus:border-roseTheme transition cursor-pointer"
                                >
                                    <option value="new">Més recents</option>
                                    <option value="old">Més antics</option>
                                    <option value="votes">Més votats</option>
                                    <option value="comments">Més comentats</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-roseTheme-dark pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center bg-white rounded-2xl border-2 border-roseTheme-light p-12 shadow-lg">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-roseTheme-dark text-2xl font-semibold mb-2">
                                Cap post disponible
                            </p>
                            <p className="text-roseTheme-dark/60 mb-6">
                                Sigues el primer en publicar!
                            </p>
                            {user && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition shadow-lg hover:scale-105"
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
                                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-roseTheme-light/50"
                            >
                                <PostCard
                                    post={post}
                                    onPostDeleted={(postId) => {
                                        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
                                    }}
                                    onPostEdited={(post) => {
                                        setEditingPost(post);
                                    }}
                                />
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