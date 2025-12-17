import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { updateComment } from '../services/api';

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
    apiKey: string;
    onClose: () => void;
    onCommentUpdated: (updatedComment: Comment) => void;
}

const EditCommentModal: React.FC<Props> = ({ comment, apiKey, onClose, onCommentUpdated }) => {
    const [content, setContent] = useState(comment.content);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(comment.image || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('El contingut no pot estar buit');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const updatedComment = await updateComment(apiKey, comment.id, content, image);
            onCommentUpdated(updatedComment);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error actualitzant el comentari');
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-2 border-roseTheme-light max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-roseTheme-dark">
                        ✏️ Editar comentari
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-roseTheme-dark/60 hover:text-roseTheme-dark transition p-2 hover:bg-roseTheme-light rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                        ❌ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contingut */}
                    <div>
                        <label className="block text-sm font-bold text-roseTheme-dark mb-2">
                            Contingut *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-roseTheme-light rounded-xl focus:border-roseTheme focus:ring-2 focus:ring-roseTheme/20 transition resize-none"
                            rows={6}
                            placeholder="Escriu el teu comentari..."
                            required
                        />
                    </div>

                    {/* Imatge */}
                    <div>
                        <label className="block text-sm font-bold text-roseTheme-dark mb-2">
                            Imatge
                        </label>

                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full max-h-64 object-cover rounded-xl border-2 border-roseTheme-light"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-roseTheme-light rounded-xl cursor-pointer hover:border-roseTheme transition bg-roseTheme-soft/20">
                                <svg className="w-10 h-10 text-roseTheme-dark/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-roseTheme-dark/60">
                  Clica per pujar una imatge
                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Botons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-bold transition-all hover:scale-105"
                            disabled={isSubmitting}
                        >
                            Cancel·lar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-roseTheme to-roseTheme-dark text-white rounded-xl hover:from-roseTheme-dark hover:to-roseTheme font-bold transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !content.trim()}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardant...
                </span>
                            ) : (
                                '💾 Guardar canvis'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EditCommentModal;