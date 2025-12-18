import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { upvotePost, downvotePost, toggleSavePost, deletePost, getCommunityIdByName } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useSavedPosts } from '../context/SavedPostContext';
import { usePostVotes } from '../context/PostVoteContext';
import type { Post, PostCommunity } from '../services/api';

interface Props {
  post: Post;
  onPostDeleted?: (postId: number) => void;
  onPostEdited?: (post: Post) => void;
}

const PostCard: React.FC<Props> = ({ post, onPostDeleted, onPostEdited }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPostSaved, togglePostSaved } = useSavedPosts();
  const { getPostVote, setPostVote } = usePostVotes();
  const [votes, setVotes] = useState(post.votes);
  const userVote = getPostVote(post.id);
  const [isVoting, setIsVoting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSaved = isPostSaved(post.id);

  const isOwner = user && post.author &&
      (user as any).username?.toLowerCase() === post.author.toLowerCase();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sense data";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ara mateix";
    if (diffMins < 60) return `Fa ${diffMins}m`;
    if (diffHours < 24) return `Fa ${diffHours}h`;
    if (diffDays < 7) return `Fa ${diffDays}d`;

    return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.apiKey || isVoting) return;

    setIsVoting(true);
    try {
      const result = await upvotePost(user.apiKey, post.id);
      setVotes(result.votes);
      // Actualizar el voto en el contexto
      const newVote = userVote === 'up' ? null : 'up';
      setPostVote(post.id, newVote);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.apiKey || isVoting) return;

    setIsVoting(true);
    try {
      const result = await downvotePost(user.apiKey, post.id);
      setVotes(result.votes);
      // Actualizar el voto en el contexto
      const newVote = userVote === 'down' ? null : 'down';
      setPostVote(post.id, newVote);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.apiKey) return;

    try {
      const result = await toggleSavePost(user.apiKey, post.id);
      togglePostSaved(post.id, result.saved);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const postForEdit = {
      ...post,
      communities: post.communities
          ? post.communities.map(c => typeof c === 'string' ? c : c.name)
          : []
    };

    if (onPostEdited) {
      onPostEdited(postForEdit);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.apiKey) return;

    try {
      await deletePost(user.apiKey, post.id);
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      alert('Error eliminant el post. Torna-ho a intentar.');
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    navigate(`/posts/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.author_id) {
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

  return (
      <>
        <article
            onClick={handleCardClick}
            className="bg-white hover:bg-gradient-to-r hover:from-roseTheme-soft/20 hover:to-transparent transition-all duration-300 cursor-pointer group relative"
        >
          <div className="px-4 py-4">
            <div className="flex items-start gap-4">
              {/* Columna de votes */}
              <div className="flex flex-col items-center gap-1 min-w-[48px] pt-1">
                <button
                    onClick={handleUpvote}
                    disabled={!user || isVoting}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                        userVote === 'up'
                            ? 'bg-green-100 text-green-600 scale-110'
                            : 'hover:bg-green-50 text-roseTheme-dark/60 hover:text-green-600'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                    title="Upvote"
                >
                  <svg
                      className="w-6 h-6"
                      fill={userVote === 'up' ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <span className={`font-bold text-lg transition-colors ${
                    userVote === 'up' ? 'text-green-600' : userVote === 'down' ? 'text-red-600' : votes > 0 ? 'text-green-600' : votes < 0 ? 'text-red-600' : 'text-roseTheme-dark'
                }`}>
                {votes}
              </span>

                <button
                    onClick={handleDownvote}
                    disabled={!user || isVoting}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                        userVote === 'down'
                            ? 'bg-red-100 text-red-600 scale-110'
                            : 'hover:bg-red-50 text-roseTheme-dark/60 hover:text-red-600'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                    title="Downvote"
                >
                  <svg
                      className="w-6 h-6"
                      fill={userVote === 'down' ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Contingut principal */}
              <div className="flex-1 min-w-0">
                {/* Header amb avatar i info */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                      onClick={handleAuthorClick}
                      className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-md ${
                          post.author_id ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                      } transition`}
                  >
                    {post.author ? post.author[0].toUpperCase() : '?'}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span
                        onClick={handleAuthorClick}
                        className={`font-bold text-roseTheme-dark ${
                            post.author_id ? 'hover:underline cursor-pointer' : ''
                        }`}
                    >
                      u/{post.author || 'Anònim'}
                    </span>
                    <span className="text-roseTheme-dark/40">•</span>
                    <span className="text-roseTheme-dark/60">
                      {formatDate(post.published_date)}
                    </span>
                  </div>
                </div>

                {/* Comunitats - MEJORADO CON MEJOR MANEJO */}
                {post.communities && post.communities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.communities.map((community, idx) => {
                        const isObject = typeof community === 'object';
                        const communityId = isObject ? community.id : 0;
                        const communityName = isObject ? community.name : community;
                        const hasId = isObject && communityId > 0;

                        return (
                            <button
                                key={hasId ? communityId : `comm-${idx}`}
                                onClick={(e) => handleCommunityClick(e, community)}
                                className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-roseTheme-light to-rose-100 text-roseTheme-dark px-3 py-1 rounded-full font-semibold shadow-sm hover:from-rose-200 hover:to-rose-300 hover:scale-105 cursor-pointer transition-all duration-200"
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

                {/* Títol */}
                <h2 className="font-bold text-xl text-roseTheme-dark mb-2 leading-tight group-hover:text-rose-600 transition-colors">
                  {post.title}
                </h2>

                {/* Contingut */}
                <p className="text-roseTheme-dark/80 mb-3 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>

                {/* Imatge */}
                {post.image && (
                    <div className="rounded-xl overflow-hidden border-2 border-roseTheme-light mb-3 shadow-sm group-hover:border-roseTheme transition-colors">
                      <img
                          src={post.image}
                          alt={post.title}
                          className="w-full object-cover max-h-96"
                      />
                    </div>
                )}

                {/* Accions */}
                <div className="flex items-center gap-3 text-roseTheme-dark/60">
                  {/* Desar */}
                  {user && (
                      <button
                          onClick={handleSave}
                          className={`flex items-center gap-2 transition-all group/btn ${
                              isSaved ? 'text-amber-600' : 'hover:text-amber-600'
                          }`}
                          title={isSaved ? "Desguardar" : "Guardar"}
                      >
                        <div className={`rounded-full p-2 transition-all group-hover/btn:scale-110 ${
                            isSaved ? 'bg-amber-100' : 'group-hover/btn:bg-amber-100'
                        }`}>
                          <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">{isSaved ? 'Desat' : 'Desar'}</span>
                      </button>
                  )}

                  {/* Editar */}
                  {isOwner && (
                      <button
                          onClick={handleEdit}
                          className="flex items-center gap-2 hover:text-blue-600 transition-all group/btn"
                          title="Editar post"
                      >
                        <div className="group-hover/btn:bg-blue-100 rounded-full p-2 transition-all group-hover/btn:scale-110">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">Editar</span>
                      </button>
                  )}

                  {/* Eliminar */}
                  {isOwner && (
                      <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowDeleteConfirm(true);
                          }}
                          className="flex items-center gap-2 hover:text-red-600 transition-all group/btn"
                          title="Eliminar post"
                      >
                        <div className="group-hover/btn:bg-red-100 rounded-full p-2 transition-all group-hover/btn:scale-110">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">Eliminar</span>
                      </button>
                  )}

                  {/* Enllaç extern */}
                  {post.url && !post.url.includes('/blog/posts/') && !post.url.includes('/api/posts/') && (
                      <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto flex items-center gap-2 hover:text-roseTheme transition-all group/btn"
                      >
                        <div className="group-hover/btn:bg-roseTheme-light rounded-full p-2 transition-all group-hover/btn:scale-110">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">Enllaç</span>
                      </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Modal de confirmació d'eliminació */}
        {showDeleteConfirm && createPortal(
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
            >
              <div
                  className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-red-200"
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-roseTheme-dark mb-2">
                    Eliminar post?
                  </h3>
                  <p className="text-roseTheme-dark/70 mb-2">
                    Aquesta acció no es pot desfer.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                    <p className="text-sm font-semibold text-red-800">
                      "{post.title}"
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(false);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-bold transition-all hover:scale-105"
                  >
                    Cancel·lar
                  </button>
                  <button
                      onClick={handleDelete}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-bold transition-all hover:scale-105 shadow-lg"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>,
            document.body
        )}
      </>
  );
};

export default PostCard;