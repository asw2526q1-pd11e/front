import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchUserProfile, fetchUserPosts, fetchUserComments, type UserProfile, type Post, type Comment } from '../services/api';
import EditProfileModal from '../components/EditPerfilPage';

const PerfilPage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showMyComments, setShowMyComments] = useState(false);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

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

  const handleShowMyPosts = () => {
    setShowMyPosts(!showMyPosts);
    if (!showMyPosts) {
      setShowMyComments(false); // Cierra comentarios
    }
  };

  useEffect(() => {
    if (user?.apiKey) {
      loadUserPosts(); // Cargar posts automáticamente
    }
  }, [user]);

  const toggleSavePost = (postId: number) => {
    setUserPosts(prevPosts =>
        prevPosts.map(post =>
            post.id === postId
                ? { ...post, is_saved: !post.is_saved }
                : post
        )
    );
    console.log('Toggle save post:', postId);
  };

  const toggleSaveComment = (commentId: number) => {
    setUserComments(prevComments =>
        prevComments.map(comment =>
            comment.id === commentId
                ? { ...comment, is_saved: !comment.is_saved }
                : comment
        )
    );
    console.log('Toggle save comment:', commentId);
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

  const handleShowMyComments = () => {
    setShowMyComments(!showMyComments);
    if (!showMyComments) {
      setShowMyPosts(false); // Cierra posts
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
            {/* Avatar */}
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

            {/* Botó d'editar */}
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

            {/* Bio */}
            <div className="bg-roseTheme-soft/50 rounded-xl p-4 mb-6 border border-roseTheme-light">
              <p className="text-roseTheme-dark leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* API Key */}
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
              <p className="text-3xl font-bold text-roseTheme-dark">156</p>
              <p className="text-sm text-roseTheme-dark/60 font-medium">Likes</p>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-roseTheme-soft to-roseTheme-light rounded-xl border border-roseTheme-light shadow-sm">
              <p className="text-3xl font-bold text-roseTheme-dark">8</p>
              <p className="text-sm text-roseTheme-dark/60 font-medium">Comunitats</p>
            </div>
          </div>

          {/* Accions */}
          <div className="flex gap-3">
            <button
                onClick={handleShowMyPosts}
                className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                    showMyPosts
                        ? 'bg-roseTheme-dark text-white border-roseTheme-dark'
                        : 'bg-roseTheme-light text-roseTheme-dark border-roseTheme-accent hover:bg-roseTheme-accent'
                }`}
            >
              📝 Els meus posts
            </button>
            <button
                onClick={handleShowMyComments}
                className={`flex-1 font-semibold py-3 rounded-xl transition border ${
                    showMyComments
                        ? 'bg-roseTheme-dark text-white border-roseTheme-dark'
                        : 'bg-roseTheme-light text-roseTheme-dark border-roseTheme-accent hover:bg-roseTheme-accent'
                }`}
            >
              💬 Els meus comentaris
            </button>
            <button className="flex-1 bg-roseTheme-light text-roseTheme-dark font-semibold py-3 rounded-xl hover:bg-roseTheme-accent transition border border-roseTheme-accent">
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
                              {/* Títol i comunitat */}
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

                              {/* Data i estrella */}
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
                              {/* Autor del comentari */}
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
    </div>
  );
};

export default PerfilPage;