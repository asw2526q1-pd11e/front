import { useState } from "react";
import { Link } from "react-router-dom";
import { searchPostsComments, type Post, type Comment } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import PostCard from "../components/PostCard";

const SearchPage = () => {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] =
    useState<"posts" | "comments" | "both">("both");

  const [postsResults, setPostsResults] = useState<Post[]>([]);
  const [commentsResults, setCommentsResults] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setPostsResults([]);
    setCommentsResults([]);

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


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cerca</h1>

      {/* Formulari */}
      <form onSubmit={handleSearch} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border"
        />

        <select
          value={searchType}
          onChange={(e) =>
            setSearchType(e.target.value as "posts" | "comments" | "both")
          }
          className="w-full px-4 py-2 rounded-lg border"
        >
          <option value="posts">Posts</option>
          <option value="comments">Comentaris</option>
          <option value="both">Tot</option>
        </select>

        <button
          type="submit"
          className="px-6 py-2 bg-roseTheme-dark text-white rounded-lg"
        >
          Cerca
        </button>
      </form>

        {/* Posts */}
        {postsResults.length > 0 && (
          <>
            <h2 className="text-xl font-bold mt-6">Posts</h2>
            {postsResults.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </>
        )}

        {/* Comentaris */}
        {commentsResults.length > 0 && (
            <>
            <h2 className="text-xl font-bold mt-6 mb-2">Comentaris</h2>
            {commentsResults.map((comment) => (
                <div
                key={comment.id}
                className="bg-white p-4 rounded-lg border mb-3"
                >
                <p className="text-sm text-gray-600 mb-1">
                    Comentari a{" "}
                    <Link
                    to={`/posts/${comment.post}`}
                    className="text-roseTheme-dark font-semibold"
                    >
                    post #{comment.post}
                    </Link>
                </p>
                <p>{comment.content}</p>
                </div>
            ))}
            </>
        )}

        {/* Sense resultats */}
        {!loading && postsResults.length === 0 && commentsResults.length === 0 && (
        <p className="text-gray-500 mt-6">No s'han trobat resultats.</p>
        )}
    </div>
  );
};

export default SearchPage;
