import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
    fetchPostDetail, 
    fetchPostCommentsTree, 
    toggleSavePost as apiToggleSavePost, 
    upvotePost, 
    downvotePost, 
    deletePost,
    getCommunityIdByName, 
    type Post as ApiPost,
    type PostCommunity
} from "../services/api";
import { useAuth } from '../hooks/useAuth';
import { useSavedPosts } from '../context/SavedPostContext';
import { usePostVotes } from '../context/PostVoteContext';
import EditPostModal from '../components/EditPostModal';
import CreateCommentModal from '../components/CreateCommentModal';
import CommentCard from '../components/CommentCard';
import EditCommentModal from '../components/EditCommentModal';

interface Post {
    id: number;
    title: string;
    content: string;
    author?: string;
    author_id?: number;
    published_date?: string;
    votes: number;
    url: string;
    image?: string | null;
    communities?: (string | PostCommunity)[];
    is_saved?: boolean;
}

interface Comment {
    id: number;
    post: number;
    parent?: number | null;
    content: string;
    author?: string;
    author_id?: number;
    published_date?: string;
    votes: number;
    user_vote?: number;
    url?: string;
    image?: string | null;
    replies?: Comment[];
    is_saved?: boolean;
}

type CommentOrderType = 'new' | 'old' | 'top';

