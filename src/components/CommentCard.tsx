import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { upvoteComment, downvoteComment, deleteComment, toggleSaveComment } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useSavedComments } from '../context/SavedCommentContext';
import EditCommentModal from './EditCommentModal';

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

interface Props {
    comment: Comment;
    depth?: number;
    onReply?: (commentId: number, author: string) => void;
    onCommentDeleted?: (commentId: number) => void;
    onCommentUpdated?: (updatedComment: Comment) => void;
    onCommentUnsaved?: (commentId: number) => void;
}

const CommentCard: React.FC<Props> = ({
                                          comment,
                                          depth = 0,
                                          onReply,
                                          onCommentDeleted,
                                          onCommentUpdated,
                                          onCommentUnsaved
                                      }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isCommentSaved, toggleCommentSaved } = useSavedComments();
    const [localComment, setLocalComment] = useState(comment);
    const [votes, setVotes] = useState(comment.votes);
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(
        comment.user_vote === 1 ? 'up' : comment.user_vote === -1 ? 'down' : null
    );
    const [isVoting, setIsVoting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);

    // Usar l'estat global en lloc de l'estat local
    const isSaved = isCommentSaved(comment.id);

    // Actualitzar l'estat local quan canvia el prop
    useEffect(() => {
        setLocalComment(comment);
    }, [comment]);

    const isOwner = user && localComment.author &&
        (user as any).username?.toLowerCase() === localComment.author.toLowerCase();

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
            const result = await upvoteComment(user.apiKey, comment.id);
            setVotes(result.votes);
            setUserVote(userVote === 'up' ? null : 'up');
        } catch (error) {
            console.error('Error fent upvote:', error);
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
            const result = await downvoteComment(user.apiKey, comment.id);
            setVotes(result.votes);
            setUserVote(userVote === 'down' ? null : 'down');
        } catch (error) {
            console.error('Error fent downvote:', error);
        } finally {
            setIsVoting(false);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingComment(localComment);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.apiKey) return;

        try {
            await deleteComment(user.apiKey, comment.id);
            if (onCommentDeleted) {
                onCommentDeleted(comment.id);
            }
            setShowDeleteConfirm(false);
        } catch (error) {
            alert('Error eliminant el comentari. Torna-ho a intentar.');
        }
    };

    const handleReplyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onReply) {
            onReply(comment.id, comment.author || 'Anònim');
        }
    };

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (comment.author_id) {
            navigate(`/users/${comment.author_id}`);
        }
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.apiKey) return;

        try {
            const result = await toggleSaveComment(user.apiKey, comment.id);

            // Actualitzar l'estat global
            toggleCommentSaved(comment.id, result.saved);

            // Actualitzar també el comentari local
            setLocalComment(prev => ({ ...prev, is_saved: result.saved }));

            // Si es desguarda i tenim callback, notificar al pare
            if (!result.saved && onCommentUnsaved) {
                onCommentUnsaved(comment.id);
            }
        } catch (error) {
            console.error('Error guardant comentari:', error);
        }
    };

    return (
        <>
            <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
                <article className="border-2 border-roseTheme-light/50 rounded-xl p-4 hover:border-roseTheme-light transition bg-white">
                    <div className="flex items-start gap-4">
                        {/* Columna de votes */}
                        <div className="flex flex-col items-center gap-1 min-w-[40px] pt-1">
                            <button
                                onClick={handleUpvote}
                                disabled={!user || isVoting}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                    userVote === 'up'
                                        ? 'bg-green-100 text-green-600 scale-110'
                                        : 'hover:bg-green-50 text-roseTheme-dark/60 hover:text-green-600'
                                } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                                title="Upvote"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill={userVote === 'up' ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                </svg>
                            </button>

                            <span className={`font-semibold text-sm transition-colors ${
                                userVote === 'up' ? 'text-green-600' :
                                    userVote === 'down' ? 'text-red-600' :
                                        votes > 0 ? 'text-green-600' :
                                            votes < 0 ? 'text-red-600' : 'text-roseTheme-dark'
                            }`}>
                {votes}
              </span>

                            <button
                                onClick={handleDownvote}
                                disabled={!user || isVoting}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                    userVote === 'down'
                                        ? 'bg-red-100 text-red-600 scale-110'
                                        : 'hover:bg-red-50 text-roseTheme-dark/60 hover:text-red-600'
                                } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                                title="Downvote"
                            >
                                <svg
                                    className="w-4 h-4"
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
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    onClick={handleAuthorClick}
                                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white font-bold text-sm ${
                                        comment.author_id ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                                    } transition`}
                                >
                                    {comment.author ? comment.author[0].toUpperCase() : '?'}
                                </div>

                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                    <span
                                        onClick={handleAuthorClick}
                                        className={`font-bold text-roseTheme-dark ${
                                            comment.author_id ? 'hover:underline cursor-pointer' : ''
                                        }`}
                                    >
                                        u/{comment.author || 'Anònim'}
                                    </span>
                                    <span className="text-roseTheme-dark/40">•</span>
                                    <span className="text-roseTheme-dark/60">
                                        {formatDate(comment.published_date)}
                                    </span>
                                    {depth > 0 && (
                                        <>
                                            <span className="text-roseTheme-dark/40">•</span>
                                            <span className="text-xs text-roseTheme-dark/40 font-medium">
                                                Resposta
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Contingut */}
                            <p className="text-roseTheme-dark/80 mb-3 whitespace-pre-wrap leading-relaxed">
                                {localComment.content}
                            </p>

                            {/* Imatge */}
                            {localComment.image && (
                                <div className="rounded-lg overflow-hidden border-2 border-roseTheme-light mb-3 shadow-sm">
                                    <img
                                        src={localComment.image}
                                        alt="Comment"
                                        className="w-full object-cover max-h-64"
                                    />
                                </div>
                            )}

                            {/* Accions */}
                            <div className="flex items-center gap-3 text-roseTheme-dark/60 text-sm">
                                {/* Comptador de respostes */}
                                {localComment.replies && localComment.replies.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-roseTheme-dark/50">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        {localComment.replies.length} {localComment.replies.length === 1 ? 'resposta' : 'respostes'}
                                    </span>
                                )}

                                {/* Guardar */}
                                {user && (
                                    <button
                                        onClick={handleSave}
                                        className={`flex items-center gap-2 transition-all group/btn ${
                                            isSaved ? 'text-amber-600' : 'hover:text-amber-600'
                                        }`}
                                        title={isSaved ? "Desguardar" : "Guardar"}
                                    >
                                        <div className={`rounded-full p-1.5 transition-all group-hover/btn:scale-110 ${
                                            isSaved ? 'bg-amber-100' : 'group-hover/btn:bg-amber-100'
                                        }`}>
                                            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">{isSaved ? 'Desat' : 'Desar'}</span>
                                    </button>
                                )}

                                {/* Respondre */}
                                {user && onReply && (
                                    <button
                                        onClick={handleReplyClick}
                                        className="flex items-center gap-2 hover:text-roseTheme transition-all group/btn"
                                        title="Respondre"
                                    >
                                        <div className="group-hover/btn:bg-roseTheme-light rounded-full p-1.5 transition-all group-hover/btn:scale-110">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">Respondre</span>
                                    </button>
                                )}

                                {/* Editar */}
                                {isOwner && (
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center gap-2 hover:text-blue-600 transition-all group/btn"
                                        title="Editar comentari"
                                    >
                                        <div className="group-hover/btn:bg-blue-100 rounded-full p-1.5 transition-all group-hover/btn:scale-110">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">Editar</span>
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
                                        title="Eliminar comentari"
                                    >
                                        <div className="group-hover/btn:bg-red-100 rounded-full p-1.5 transition-all group-hover/btn:scale-110">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">Eliminar</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </article>

                {/* Renderitzar respostes recursivament */}
                {localComment.replies && localComment.replies.length > 0 && (
                    <div className="space-y-3 mt-3">
                        {localComment.replies.map(reply => (
                            <CommentCard
                                key={reply.id}
                                comment={reply}
                                depth={depth + 1}
                                onReply={onReply}
                                onCommentDeleted={onCommentDeleted}
                                onCommentUpdated={onCommentUpdated}
                                onCommentUnsaved={onCommentUnsaved}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal d'edició */}
            {editingComment && user?.apiKey && (
                <EditCommentModal
                    comment={editingComment}
                    apiKey={user.apiKey}
                    onClose={() => setEditingComment(null)}
                    onCommentUpdated={(updatedComment) => {
                        const commentWithReplies = {
                            ...updatedComment,
                            replies: localComment.replies,
                            user_vote: localComment.user_vote
                        };

                        setLocalComment(commentWithReplies);

                        if (onCommentUpdated) {
                            onCommentUpdated(commentWithReplies);
                        }

                        setEditingComment(null);
                    }}
                />
            )}

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
                                Eliminar comentari?
                            </h3>
                            <p className="text-roseTheme-dark/70 mb-2">
                                Aquesta acció no es pot desfer.
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                                <p className="text-sm text-red-800 line-clamp-3">
                                    "{localComment.content}"
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

export default CommentCard;