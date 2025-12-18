import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchOtherUserProfile, fetchOtherUserPosts, fetchOtherUserComments,
    type UserProfile, type Post, type Comment } from '../services/api';
import PostCard from '../components/PostCard';
import CommentCard from '../components/CommentCard';

const UserProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [userComments, setUserComments] = useState<Comment[]>([]);
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [savedComments, setSavedComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [loadingSavedPosts, setLoadingSavedPosts] = useState(false);
    const [loadingSavedComments, setLoadingSavedComments] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMyPosts, setShowMyPosts] = useState(false);
    const [showMyComments, setShowMyComments] = useState(false);
    const [showSavedPosts, setShowSavedPosts] = useState(false);
    const [showSavedComments, setShowSavedComments] = useState(false);

    useEffect(() => {
        if (!userId || !user?.apiKey) return;

        const loadProfile = async () => {
            setLoading(true);
            try {
                const data = await fetchOtherUserProfile(user.apiKey, parseInt(userId));
                setProfile(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "No s'ha pogut carregar el perfil");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [userId, user]);

    useEffect(() => {
        if (user?.apiKey && userId) {
            loadUserPosts();
        }
    }, [user, userId]);

    const loadUserPosts = async () => {
        if (!userId || !user?.apiKey) return;

        setLoadingPosts(true);
        try {
            const posts = await fetchOtherUserPosts(user.apiKey, parseInt(userId));
            setUserPosts(posts);
        } catch (err) {
            setUserPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    };

    const loadUserComments = async () => {
        if (!userId || !user?.apiKey) return;

        setLoadingComments(true);
        try {
            const comments = await fetchOtherUserComments(user.apiKey, parseInt(userId));
            setUserComments(comments);
        } catch (err) {
            setUserComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const loadSavedPosts = async () => {
        if (!userId || !user?.apiKey) return;

        setLoadingSavedPosts(true);
        try {
            const res = await fetch(`/api/accounts/users/${userId}/saved-posts/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': user.apiKey,
                }
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setSavedPosts([]);
                    return;
                }
                throw new Error('No s\'han pogut carregar els posts guardats');
            }

            const posts = await res.json();
            const mappedPosts = posts.map((post: any) => ({
                id: post.id,
                title: post.title,
                content: post.content,
                author: post.author_name || post.author,
                author_id: post.author_id,
                published_date: post.published_date,
                votes: post.votes,
                url: post.url,
                image: post.image_url || null,
                communities: post.communities || [],
                is_saved: true,
            }));
            setSavedPosts(mappedPosts);
        } catch (err) {
            setSavedPosts([]);
        } finally {
            setLoadingSavedPosts(false);
        }
    };

    const loadSavedComments = async () => {
        if (!userId || !user?.apiKey) return;

        setLoadingSavedComments(true);
        try {
            const res = await fetch(`/api/accounts/users/${userId}/saved-comments/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': user.apiKey,
                }
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setSavedComments([]);
                    return;
                }
                throw new Error('No s\'han pogut carregar els comentaris guardats');
            }

            const comments = await res.json();
            const mappedComments = comments.map((comment: any) => ({
                id: comment.id,
                post: comment.post,
                parent: comment.parent,
                content: comment.content,
                author: comment.author,
                author_id: comment.author_id,
                published_date: comment.published_date,
                votes: comment.votes,
                url: comment.url,
                image: comment.image,
                is_saved: true,
                user_vote: comment.user_vote,
            }));
            setSavedComments(mappedComments);
        } catch (err) {
            setSavedComments([]);
        } finally {
            setLoadingSavedComments(false);
        }
    };

    useEffect(() => {
        if (showMyPosts && user?.apiKey) {
            loadUserPosts();
        }
    }, [showMyPosts, user?.apiKey]);

    useEffect(() => {
        if (showMyComments && user?.apiKey) {
            loadUserComments();
        }
    }, [showMyComments, user?.apiKey]);

    useEffect(() => {
        if (showSavedPosts && user?.apiKey) {
            loadSavedPosts();
        }
    }, [showSavedPosts, user?.apiKey]);

    useEffect(() => {
        if (showSavedComments && user?.apiKey) {
            loadSavedComments();
        }
    }, [showSavedComments, user?.apiKey]);

    const handleShowMyPosts = () => {
        setShowMyPosts(!showMyPosts);
        if (!showMyPosts) {
            setShowMyComments(false);
            setShowSavedPosts(false);
            setShowSavedComments(false);
        }
    };

    const handleShowMyComments = () => {
        setShowMyComments(!showMyComments);
        if (!showMyComments) {
            setShowMyPosts(false);
            setShowSavedPosts(false);
            setShowSavedComments(false);
        }
    };

    const handleShowSavedPosts = () => {
        setShowSavedPosts(!showSavedPosts);
        if (!showSavedPosts) {
            setShowMyPosts(false);
            setShowMyComments(false);
            setShowSavedComments(false);
        }
    };

    const handleShowSavedComments = () => {
        setShowSavedComments(!showSavedComments);
        if (!showSavedComments) {
            setShowMyPosts(false);
            setShowMyComments(false);
            setShowSavedPosts(false);
        }
    };

    const handleCommentUpdated = (updatedComment: Comment) => {
        setUserComments(prevComments =>
            prevComments.map(c =>
                c.id === updatedComment.id ? updatedComment : c
            )
        );
        setSavedComments(prevComments =>
            prevComments.map(c =>
                c.id === updatedComment.id ? updatedComment : c
            )
        );
    };

    const handleCommentDeleted = (commentId: number) => {
        setUserComments(prevComments =>
            prevComments.filter(c => c.id !== commentId)
        );
        setSavedComments(prevComments =>
            prevComments.filter(c => c.id !== commentId)
        );
    };

    const handleCommentUnsaved = (commentId: number) => {
        setSavedComments(prevComments =>
            prevComments.filter(c => c.id !== commentId)
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                    <p className="text-roseTheme-dark text-lg">Carregant perfil...</p>
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
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition"
                    >
                        ← Tornar
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-roseTheme-dark text-xl">No s'ha trobat el perfil</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-roseTheme-dark hover:text-roseTheme transition flex items-center gap-2"
            >
                ← Tornar
            </button>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-roseTheme-light">
                {/* Banner */}
                <div
                    className="h-48 bg-gradient-to-r from-roseTheme-light via-roseTheme-accent to-roseTheme"
                    style={profile.banner ? { backgroundImage: `url(${profile.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                />

                <div className="px-8 pb-8">
                    {/* Avatar */}
                    <div className="flex items-end justify-between -mt-20 mb-6">
                        <div className="relative">
                            {profile.avatar ? (
                                <img
                                    src={profile.avatar}
                                    alt={profile.username}
                                    className="w-40 h-40 rounded-full border-4 border-white shadow-2xl object-cover"
                                />
                            ) : (
                                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-roseTheme-dark to-roseTheme flex items-center justify-center text-white text-6xl font-bold border-4 border-white shadow-2xl">
                                    {profile.nombre.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info del perfil */}
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-roseTheme-dark mb-2">
                            {profile.nombre}
                        </h1>
                        <p className="text-roseTheme-dark/60 text-lg mb-4">
                            @{profile.username}
                        </p>

                        <div className="bg-roseTheme-soft/50 rounded-xl p-4 mb-6 border border-roseTheme-light">
                            <p className="text-roseTheme-dark leading-relaxed">
                                {profile.bio}
                            </p>
                        </div>
                    </div>

                    {/* Estadístiques */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-5 bg-gradient-to-br from-roseTheme-soft to-roseTheme-light rounded-xl border border-roseTheme-light shadow-sm">
                            <p className="text-3xl font-bold text-roseTheme-dark">{userPosts.length}</p>
                            <p className="text-sm text-roseTheme-dark/60 font-medium">Posts</p>
                        </div>
                        <div className="text-center p-5 bg-gradient-to-br from-roseTheme-soft to-roseTheme-light rounded-xl border border-roseTheme-light shadow-sm">
                            <p className="text-3xl font-bold text-roseTheme-dark">
                                {userPosts.reduce((sum, post) => sum + post.votes, 0)}
                            </p>
                            <p className="text-sm text-roseTheme-dark/60 font-medium">Likes</p>
                        </div>
                    </div>

                    {/* Accions */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handleShowMyPosts}
                            className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                                showMyPosts
                                    ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                                    : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            }`}
                        >
                            📝 Posts
                        </button>
                        <button
                            onClick={handleShowMyComments}
                            className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                                showMyComments
                                    ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                                    : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            }`}
                        >
                            💬 Comentaris
                        </button>
                        <button
                            onClick={handleShowSavedPosts}
                            className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                                showSavedPosts
                                    ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                                    : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            }`}
                        >
                            ⭐ Posts guardats
                        </button>
                        <button
                            onClick={handleShowSavedComments}
                            className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                                showSavedComments
                                    ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                                    : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            }`}
                        >
                            💾 Comentaris guardats
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts */}
            {showMyPosts && (
                <div className="mt-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light overflow-hidden">
                        <div className="p-6 border-b border-roseTheme-light">
                            <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                                📝 Posts de {profile.nombre}
                                {loadingPosts && (
                                    <div className="w-5 h-5 border-2 border-roseTheme-dark border-t-transparent rounded-full animate-spin"></div>
                                )}
                            </h2>
                        </div>

                        {loadingPosts ? (
                            <div className="flex justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                                    <p className="text-roseTheme-dark">Carregant posts...</p>
                                </div>
                            </div>
                        ) : userPosts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-roseTheme-dark/60 text-lg mb-2">Aquest usuari no ha publicat res</p>
                                <p className="text-roseTheme-dark/40 text-sm">Els seus posts apareixeran aquí</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-roseTheme-light">
                                {userPosts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onPostDeleted={(postId) => {
                                            setUserPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Comentaris */}
            {showMyComments && (
                <div className="mt-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light overflow-hidden">
                        <div className="p-6 border-b border-roseTheme-light">
                            <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                                💬 Comentaris de {profile.nombre}
                                {loadingComments && (
                                    <div className="w-5 h-5 border-2 border-roseTheme-dark border-t-transparent rounded-full animate-spin"></div>
                                )}
                            </h2>
                        </div>

                        {loadingComments ? (
                            <div className="flex justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                                    <p className="text-roseTheme-dark">Carregant comentaris...</p>
                                </div>
                            </div>
                        ) : userComments.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">💭</div>
                                <p className="text-roseTheme-dark/60 text-lg mb-2">Aquest usuari no ha comentat res</p>
                                <p className="text-roseTheme-dark/40 text-sm">Els seus comentaris apareixeran aquí</p>
                            </div>
                        ) : (
                            <div className="space-y-4 p-6">
                                {userComments.map((comment) => (
                                    <CommentCard
                                        key={comment.id}
                                        comment={comment}
                                        depth={0}
                                        onCommentDeleted={handleCommentDeleted}
                                        onCommentUpdated={handleCommentUpdated}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Posts Guardats */}
            {showSavedPosts && (
                <div className="mt-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light overflow-hidden">
                        <div className="p-6 border-b border-roseTheme-light">
                            <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                                ⭐ Posts guardats de {profile.nombre}
                                {loadingSavedPosts && (
                                    <div className="w-5 h-5 border-2 border-roseTheme-dark border-t-transparent rounded-full animate-spin"></div>
                                )}
                            </h2>
                        </div>

                        {loadingSavedPosts ? (
                            <div className="flex justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                                    <p className="text-roseTheme-dark">Carregant...</p>
                                </div>
                            </div>
                        ) : savedPosts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">⭐</div>
                                <p className="text-roseTheme-dark/60 text-lg mb-2">Aquest usuari no té posts guardats</p>
                                <p className="text-roseTheme-dark/40 text-sm">Els posts guardats apareixeran aquí</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-roseTheme-light">
                                {savedPosts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onPostDeleted={(postId) => {
                                            setSavedPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Comentaris Guardats */}
            {showSavedComments && (
                <div className="mt-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light overflow-hidden">
                        <div className="p-6 border-b border-roseTheme-light">
                            <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                                💾 Comentaris guardats de {profile.nombre}
                                {loadingSavedComments && (
                                    <div className="w-5 h-5 border-2 border-roseTheme-dark border-t-transparent rounded-full animate-spin"></div>
                                )}
                            </h2>
                        </div>

                        {loadingSavedComments ? (
                            <div className="flex justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                                    <p className="text-roseTheme-dark">Carregant...</p>
                                </div>
                            </div>
                        ) : savedComments.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">💾</div>
                                <p className="text-roseTheme-dark/60 text-lg mb-2">Aquest usuari no té comentaris guardats</p>
                                <p className="text-roseTheme-dark/40 text-sm">Els comentaris guardats apareixeran aquí</p>
                            </div>
                        ) : (
                            <div className="space-y-4 p-6">
                                {savedComments.map(comment => (
                                    <CommentCard
                                        key={comment.id}
                                        comment={comment}
                                        depth={0}
                                        onCommentDeleted={handleCommentDeleted}
                                        onCommentUpdated={handleCommentUpdated}
                                        onCommentUnsaved={handleCommentUnsaved}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;