const convertApiPostToLocal = (apiPost: ApiPost): Post => {
    return {
        ...apiPost,
        communities: apiPost.communities?.map(c => typeof c === 'string' ? c : c.name)
    };
};

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isPostSaved, togglePostSaved } = useSavedPosts();
    const { getPostVote, setPostVote } = usePostVotes();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [commentOrder, setCommentOrder] = useState<CommentOrderType>('new');
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: number; author: string } | null>(null);
    // Obtener el voto del post desde el contexto
    const postUserVote = post ? getPostVote(post.id) : null;
    const [isVoting, setIsVoting] = useState(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID del post no válido");
            setLoading(false);
            return;
        }

        const loadPostDetail = async () => {
            try {
                setLoading(true);
                const postData = await fetchPostDetail(parseInt(id), user?.apiKey);
                setPost(convertApiPostToLocal(postData));
                const commentsData = await fetchPostCommentsTree(parseInt(id), user?.apiKey, commentOrder);
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
    }, [id, user, commentOrder]);

    const toggleSavePost = async (postId: number) => {
        if (!user?.apiKey || !post) return;
        try {
            const result = await apiToggleSavePost(user.apiKey, postId);
            togglePostSaved(postId, result.saved);
            setPost(prev => prev ? { ...prev, is_saved: result.saved } : null);
        } catch (err) {
            console.error('Error guardant post:', err);
        }
    };

    const handleUpvote = async () => {
        if (!user?.apiKey || !post || isVoting) return;
        setIsVoting(true);
        try {
            const result = await upvotePost(user.apiKey, post.id);
            setPost(prev => prev ? { ...prev, votes: result.votes } : null);
            // Actualizar el voto en el contexto
            const newVote = postUserVote === 'up' ? null : 'up';
            setPostVote(post.id, newVote);
        } catch (err) {
            console.error('Error fent upvote:', err);
        } finally {
            setIsVoting(false);
        }
    };

    const handleDownvote = async () => {
        if (!user?.apiKey || !post || isVoting) return;
        setIsVoting(true);
        try {
            const result = await downvotePost(user.apiKey, post.id);
            setPost(prev => prev ? { ...prev, votes: result.votes } : null);
            // Actualizar el voto en el contexto
            const newVote = postUserVote === 'down' ? null : 'down';
            setPostVote(post.id, newVote);
        } catch (err) {
            console.error('Error fent downvote:', err);
        } finally {
            setIsVoting(false);
        }
    };

    const handleDeletePost = async () => {
        if (!user?.apiKey || !post) return;
        try {
            await deletePost(user.apiKey, post.id);
            navigate('/');
        } catch (err) {
            console.error('Error eliminant post:', err);
            setError(err instanceof Error ? err.message : 'Error eliminant el post');
        }
    };

    const handlePostUpdated = () => {
        if (!id) return;
        const loadPostDetail = async () => {
            try {
                const postData = await fetchPostDetail(parseInt(id), user?.apiKey);
                setPost(convertApiPostToLocal(postData));
            } catch (err) {
                console.error("Error reloading post:", err);
            }
        };
        loadPostDetail();
        setShowEditModal(false);
    };

    const handleCommentCreated = async () => {
        if (!id) return;
        try {
            const commentsData = await fetchPostCommentsTree(parseInt(id), user?.apiKey, commentOrder);
            setComments(commentsData);
            setShowCommentModal(false);
            setReplyingTo(null);
        } catch (err) {
            console.error("Error reloading comments:", err);
        }
    };

    const handleCommentDeleted = async () => {
        if (!id) return;
        try {
            const commentsData = await fetchPostCommentsTree(parseInt(id), user?.apiKey, commentOrder);
            setComments(commentsData);
        } catch (err) {
            console.error("Error reloading comments:", err);
        }
    };

    const handleCommentUpdated = async () => {
        if (!id) return;
        try {
            const commentsData = await fetchPostCommentsTree(parseInt(id), user?.apiKey, commentOrder);
            setComments(commentsData);
            setEditingComment(null);
        } catch (err) {
            console.error("Error reloading comments:", err);
        }
    };

    const handleReply = (commentId: number, author: string) => {
        setReplyingTo({ id: commentId, author });
        setShowCommentModal(true);
    };

    const handleAuthorClick = () => {
        if (post?.author_id) {
            navigate(`/users/${post.author_id}`);
        }
    };

    const handleCommunityClick = async (e: React.MouseEvent, community: string | PostCommunity) => {
        e.preventDefault();
        e.stopPropagation();

        // Si es un objeto con ID, navegar directamente
        if (typeof community === 'object' && community.id) {
            navigate(`/comunitats/${community.id}`);
            return;
        }

        // Si es un string o un objeto sin ID, buscar el ID
        const communityName = typeof community === 'string' ? community : community.name;

        if (!user?.apiKey) {
            // Si no hay usuario autenticado, no podemos buscar el ID
            console.warn('Usuario no autenticado, no se puede buscar ID de comunidad');
            return;
        }

        try {
            // Buscar el ID de la comunidad por nombre
            const communityId = await getCommunityIdByName(user.apiKey, communityName);

            if (communityId) {
                navigate(`/comunitats/${communityId}`);
            } else {
                console.warn(`No se encontró la comunidad: ${communityName}`);
                // Opcionalmente, mostrar un mensaje al usuario
            }
        } catch (error) {
            console.error('Error navegando a la comunidad:', error);
        }
    };

    const isOwner = user && post?.author &&
        (user as any).username?.toLowerCase() === post.author.toLowerCase();

    const isSaved = post ? isPostSaved(post.id) : false;

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
                    <h2 className="font-bold text-xl mb-3">Error</h2>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition"
                    >
                        Tornar enrere
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-roseTheme-dark text-2xl font-semibold mb-2">Post no trobat</p>
                    <Link to="/" className="text-roseTheme-dark hover:underline">
                        Tornar als posts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-roseTheme-soft pb-8">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link to="/" className="text-roseTheme-dark hover:underline flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Tornar als posts
                    </Link>
                </div>

                <div className="bg-white border-2 border-roseTheme-light rounded-xl p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div
                                onClick={handleAuthorClick}
                                className={`w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold ${
                                    post.author_id ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                                } transition`}
                            >
                                {post.author ? post.author[0].toUpperCase() : '?'}
                            </div>
                            <div>
                                <p
                                    onClick={handleAuthorClick}
                                    className={`text-sm font-bold text-roseTheme-dark ${
                                        post.author_id ? 'hover:underline cursor-pointer' : ''
                                    }`}
                                >
                                    u/{post.author || 'Anònim'}
                                </p>
                                {post.published_date && (
                                    <p className="text-xs text-roseTheme-dark/60">
                                        {new Date(post.published_date).toLocaleDateString('ca-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {post.communities && post.communities.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.communities.map((community, idx) => {
                                    const isObject = typeof community === 'object';
                                    const communityId = isObject ? community.id : 0;
                                    const communityName = isObject ? community.name : community;
                                    const hasId = isObject && communityId > 0;

                                    return (
                                        <button
                                            key={hasId ? communityId : `comm-${idx}`}
                                            onClick={(e) => handleCommunityClick(e, community)}
                                            className="inline-flex items-center gap-1 text-sm bg-gradient-to-r from-roseTheme-light to-rose-100 text-roseTheme-dark px-3 py-1 rounded-full font-semibold shadow-sm hover:from-rose-200 hover:to-rose-300 hover:scale-105 cursor-pointer transition-all duration-200"
                                            title={`Veure c/${communityName}`}
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                            </svg>
                                            c/{communityName}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-roseTheme-dark mb-4">
                        {post.title}
                    </h1>

                    {post.image && (
                        <div className="mb-6 rounded-xl overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full" />
                        </div>
                    )}

                    <div className="text-roseTheme-dark/80 leading-relaxed mb-6 whitespace-pre-wrap">
                        {post.content}
                    </div>

                    {post.url && !post.url.includes(`/blog/posts/${post.id}/`) && (
                        <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-roseTheme hover:underline font-semibold mb-6"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Veure més
                        </a>
                    )}
                    
                    <div className="flex items-center gap-6 border-t border-roseTheme-light pt-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            {user && (
                                <button
                                    onClick={handleUpvote}
                                    disabled={isVoting}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        postUserVote === 'up'
                                            ? 'bg-green-100 text-green-600 scale-110'
                                            : 'hover:bg-green-50 text-roseTheme-dark/60 hover:text-green-600'
                                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                                    title="Upvote"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill={postUserVote === 'up' ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                            )}

                            <span className={`font-bold text-lg transition-colors min-w-[3rem] text-center ${
                                postUserVote === 'up' ? 'text-green-600' :
                                    postUserVote === 'down' ? 'text-red-600' :
                                        post.votes > 0 ? 'text-green-600' :
                                            post.votes < 0 ? 'text-red-600' : 'text-roseTheme-dark'
                            }`}>
                                {post.votes}
                            </span>

                            {user && (
                                <button
                                    onClick={handleDownvote}
                                    disabled={isVoting}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        postUserVote === 'down'
                                            ? 'bg-red-100 text-red-600 scale-110'
                                            : 'hover:bg-red-50 text-roseTheme-dark/60 hover:text-red-600'
                                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                                    title="Downvote"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill={postUserVote === 'down' ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {user && (
                            <button
                                onClick={() => toggleSavePost(post.id)}
                                className={`flex items-center gap-2 transition-all ${
                                    isSaved ? 'text-amber-600' : 'text-roseTheme-dark/60 hover:text-amber-600'
                                }`}
                            >
                                <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                <span className="text-sm font-medium">{isSaved ? 'Desat' : 'Desar'}</span>
                            </button>
                        )}

                        {isOwner && (
                            <>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="text-sm font-medium">Editar</span>
                                </button>

                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 text-red-600 hover:text-red-800 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="text-sm font-medium">Eliminar</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white border-2 border-roseTheme-light rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <h2 className="text-2xl font-bold text-roseTheme-dark">
                            Comentaris ({comments.length})
                        </h2>

                        <div className="flex items-center gap-3">
                            {user && (
                                <button
                                    onClick={() => {
                                        setReplyingTo(null);
                                        setShowCommentModal(true);
                                    }}
                                    className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition shadow-md flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Afegir comentari
                                </button>
                            )}

                            {comments.length > 0 && (
                                <div className="relative">
                                    <select
                                        value={commentOrder}
                                        onChange={(e) => setCommentOrder(e.target.value as CommentOrderType)}
                                        className="appearance-none bg-white border-2 border-roseTheme-light rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-roseTheme-dark hover:border-roseTheme focus:outline-none focus:border-roseTheme transition cursor-pointer"
                                    >
                                        <option value="new">Més recents</option>
                                        <option value="old">Més antics</option>
                                        <option value="top">Més votats</option>
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-roseTheme-dark pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {comments.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-roseTheme-dark/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-roseTheme-dark/60 font-medium">Encara no hi ha comentaris</p>
                            <p className="text-roseTheme-dark/50 text-sm">Sigues el primer en comentar!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <CommentCard
                                    key={comment.id}
                                    comment={comment}
                                    onReply={handleReply}
                                    onCommentDeleted={handleCommentDeleted}
                                    onCommentUpdated={handleCommentUpdated}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-roseTheme-dark mb-2">Eliminar Post</h2>
                            <p className="text-roseTheme-dark/70 mb-6">
                                Aquesta acció no es pot desfer. Estàs segur?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
                                >
                                    Cancel·lar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        handleDeletePost();
                                    }}
                                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && user?.apiKey && post && (
                <EditPostModal
                    post={post}
                    apiKey={user.apiKey}
                    onClose={() => setShowEditModal(false)}
                    onPostUpdated={handlePostUpdated}
                />
            )}

            {showCommentModal && user?.apiKey && post && (
                <CreateCommentModal
                    postId={post.id}
                    parentId={replyingTo?.id}
                    parentAuthor={replyingTo?.author}
                    apiKey={user.apiKey}
                    onClose={() => {
                        setShowCommentModal(false);
                        setReplyingTo(null);
                    }}
                    onCommentCreated={handleCommentCreated}
                />
            )}

            {editingComment && user?.apiKey && (
                <EditCommentModal
                    comment={editingComment}
                    apiKey={user.apiKey}
                    onClose={() => setEditingComment(null)}
                    onCommentUpdated={handleCommentUpdated}
                />
            )}
        </div>
    );
}