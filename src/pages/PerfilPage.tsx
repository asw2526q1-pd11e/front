import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchUserProfile, fetchUserPosts, fetchUserComments,
  fetchSavedPosts, fetchSavedComments, fetchSubscribedCommunities,
  toggleSavePost as apiToggleSavePost, toggleSaveComment as apiToggleSaveComment,
  type UserProfile, type Post, type Comment, type Community } from '../services/api';
import EditProfileModal from '../components/EditPerfilPage';
import EditPostModal from '../components/EditPostModal';

const PerfilPage = () => {
  const { user, logout } = useAuth();
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
  const [savedComments, setSavedComments] = useState<Comment[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [subscribedCommunities, setSubscribedCommunities] = useState<Community[]>([]);

  useEffect(() => {
    if (user?.apiKey) {
      fetchUserProfile(user.apiKey)
          .then(data => {
            setProfile(data);
            setError(null);
          })
          .catch(err => {
            console.error("Error fetching user profile:", err);
            setError(err.message || "No s'ha pogut carregar el perfil");
          })
          .finally(() => setLoading(false));
    }
  }, [user]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const loadSubscribedCommunities = async () => {
    if (!user?.apiKey) return;

    try {
      const communities = await fetchSubscribedCommunities(user.apiKey);
      setSubscribedCommunities(communities);
    } catch (err) {
      console.error('Error carregant comunitats subscrites:', err);
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
      console.error('Error carregant posts:', err);
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

  const toggleSavePost = async (postId: number) => {
    if (!user?.apiKey) return;

    try {
      const result = await apiToggleSavePost(user.apiKey, postId);

      setUserPosts(prevPosts =>
          prevPosts.map(post =>
              post.id === postId ? { ...post, is_saved: result.saved } : post
          )
      );

      if (showSaved) {
        loadSavedContent();
      }
    } catch (err) {
      console.error('Error guardant post:', err);
    }
  };

  const toggleSaveComment = async (commentId: number) => {
    if (!user?.apiKey) return;

    try {
      const result = await apiToggleSaveComment(user.apiKey, commentId);

      setUserComments(prevComments =>
          prevComments.map(comment =>
              comment.id === commentId ? { ...comment, is_saved: result.saved } : comment
          )
      );

      if (showSaved) {
        loadSavedContent();
      }
    } catch (err) {
      console.error('Error guardant comentari:', err);
    }
  };

  const loadSavedContent = async () => {
    if (!user?.apiKey) return;

    setLoadingSaved(true);
    try {
      const [posts, comments] = await Promise.all([
        fetchSavedPosts(user.apiKey),
        fetchSavedComments(user.apiKey)
      ]);
      setSavedPosts(posts);
      setSavedComments(comments);
    } catch (err) {
      console.error('Error carregant contingut guardat:', err);
      setSavedPosts([]);
      setSavedComments([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (showSaved && user?.apiKey) {
      loadSavedContent();
    }
  }, [showSaved, user?.apiKey]);

  const handleShowSaved = () => {
    setShowSaved(!showSaved);
    if (!showSaved) {
      setShowMyPosts(false);
      setShowMyComments(false);
    }
  };

  const loadUserComments = async () => {
    if (!user?.apiKey) return;

    setLoadingComments(true);
    try {
      const comments = await fetchUserComments(user.apiKey);
      setUserComments(comments);
    } catch (err) {
      console.error('Error carregant comentaris:', err);
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
    }
  };

  const handleShowMyComments = () => {
    setShowMyComments(!showMyComments);
    if (!showMyComments) {
      setShowMyPosts(false);
      setShowSaved(false);
    }
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
            <div className="flex gap-3">
              <button
                  onClick={handleShowMyPosts}
                  className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                      showMyPosts
                          ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                          : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  }`}
              >
                📝 Els meus posts
              </button>
              <button
                  onClick={handleShowMyComments}
                  className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                      showMyComments
                          ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                          : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  }`}
              >
                💬 Els meus comentaris
              </button>
              <button
                  onClick={handleShowSaved}
                  className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                      showSaved
                          ? 'selected bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white border-rose-500'
                          : 'bg-transparent text-gray-700 border-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  }`}
              >
                ⭐ Posts guardats
              </button>
              <button
                  onClick={logout}
                  className="flex-1 bg-red-50 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-100 transition border border-red-200"
              >
                🚪 Tancar sessió
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

        {showMyPosts && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light p-6">
                <h2 className="text-2xl font-bold text-roseTheme-dark mb-4 flex items-center gap-2">
                  📝 Els meus posts
                  {loadingPosts && (
                      <div className="w-5 h-5 border-2 border-roseTheme-dark border-t-transparent rounded-full animate-spin"></div>
                  )}
                </h2>

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
                    <div className="space-y-4">
                      {userPosts.map((post) => (
                          <div
                              key={post.id}
                              className="border border-roseTheme-light rounded-xl p-4 hover:shadow-md transition"
                          >
                            <div className="flex items-start gap-4">
                              {post.image && (
                                  <img
                                      src={post.image}
                                      alt={post.title}
                                      className="w-24 h-24 object-cover rounded-lg"
                                  />
                              )}
                              <div className="flex-1">
                                {post.author && (
                                    <p className="text-roseTheme-dark/80 text-xs font-semibold mb-2">
                                      👤 {post.author}
                                    </p>
                                )}
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="font-bold text-lg text-roseTheme-dark flex-1">
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

                                <p className="text-roseTheme-dark/70 text-sm mb-2 line-clamp-2">
                                  {post.content}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-roseTheme-dark/60">
                                  <span>❤️ {post.votes} likes</span>
                                  <span>📅 {new Date(post.published_date).toLocaleDateString('ca-ES')}</span>
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
                                  <button
                                      onClick={() => setEditingPost(post)}
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
                                </div>
                              </div>
                            </div>
                            {post.url && post.url !== `/blog/posts/${post.id}/` && (
                                <a
                                    href={post.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-roseTheme-dark hover:underline text-sm mt-2 block"
                                >
                                  🔗 Veure més
                                </a>
                            )}
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
        )}
        {showMyComments && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light p-6">
                <h2 className="text-2xl font-bold text-roseTheme-dark mb-4 flex items-center gap-2">
                  💬 Els meus comentaris
                  {loadingComments && (
                      <div className="w-5 h-5 border-2 border-roseTheme-dark border-t-transparent rounded-full animate-spin"></div>
                  )}
                </h2>

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
                    <div className="space-y-4">
                      {userComments.map((comment) => (
                          <div
                              key={comment.id}
                              className="border border-roseTheme-light rounded-xl p-4 hover:shadow-md transition"
                          >
                            <div className="flex-1">
                              <div className="flex-1">
                                {comment.author && (
                                    <p className="text-roseTheme-dark/80 text-xs font-semibold mb-2">
                                      👤 {comment.author}
                                    </p>
                                )}

                                <p className="text-roseTheme-dark text-sm mb-2">
                                  {comment.content}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-roseTheme-dark/60">
                                  <span>❤️ {comment.votes} likes</span>
                                  {comment.published_date && (
                                      <span>📅 {new Date(comment.published_date).toLocaleDateString('ca-ES')}</span>
                                  )}
                                  {comment.post && (
                                      <span className="text-roseTheme-dark/80">
          📝 Post #{comment.post}
        </span>
                                  )}
                                  <button
                                      onClick={() => toggleSaveComment(comment.id)}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '0',
                                        boxShadow: 'none',
                                        cursor: 'pointer'
                                      }}
                                      className="hover:scale-110 transition-transform"
                                      title={comment.is_saved ? "Desguardar" : "Guardar"}
                                  >
                                    {comment.is_saved ? (
                                        <span className="text-lg">🌟</span>
                                    ) : (
                                        <span className="text-lg text-gray-400 hover:text-yellow-400 transition-colors">⭐</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                            {comment.url && (
                                <a
                                    href={comment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-roseTheme-dark hover:underline text-sm mt-2 block"
                                >
                                  🔗 Veure comentari complet
                                </a>
                            )}
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
        )}
      {/* Secció de guardats */}
      {showSaved && (
          <div className="mt-6">
            <div className="bg-white rounded-2xl shadow-lg border border-roseTheme-light p-6">
              <h2 className="text-2xl font-bold text-roseTheme-dark mb-4 flex items-center gap-2">
                ⭐ Contingut guardat
                {loadingSaved && (
                    <div className="w-5 h-5 border-2 border-roseTheme-dark border-t-transparent rounded-full animate-spin"></div>
                )}
              </h2>

              {loadingSaved ? (
                  <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
                      <p className="text-roseTheme-dark">Carregant...</p>
                    </div>
                  </div>
              ) : savedPosts.length === 0 && savedComments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⭐</div>
                    <p className="text-roseTheme-dark/60 text-lg mb-2">No tens res guardat</p>
                    <p className="text-roseTheme-dark/40 text-sm">Guarda posts i comentaris per veure'ls aquí</p>
                  </div>
              ) : (
                  <div className="space-y-6">
                    {/* Posts guardats */}
                    {savedPosts.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-roseTheme-dark mb-3">📝 Posts guardats</h3>
                          <div className="space-y-4">
                            {savedPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="border border-roseTheme-light rounded-xl p-4 hover:shadow-md transition"
                                >
                                  <div className="flex items-start gap-4">
                                    {post.image && (
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-roseTheme-dark flex-1">
                                          {post.title}
                                        </h3>
                                        {post.communities && post.communities.length > 0 && (
                                            <span className="bg-roseTheme-light text-roseTheme-dark px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                              📁 {post.communities[0]}
                            </span>
                                        )}
                                      </div>
                                      <p className="text-roseTheme-dark/70 text-sm mb-2 line-clamp-2">
                                        {post.content}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-roseTheme-dark/60">
                                        <span>❤️ {post.votes} likes</span>
                                        {post.published_date && (
                                            <span>📅 {new Date(post.published_date).toLocaleDateString('ca-ES')}</span>
                                        )}
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
                                            title="Desguardar"
                                        >
                                          <span className="text-lg">🌟</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}

                    {/* Comentaris guardats */}
                    {savedComments.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-roseTheme-dark mb-3">💬 Comentaris guardats</h3>
                          <div className="space-y-4">
                            {savedComments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="border border-roseTheme-light rounded-xl p-4 hover:shadow-md transition"
                                >
                                  <div className="flex items-start gap-4">
                                    {comment.image && (
                                        <img
                                            src={comment.image}
                                            alt="Comment image"
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                      {comment.author && (
                                          <p className="text-roseTheme-dark/80 text-xs font-semibold mb-2">
                                            👤 {comment.author}
                                          </p>
                                      )}
                                      <p className="text-roseTheme-dark text-sm mb-2">
                                        {comment.content}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-roseTheme-dark/60">
                                        <span>❤️ {comment.votes} likes</span>
                                        {comment.published_date && (
                                            <span>📅 {new Date(comment.published_date).toLocaleDateString('ca-ES')}</span>
                                        )}
                                        <button
                                            onClick={() => toggleSaveComment(comment.id)}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              padding: '0',
                                              boxShadow: 'none',
                                              cursor: 'pointer'
                                            }}
                                            className="hover:scale-110 transition-transform"
                                            title="Desguardar"
                                        >
                                          <span className="text-lg">🌟</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}
                  </div>
              )}
            </div>
          </div>
      )}
    </div>
  );
};

export default PerfilPage;