import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCommunityDetail, fetchCommunityPosts, subscribeToCommunity, unsubscribeFromCommunity, isUserSubscribedToCommunity, type Community, type Post } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import EditPostModal from '../components/EditPostModal';

const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadCommunityData();
  }, [id, user?.apiKey]);

  const handleSubscribe = async () => {
    if (!user?.apiKey || !community) return;

    setIsSubscribing(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromCommunity(user.apiKey, community.id);
        setIsSubscribed(false);
      } else {
        await subscribeToCommunity(user.apiKey, community.id);
        setIsSubscribed(true);
      }
      // Reload community data to get updated stats
      loadCommunityData();
    } catch (error: any) {
      console.error('Error toggling subscription:', error);

      // Handle specific error cases
      if (error.message?.includes('Ja estàs subscrit')) {
        // User is already subscribed, update local state
        setIsSubscribed(true);
        loadCommunityData();
      } else if (error.message?.includes('No estàs subscrit')) {
        // User is not subscribed, update local state
        setIsSubscribed(false);
        loadCommunityData();
      } else {
        setError(error.message || 'Error en la subscripció');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handlePostUpdated = () => {
    loadCommunityData();
    setEditingPost(null);
  };

  const loadCommunityData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [communityData, postsData] = await Promise.all([
        fetchCommunityDetail(Number(id), user?.apiKey),
        fetchCommunityPosts(Number(id), user?.apiKey)
      ]);

      setCommunity(communityData);
      setPosts(postsData);

      // Check subscription status
      if (user?.apiKey) {
        const subscriptionStatus = await isUserSubscribedToCommunity(user.apiKey, Number(id));
        setIsSubscribed(subscriptionStatus);
      } else {
        setIsSubscribed(false);
      }
    } catch (err: any) {
      console.error('Error loading community:', err);
      setError(err.message || 'No s\'ha pogut carregar la comunitat');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
            <p className="text-roseTheme-dark text-lg">Carregant comunitat...</p>
          </div>
        </div>
    );
  }

  if (error || !community) {
    return (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-5 rounded-xl max-w-md w-full shadow-lg">
            <h2 className="font-bold text-xl mb-3">❌ Error</h2>
            <p className="mb-3">{error || 'Comunitat no trobada'}</p>
            <div className="flex gap-3">
              <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                ← Tornar
              </button>
              <Link
                  to="/comunitats"
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition text-center"
              >
                Comunitats
              </Link>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-roseTheme-soft/30 to-white pb-24">
        {/* Botó de tornar */}
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <button
              onClick={() => navigate(-1)}
              className="text-roseTheme-dark hover:text-roseTheme transition flex items-center gap-2 font-semibold mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tornar
          </button>
        </div>

        {/* Banner */}
        <div className="relative h-64 bg-gradient-to-r from-roseTheme-dark via-roseTheme to-rose-400 overflow-hidden">
          {community.banner ? (
              <img
                  src={community.banner}
                  alt={`Banner de ${community.name}`}
                  className="w-full h-full object-cover opacity-90"
              />
          ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-500 to-rose-400 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Header amb informació de la comunitat */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative -mt-20 bg-white rounded-2xl shadow-2xl border-2 border-roseTheme-light p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 -mt-16">
                {community.avatar ? (
                    <img
                        src={community.avatar}
                        alt={`Avatar de ${community.name}`}
                        className="w-32 h-32 rounded-2xl object-cover shadow-xl border-4 border-white"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-roseTheme-dark to-roseTheme flex items-center justify-center shadow-xl border-4 border-white">
                  <span className="text-white font-bold text-5xl">
                    {community.name.charAt(0).toUpperCase()}
                  </span>
                    </div>
                )}
              </div>

              {/* Info de la comunitat */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-roseTheme-dark mb-1">
                      {community.name}
                    </h1>
                    <p className="text-roseTheme-dark/60 font-medium">
                      c/{community.name.toLowerCase().replace(/\s+/g, '')}
                    </p>
                  </div>

                  {/* Botó de subscripció */}
                  {user && (
                      <button
                          onClick={handleSubscribe}
                          disabled={isSubscribing}
                          className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                              isSubscribed
                                  ? 'bg-roseTheme-light text-roseTheme-dark border-2 border-roseTheme-accent hover:bg-roseTheme-accent'
                                  : 'bg-gradient-to-r from-roseTheme-dark to-roseTheme text-white hover:shadow-xl hover:scale-105'
                          }`}
                      >
                        {isSubscribing ? (
                            <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              {isSubscribed ? 'Dessubscrivint...' : 'Subscrivint...'}
                      </span>
                        ) : isSubscribed ? (
                            <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Subscrit
                      </span>
                        ) : (
                            '+ Unir-se'
                        )}
                      </button>
                  )}

                  {!user && (
                      <Link
                          to="/login"
                          className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-roseTheme-dark to-roseTheme text-white hover:shadow-xl hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        Inicia sessió per unir-te
                      </Link>
                  )}
                </div>

                {/* Estadístiques */}
                <div className="flex items-center gap-8 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-roseTheme-dark" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-roseTheme-dark">{community.subs_count}</p>
                      <p className="text-roseTheme-dark/60 text-xs">Subscriptors</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-roseTheme-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-roseTheme-dark">{community.posts_count}</p>
                      <p className="text-roseTheme-dark/60 text-xs">Posts</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-roseTheme-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-roseTheme-dark">{community.comments_count}</p>
                      <p className="text-roseTheme-dark/60 text-xs">Comentaris</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts de la comunitat */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-roseTheme-dark">
                📝 Posts de la comunitat
              </h2>
              <span className="text-sm text-roseTheme-dark/60 bg-roseTheme-light px-3 py-1 rounded-full font-semibold">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
            </div>

            {posts.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-roseTheme-light p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-roseTheme-dark/60 text-lg mb-2">
                    Encara no hi ha posts en aquesta comunitat
                  </p>
                  <p className="text-roseTheme-dark/50 text-sm">
                    Sigues el primer en compartir alguna cosa!
                  </p>
                </div>
            ) : (
                <div className="space-y-0 bg-white border-2 border-roseTheme-light rounded-xl overflow-hidden divide-y divide-roseTheme-light">
                  {posts.map(post => (
                      <PostCard
                          key={post.id}
                          post={post}
                          onPostDeleted={(postId) => {
                            setPosts(posts.filter(p => p.id !== postId));
                          }}
                          onPostEdited={(post) => {
                            setEditingPost(post);
                          }}
                      />
                  ))}
                </div>
            )}
          </div>
        </div>

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
};

export default CommunityDetail;