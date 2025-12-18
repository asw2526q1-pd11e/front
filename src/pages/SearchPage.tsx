import { useState } from "react";
import { searchPostsComments, type Post, type Comment } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import PostCard from "../components/PostCard";
import CommentCard from "../components/CommentCard";

const SearchPage = () => {
    const { user } = useAuth();

    const [query, setQuery] = useState("");
    const [searchType, setSearchType] = useState<"posts" | "comments" | "both">("both");

    const [postsResults, setPostsResults] = useState<Post[]>([]);
    const [commentsResults, setCommentsResults] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setPostsResults([]);
        setCommentsResults([]);
        setHasSearched(true);

        try {
            const data = await searchPostsComments(query, searchType, user?.apiKey);

            if (searchType === 'posts' || searchType === 'both') {
                setPostsResults(data.posts);
            }

            if (searchType === 'comments' || searchType === 'both') {
                setCommentsResults(data.comments);
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentDeleted = (commentId: number) => {
        setCommentsResults(prevComments =>
            prevComments.filter(c => c.id !== commentId)
        );
    };

    const handleCommentUpdated = (updatedComment: Comment) => {
        setCommentsResults(prevComments =>
            prevComments.map(c =>
                c.id === updatedComment.id ? updatedComment : c
            )
        );
    };

    const handlePostDeleted = (postId: number) => {
        setPostsResults(prevPosts =>
            prevPosts.filter(p => p.id !== postId)
        );
    };

    const handlePostEdited = (editedPost: Post) => {
        // Aquí podrías abrir un modal de edición si lo deseas
        console.log("Edit post:", editedPost);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-roseTheme-soft/30 to-white pb-12">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-roseTheme-dark mb-2 flex items-center gap-3">
                        🔍 Cerca
                    </h1>
                    <p className="text-roseTheme-dark/60">
                        Busca posts i comentaris a DailyDev
                    </p>
                </div>

                {/* Formulari de cerca */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-roseTheme-light p-6 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Input de cerca */}
                        <div>
                            <label className="block text-sm font-semibold text-roseTheme-dark mb-2">
                                Què vols buscar?
                            </label>
                            <input
                                type="text"
                                placeholder="Escriu aquí per buscar..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-roseTheme-light focus:border-roseTheme-dark focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Selector de tipus */}
                        <div>
                            <label className="block text-sm font-semibold text-roseTheme-dark mb-2">
                                Tipus de contingut
                            </label>
                            <select
                                value={searchType}
                                onChange={(e) =>
                                    setSearchType(e.target.value as "posts" | "comments" | "both")
                                }
                                className="w-full px-4 py-3 rounded-xl border-2 border-roseTheme-light focus:border-roseTheme-dark focus:outline-none transition-colors"
                            >
                                <option value="both">📝💬 Tot (Posts i Comentaris)</option>
                                <option value="posts">📝 Només Posts</option>
                                <option value="comments">💬 Només Comentaris</option>
                            </select>
                        </div>

                        {/* Botó de cerca */}
                        <button
                            type="submit"
                            disabled={!query.trim() || loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-roseTheme-dark to-roseTheme text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cercant...
                </span>
                            ) : (
                                '🔍 Cercar'
                            )}
                        </button>
                    </form>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                            <p className="text-roseTheme-dark text-lg">Cercant...</p>
                        </div>
                    </div>
                )}

                {/* Resultats de posts */}
                {!loading && postsResults.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                                📝 Posts
                            </h2>
                            <span className="text-sm text-roseTheme-dark/60 bg-roseTheme-light px-3 py-1 rounded-full font-semibold">
                {postsResults.length} {postsResults.length === 1 ? 'resultat' : 'resultats'}
              </span>
                        </div>
                        <div className="bg-white border-2 border-roseTheme-light rounded-xl overflow-hidden divide-y divide-roseTheme-light">
                            {postsResults.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onPostDeleted={handlePostDeleted}
                                    onPostEdited={handlePostEdited}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Resultats de comentaris */}
                {!loading && commentsResults.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                                💬 Comentaris
                            </h2>
                            <span className="text-sm text-roseTheme-dark/60 bg-roseTheme-light px-3 py-1 rounded-full font-semibold">
                {commentsResults.length} {commentsResults.length === 1 ? 'resultat' : 'resultats'}
              </span>
                        </div>
                        <div className="bg-white rounded-xl border-2 border-roseTheme-light p-4 space-y-4">
                            {commentsResults.map((comment) => (
                                <CommentCard
                                    key={comment.id}
                                    comment={comment}
                                    depth={0}
                                    onCommentDeleted={handleCommentDeleted}
                                    onCommentUpdated={handleCommentUpdated}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Sense resultats */}
                {!loading && hasSearched && postsResults.length === 0 && commentsResults.length === 0 && (
                    <div className="bg-white rounded-2xl border-2 border-roseTheme-light p-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-roseTheme-dark mb-2">
                            No s'han trobat resultats
                        </h3>
                        <p className="text-roseTheme-dark/60">
                            Prova amb una altra cerca o canvia el tipus de contingut
                        </p>
                    </div>
                )}

                {/* Missatge inicial */}
                {!loading && !hasSearched && (
                    <div className="bg-gradient-to-br from-roseTheme-soft/50 to-roseTheme-light/50 rounded-2xl border-2 border-roseTheme-light p-12 text-center">
                        <div className="text-6xl mb-4">✨</div>
                        <h3 className="text-xl font-bold text-roseTheme-dark mb-2">
                            Comença a cercar
                        </h3>
                        <p className="text-roseTheme-dark/60">
                            Escriu alguna cosa al camp de cerca per començar
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;