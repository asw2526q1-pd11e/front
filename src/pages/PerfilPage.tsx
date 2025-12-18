import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSavedPosts } from '../context/SavedPostContext';
import { useSavedComments } from '../context/SavedCommentContext';
import { fetchUserProfile, fetchUserPosts, fetchUserComments,
  fetchSavedPosts, fetchSavedComments, fetchSubscribedCommunities,
  type UserProfile, type Post, type Comment, type Community } from '../services/api';
import EditProfileModal from '../components/EditPerfilPage';
import EditPostModal from '../components/EditPostModal';
import PostCard from '../components/PostCard';
import CommentCard from '../components/CommentCard';

const PerfilPage = () => {
  const { user } = useAuth();
  const { refreshSavedPosts } = useSavedPosts();
  const { refreshSavedComments } = useSavedComments();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showMyComments, setShowMyComments] = useState(false);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [showSavedComments, setShowSavedComments] = useState(false);
  const [savedComments, setSavedComments] = useState<Comment[]>([]);
  const [loadingSavedComments, setLoadingSavedComments] = useState(false);
  const [subscribedCommunities, setSubscribedCommunities] = useState<Community[]>([]);

  useEffect(() => {
    if (user?.apiKey) {
      fetchUserProfile(user.apiKey)
          .then(data => {
            setProfile(data);
            setError(null);
          })
          .catch(err => {
            setError(err.message || "No s'ha pogut carregar el perfil");
          })
          .finally(() => setLoading(false));
    }
  }, [user]);

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    // Actualizar el estado local
    setProfile(updatedProfile);

    // Refrescar el perfil en el AuthProvider para que se actualice en el Navbar
    if (user?.refreshProfile) {
      await user.refreshProfile();
      console.log('✅ Perfil actualitzat al AuthProvider');
    }
  };

  const loadSubscribedCommunities = async () => {
    if (!user?.apiKey) return;

    try {
      const communities = await fetchSubscribedCommunities(user.apiKey);
      setSubscribedCommunities(communities);
    } catch (err) {
      setSubscribedCommunities([]);
    }
  };

  useEffect(() => {
    if (user?.apiKey) {
      loadUserPosts();
      loadSubscribedCommunities();
    }
  }, [user]);

  const loadUserPosts = async () => {
    if (!user?.apiKey) return;

    setLoadingPosts(true);
    try {
      const posts = await fetchUserPosts(user.apiKey);
      setUserPosts(posts);
    } catch (err) {
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (showMyPosts && user?.apiKey) {
      loadUserPosts();
    }
  }, [showMyPosts, user?.apiKey]);

  const loadSavedContent = async () => {
    if (!user?.apiKey) return;

    setLoadingSaved(true);
    try {
      await refreshSavedPosts();
      const posts = await fetchSavedPosts(user.apiKey);
      setSavedPosts(posts);
    } catch (err) {
      setSavedPosts([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (showSaved && user?.apiKey) {
      loadSavedContent();
    }
  }, [showSaved, user?.apiKey]);

  const loadSavedComments = async () => {
    if (!user?.apiKey) return;

    setLoadingSavedComments(true);
    try {
      await refreshSavedComments();
      const comments = await fetchSavedComments(user.apiKey);
      setSavedComments(comments);
    } catch (err) {
      setSavedComments([]);
    } finally {
      setLoadingSavedComments(false);
    }
  };

  useEffect(() => {
    if (showSavedComments && user?.apiKey) {
      loadSavedComments();
    }
  }, [showSavedComments, user?.apiKey]);

  const handleShowSaved = () => {
    setShowSaved(!showSaved);
    if (!showSaved) {
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
      setShowSaved(false);
    }
  };

  const loadUserComments = async () => {
    if (!user?.apiKey) return;

    setLoadingComments(true);
    try {
      const comments = await fetchUserComments(user.apiKey);
      setUserComments(comments);
    } catch (err) {
      setUserComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showMyComments && user?.apiKey) {
      loadUserComments();
    }
  }, [showMyComments, user?.apiKey]);

  const handleShowMyPosts = () => {
    setShowMyPosts(!showMyPosts);
    if (!showMyPosts) {
      setShowMyComments(false);
      setShowSaved(false);
      setShowSavedComments(false);
    }
  };

  const handleShowMyComments = () => {
    setShowMyComments(!showMyComments);
    if (!showMyComments) {
      setShowMyPosts(false);
      setShowSaved(false);
      setShowSavedComments(false);
    }
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setUserComments(prevComments =>
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
                onClick={() => window.location.reload()}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition"
            >
              🔄 Recarregar
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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-roseTheme-light">
          {/* Banner */}
          <div
              className="h-48 bg-gradient-to-r from-roseTheme-light via-roseTheme-accent to-roseTheme"
              style={profile.banner ? { backgroundImage: `url(${profile.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          />

          <div className="px-8 pb-8">
            {/* Avatar i accions */}
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
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>

              <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-roseTheme-dark text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-roseTheme transition shadow-md hover:shadow-lg"
              >
                ✏️ Editar perfil
              </button>
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

              <div className="bg-gradient-to-r from-roseTheme-light/30 to-roseTheme-accent/30 rounded-xl p-4 border border-roseTheme-light">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-roseTheme-dark/60 font-semibold mb-1">🔑 API Key</p>
                    <p className="font-mono text-xs text-roseTheme-dark break-all">
                      {profile.api_key}
                    </p>
                  </div>
                  <button
                      onClick={() => {
                        navigator.clipboard.writeText(profile.api_key);
                        alert('API Key copiada!');
                      }}
                      className="ml-4 bg-white text-roseTheme-dark px-4 py-2 rounded-lg hover:bg-roseTheme-light transition font-semibold text-sm"
                  >
                    📋 Copiar
                  </button>
                </div>
              </div>
            </div>

            {/* Estadístiques */}
            <div className="grid grid-cols-3 gap-4 mb-6">
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
              <div className="text-center p-5 bg-gradient-to-br from-roseTheme-soft to-roseTheme-light rounded-xl border border-roseTheme-light shadow-sm">
                <p className="text-3xl font-bold text-roseTheme-dark">{subscribedCommunities.length}</p>
                <p className="text-sm text-roseTheme-dark/60 font-medium">Comunitats</p>
              </div>
            </div>

            {/* Accions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                  onClick={handleShowMyPosts}
                  className={`font-semibold py-3 rounded-xl transition border ${
                      showMyPosts
                          ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                          : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  }`}
              >
                📝 Els meus posts
              </button>
              <button
                  onClick={handleShowMyComments}
                  className={`font-semibold py-3 rounded-xl transition border ${
                      showMyComments
                          ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                          : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  }`}
              >
                💬 Els meus comentaris
              </button>
              <button
                  onClick={handleShowSaved}
                  className={`font-semibold py-3 rounded-xl transition border ${
                      showSaved
                          ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                          : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  }`}
              >
                ⭐ Posts guardats
              </button>
              <button
                  onClick={handleShowSavedComments}
                  className={`font-semibold py-3 rounded-xl transition border ${
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

        {showEditModal && profile && user?.apiKey && (
            <EditProfileModal
                profile={profile}
                apiKey={user.apiKey}
                onClose={() => setShowEditModal(false)}
                onSave={handleProfileUpdate}
            />
        )}

        {editingPost && user?.apiKey && (
            <EditPostModal
                post={editingPost}
                apiKey={user.apiKey}
                onClose={() => setEditingPost(null)}
                onPostUpdated={() => {
                  loadUserPosts();
                  setEditingPost(null);
                }}
            />
        )}

        {/* Els meus posts */}
        {showMyPosts && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light overflow-hidden">
                <div className="p-6 border-b border-roseTheme-light">
                  <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                    📝 Els meus posts
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
                      <p className="text-roseTheme-dark/60 text-lg mb-2">Encara no has publicat res</p>
                      <p className="text-roseTheme-dark/40 text-sm">Els teus posts apareixeran aquí</p>
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
                              onPostEdited={(post) => {
                                setEditingPost(post);
                              }}
                          />
                      ))}
                    </div>
                )}
              </div>
            </div>
        )}

        {/* Els meus comentaris */}
        {showMyComments && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light overflow-hidden">
                <div className="p-6 border-b border-roseTheme-light">
                  <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                    💬 Els meus comentaris
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
                      <p className="text-roseTheme-dark/60 text-lg mb-2">Encara no has comentat res</p>
                      <p className="text-roseTheme-dark/40 text-sm">Els teus comentaris apareixeran aquí</p>
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

        {/* Posts guardats */}
        {showSaved && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light overflow-hidden">
                <div className="p-6 border-b border-roseTheme-light">
                  <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                    ⭐ Posts guardats
                    {loadingSaved && (
                        <div className="w-5 h-5 border-2 border-roseTheme-dark border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </h2>
                </div>

                {loadingSaved ? (
                    <div className="flex justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                        <p className="text-roseTheme-dark">Carregant...</p>
                      </div>
                    </div>
                ) : savedPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⭐</div>
                      <p className="text-roseTheme-dark/60 text-lg mb-2">No tens cap post guardat</p>
                      <p className="text-roseTheme-dark/40 text-sm">Guarda posts per veure'ls aquí</p>
                    </div>
                ) : (
                    <div className="divide-y divide-roseTheme-light">
                      {savedPosts.map(post => (
                          <PostCard
                              key={post.id}
                              post={post}
                              onPostDeleted={(postId) => {
                                setSavedPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
                                setUserPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
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
        )}

        {/* Comentaris guardats */}
        {showSavedComments && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light overflow-hidden">
                <div className="p-6 border-b border-roseTheme-light">
                  <h2 className="text-2xl font-bold text-roseTheme-dark flex items-center gap-2">
                    💾 Comentaris guardats
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
                      <p className="text-roseTheme-dark/60 text-lg mb-2">No tens cap comentari guardat</p>
                      <p className="text-roseTheme-dark/40 text-sm">Guarda comentaris per veure'ls aquí</p>
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

export default PerfilPage;