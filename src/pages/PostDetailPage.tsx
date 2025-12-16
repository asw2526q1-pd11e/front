import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPostDetail, fetchPostComments, toggleSavePost as apiToggleSavePost, upvotePost, downvotePost } from "../services/api";
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
    communities?: string[];
    is_saved?: boolean;
}

interface Comment {
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
}

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID del post no válido");
            setLoading(false);
            return;
        }

        const loadPostDetail = async () => {
            try {
                setLoading(true);
                
                // Cargar detalles del post
                const postData = await fetchPostDetail(parseInt(id), user?.apiKey);
                setPost(postData);
                
                // Cargar comentarios del post
                const commentsData = await fetchPostComments(parseInt(id), user?.apiKey);
                setComments(commentsData);
                
                setError(null);
            } catch (err) {
                console.error("Error fetching post detail:", err);
                setError(err instanceof Error ? err.message : "Error al cargar el post");
            } finally {
                setLoading(false);
            }
        };

        loadPostDetail();
    }, [id, user]);

    const toggleSavePost = async (postId: number) => {
        if (!user?.apiKey || !post) return;

        try {
            const result = await apiToggleSavePost(user.apiKey, postId);
            setPost(prev => prev ? { ...prev, is_saved: result.saved } : null);
        } catch (err) {
            console.error('Error guardant post:', err);
        }
    };

    const handleUpvote = async () => {
        if (!user?.apiKey || !post) return;

        try {
            const result = await upvotePost(user.apiKey, post.id);
            setPost(prev => prev ? { ...prev, votes: result.votes } : null);
        } catch (err) {
            console.error('Error fent upvote:', err);
        }
    };

    const handleDownvote = async () => {
        if (!user?.apiKey || !post) return;

        try {
            const result = await downvotePost(user.apiKey, post.id);
            setPost(prev => prev ? { ...prev, votes: result.votes } : null);
        } catch (err) {
            console.error('Error fent downvote:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                    <p className="text-roseTheme-dark text-lg">Carregant post...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-5 rounded-xl max-w-md w-full shadow-lg">
                    <h2 className="font-bold text-xl mb-3">❌ Error</h2>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition"
                    >
                        🔙 Tornar enrere
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-roseTheme-dark text-2xl font-semibold mb-2">Post no trobat</p>
                    <Link
                        to="/"
                        className="text-roseTheme-dark hover:underline"
                    >
                        🔙 Tornar als posts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Breadcrumb / Navigation */}
                <div className="mb-6">
                    <Link
                        to="/"
                        className="text-roseTheme-dark hover:underline flex items-center gap-2 mb-4"
                    >
                        🔙 Tornar als posts
                    </Link>
                </div>

                {/* Post Header */}
                <div className="bg-white border border-roseTheme-light rounded-xl p-6 mb-6 shadow-lg">
                    {/* Author and communities */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {post.author && (
                                <span className="text-roseTheme-dark/80 text-sm font-semibold">
                                    👤 {post.author}
                                </span>
                            )}
                            {post.published_date && (
                                <span className="text-roseTheme-dark/60 text-sm">
                                    📅 {new Date(post.published_date).toLocaleDateString('ca-ES')}
                                </span>
                            )}
                        </div>
                        
                        {post.communities && post.communities.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.communities.map((community, idx) => (
                                    <span key={idx} className="bg-roseTheme-light text-roseTheme-dark px-3 py-1 rounded-full text-sm font-semibold">
                                        📁 {community}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-roseTheme-dark mb-4">
                        {post.title}
                    </h1>

                    {/* Image if exists */}
                    {post.image && (
                        <div className="mb-6">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="text-roseTheme-dark/80 text-base leading-relaxed mb-6 whitespace-pre-wrap">
                        {post.content}
                    </div>

                    {/* External URL */}
                    {post.url && post.url !== `/blog/posts/${post.id}/` && (
                        <div className="mb-6">
                            <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-roseTheme-dark hover:underline font-semibold"
                            >
                                🔗 Veure més
                            </a>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 text-sm border-t border-roseTheme-light pt-4">
                        {/* Voting buttons */}
                        <div className="flex items-center gap-2">
                            {user && (
                                <button
                                    onClick={handleUpvote}
                                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-green-100 transition-colors group"
                                    title="Upvote"
                                >
                                    <span className="text-gray-500 group-hover:text-green-600 text-lg">⬆️</span>
                                </button>
                            )}
                            
                            <span className="flex items-center gap-1 font-semibold min-w-[3rem] justify-center">
                                <strong className="text-roseTheme-dark">{post.votes}</strong>
                            </span>
                            
                            {user && (
                                <button
                                    onClick={handleDownvote}
                                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-100 transition-colors group"
                                    title="Downvote"
                                >
                                    <span className="text-gray-500 group-hover:text-red-600 text-lg">⬇️</span>
                                </button>
                            )}
                        </div>
                        
                        {user && (
                            <button
                                onClick={() => toggleSavePost(post.id)}
                                className="flex items-center gap-2 hover:scale-105 transition-transform"
                                title={post.is_saved ? "Desguardar" : "Guardar"}
                            >
                                {post.is_saved ? (
                                    <span className="text-lg">🌟</span>
                                ) : (
                                    <span className="text-lg text-gray-400 hover:text-yellow-400 transition-colors">⭐</span>
                                )}
                                {post.is_saved ? "Guardat" : "Guardar"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white border border-roseTheme-light rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-roseTheme-dark mb-6 flex items-center gap-2">
                        💬 Comentaris ({comments.length})
                    </h2>

                    {comments.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-3">💭</div>
                            <p className="text-roseTheme-dark/60">Encara no hi ha comentaris</p>
                            <p className="text-roseTheme-dark/50 text-sm">Sigues el primer en comentar!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="border border-roseTheme-light/50 rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        {comment.author && (
                                            <span className="text-roseTheme-dark/80 text-sm font-semibold">
                                                👤 {comment.author}
                                            </span>
                                        )}
                                        {comment.published_date && (
                                            <span className="text-roseTheme-dark/60 text-xs">
                                                📅 {new Date(comment.published_date).toLocaleDateString('ca-ES')}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className="text-roseTheme-dark/80 mb-2 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-roseTheme-dark/60">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm">⬆️</span>
                                            <span className="font-semibold">{comment.votes}</span>
                                            <span className="text-sm">⬇️</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
