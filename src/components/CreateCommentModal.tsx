import { useState } from 'react';
import { createPortal } from 'react-dom';
import { createComment } from '../services/api';

interface Props {
    postId: number;
    parentId?: number | null;
    apiKey: string;
    onClose: () => void;
    onCommentCreated: () => void;
    parentAuthor?: string;
}

export default function CreateCommentModal({ postId, parentId, apiKey, onClose, onCommentCreated, parentAuthor }: Props) {
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
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

        setLoading(true);
        setError(null);

        try {
            await createComment(apiKey, postId, {
                content: content.trim(),
                parent_id: parentId || undefined,
                image: image,
            });

            onCommentCreated();
            onClose();
        } catch (err) {
            console.error('Error creating comment:', err);
            setError(err instanceof Error ? err.message : 'Error desconegut');
        } finally {
            setLoading(false);
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
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-roseTheme-light via-roseTheme-accent to-roseTheme px-6 py-4 border-b-2 border-roseTheme-light flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-roseTheme-dark">
                            {parentId ? '💬 Respondre comentari' : '💬 Nou comentari'}
                        </h2>
                        {parentAuthor && (
                            <p className="text-sm text-roseTheme-dark/70 mt-1">
                                Responent a <span className="font-semibold">u/{parentAuthor}</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-roseTheme-dark hover:bg-white/50 rounded-full p-2 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl">
                            <p className="font-semibold">❌ {error}</p>
                        </div>
                    )}

                    {/* Content */}
                    <div className="mb-6">
                        <label className="block text-roseTheme-dark font-bold mb-2">
                            Contingut *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-roseTheme-light rounded-xl focus:outline-none focus:border-roseTheme transition resize-none"
                            rows={6}
                            placeholder="Escriu el teu comentari aquí..."
                            required
                        />
                        <p className="text-sm text-roseTheme-dark/60 mt-1">
                            {content.length} caràcters
                        </p>
                    </div>

                    {/* Image */}
                    <div className="mb-6">
                        <label className="block text-roseTheme-dark font-bold mb-2">
                            Imatge (opcional)
                        </label>

                        {!imagePreview ? (
                            <label className="block border-2 border-dashed border-roseTheme-light rounded-xl p-8 text-center cursor-pointer hover:border-roseTheme hover:bg-roseTheme-soft/20 transition">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <svg className="w-12 h-12 mx-auto text-roseTheme-dark/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-roseTheme-dark/60 font-medium">
                                    Fes clic per pujar una imatge
                                </p>
                                <p className="text-sm text-roseTheme-dark/40 mt-1">
                                    PNG, JPG, GIF fins a 10MB
                                </p>
                            </label>
                        ) : (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full rounded-xl border-2 border-roseTheme-light"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t-2 border-roseTheme-light">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            Cancel·lar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="flex-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Publicant...
                                </span>
                            ) : (
                                '💬 Publicar comentari'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}