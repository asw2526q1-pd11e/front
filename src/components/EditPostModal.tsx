import { useState, useEffect } from 'react';
import { fetchCommunities, updatePost, type Community, type Post } from '../services/api';

interface EditPostModalProps {
    post: Post;
    apiKey: string;
    onClose: () => void;
    onPostUpdated: () => void;
}

const EditPostModal = ({ post, apiKey, onClose, onPostUpdated }: EditPostModalProps) => {
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);
    const [url, setUrl] = useState(post.url || '');
    const [image, setImage] = useState<File | null>(null);
    const [selectedCommunities, setSelectedCommunities] = useState<string[]>(post.communities || []);
    const [availableCommunities, setAvailableCommunities] = useState<Community[]>([]);
    const [loadingCommunities, setLoadingCommunities] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCommunities = async () => {
            try {
                const data = await fetchCommunities(apiKey, 'all');
                setAvailableCommunities(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching communities:', err);
                setError('No s\'han pogut carregar les comunitats');
            } finally {
                setLoadingCommunities(false);
            }
        };

        loadCommunities();
    }, [apiKey]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleCommunityToggle = (communityName: string) => {
        setSelectedCommunities(prev => {
            if (prev.includes(communityName)) {
                return prev.filter(c => c !== communityName);
            } else {
                return [...prev, communityName];
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await updatePost(apiKey, post.id, {
                title,
                content,
                url: url || undefined,
                image: image || undefined,
                communities: selectedCommunities,
            });

            onPostUpdated();
            onClose();
        } catch (err: any) {

            let errorMessage = 'Error actualitzant el post';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-6 py-4 rounded-t-2xl z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">✏️ Editar Post #{post.id}</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl">
                            <p className="font-semibold">❌ Error</p>
                            <pre className="text-xs mt-2 whitespace-pre-wrap overflow-x-auto">{error}</pre>
                        </div>
                    )}

                    {/* Títol */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            📝 TÍTOL *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            placeholder="Escriu un títol atractiu..."
                            className="w-full px-4 py-2 border-2 border-rose-400 rounded-xl focus:outline-none focus:border-rose-600"
                        />
                        <p className="text-xs text-rose-600 mt-1">
                            {title.length}/200 caràcters
                        </p>
                    </div>

                    {/* Contingut */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            📄 CONTINGUT *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={5000}
                            rows={8}
                            placeholder="Comparteix els teus pensaments..."
                            className="w-full resize-none px-4 py-2 border-2 border-rose-400 rounded-xl focus:outline-none focus:border-rose-600"
                        />
                        <p className="text-xs text-rose-600 mt-1">
                            {content.length}/5000 caràcters
                        </p>
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            🔗 ENLLAÇ (opcional)
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://exemple.com"
                            className="w-full px-4 py-2 border-2 border-rose-400 rounded-xl focus:outline-none focus:border-rose-600"
                        />
                    </div>

                    {/* Imatge actual */}
                    {post.image && !image && (
                        <div>
                            <label className="block text-rose-800 font-bold text-sm mb-2">
                                🖼️ IMATGE ACTUAL
                            </label>
                            <img
                                src={post.image}
                                alt="Imatge actual"
                                className="w-full h-48 object-cover rounded-xl border-2 border-rose-300"
                            />
                        </div>
                    )}

                    {/* Imatge nova */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            🖼️ {post.image ? 'CANVIAR IMATGE' : 'AFEGIR IMATGE'} (opcional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full bg-white border-2 border-rose-400 rounded-2xl px-5 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rose-100 file:text-rose-700 file:font-semibold hover:file:bg-rose-200 transition"
                        />
                        {image && (
                            <p className="text-sm text-rose-700 mt-2 font-medium">
                                📎 {image.name}
                            </p>
                        )}
                    </div>

                    {/* Comunitats */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            📁 COMUNITATS * ({selectedCommunities.length} seleccionades)
                        </label>

                        {loadingCommunities ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-rose-700">Carregant comunitats...</span>
                            </div>
                        ) : availableCommunities.length === 0 ? (
                            <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 px-4 py-3 rounded-xl">
                                <p className="text-sm">No hi ha comunitats disponibles</p>
                            </div>
                        ) : (
                            <div className="border-2 border-rose-400 rounded-2xl p-3 max-h-48 overflow-y-auto bg-white">
                                <div className="space-y-2">
                                    {availableCommunities.map(community => (
                                        <label
                                            key={community.id}
                                            className="flex items-center gap-3 p-2 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCommunities.includes(community.name)}
                                                onChange={() => handleCommunityToggle(community.name)}
                                                className="w-5 h-5 text-rose-500 border-2 border-rose-400 rounded focus:ring-2 focus:ring-rose-300"
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                {community.avatar && (
                                                    <img
                                                        src={community.avatar}
                                                        alt={community.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-rose-900">{community.name}</p>
                                                    <p className="text-xs text-rose-600">
                                                        👥 {community.subs_count} · 📝 {community.posts_count}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedCommunities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedCommunities.map(community => (
                                    <span
                                        key={community}
                                        className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-semibold"
                                    >
                                        {community}
                                        <button
                                            type="button"
                                            onClick={() => handleCommunityToggle(community)}
                                            className="hover:text-rose-600 transition ml-1"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            ❌ Cancel·lar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !title.trim() || !content.trim() || selectedCommunities.length === 0}
                            className="flex-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Guardant...
                                </span>
                            ) : (
                                '💾 Guardar Canvis'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;