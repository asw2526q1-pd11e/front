import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface Comment {
    id: number;
    content: string;
    image?: string | null;
}

interface Props {
    comment: Comment;
    apiKey: string;
    onClose: () => void;
    onCommentUpdated: () => void;
}

// Assumim que aquesta funció existeix a services/api
const updateComment = async (apiKey: string, commentId: number, content: string, image?: string | null) => {
    const response = await fetch(`/api/comments/${commentId}/`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Api-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, image }),
    });

    if (!response.ok) {
        throw new Error('Error actualitzant el comentari');
    }

    return response.json();
};

const EditCommentModal: React.FC<Props> = ({ comment, apiKey, onClose, onCommentUpdated }) => {
    const [content, setContent] = useState(comment.content);
    const [image, setImage] = useState(comment.image || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError('El contingut no pot estar buit');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await updateComment(apiKey, comment.id, content.trim(), image || null);
            onCommentUpdated();
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
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">✏️ Editar Comentari</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition"
                            title="Tancar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800">
                            <p className="font-semibold">❌ {error}</p>
                        </div>
                    )}

                    {/* Contingut */}
                    <div className="mb-6">
                        <label className="block text-roseTheme-dark font-bold mb-2">
                            Contingut *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-roseTheme-light rounded-xl focus:outline-none focus:border-roseTheme transition resize-none"
                            rows={6}
                            placeholder="Escriu el teu comentari..."
                        />
                    </div>

                    {/* URL de la imatge */}
                    <div className="mb-6">
                        <label className="block text-roseTheme-dark font-bold mb-2">
                            URL de la imatge (opcional)
                        </label>
                        <input
                            type="url"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-roseTheme-light rounded-xl focus:outline-none focus:border-roseTheme transition"
                            placeholder="https://exemple.com/imatge.jpg"
                        />
                        {image && (
                            <div className="mt-3 rounded-xl overflow-hidden border-2 border-roseTheme-light">
                                <img
                                    src={image}
                                    alt="Preview"
                                    className="w-full max-h-64 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Botons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-bold transition-all hover:scale-105"
                            disabled={isSubmitting}
                        >
                            Cancel·lar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 font-bold transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !content.trim()}
                        >
                            {isSubmitting ? '⏳ Guardant...' : '💾 Guardar Canvis'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditCommentModal;