import { useState, useEffect } from 'react';
import { fetchCommunities, createPost, type Community } from '../services/api';

interface CreatePostModalProps {
    apiKey: string;
    onClose: () => void;
    onPostCreated: () => void;
}

const CreatePostModal = ({ apiKey, onClose, onPostCreated }: CreatePostModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [url, setUrl] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
    const [availableCommunities, setAvailableCommunities] = useState<Community[]>([]);
    const [loadingCommunities, setLoadingCommunities] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carregar comunitats
    useEffect(() => {
        const loadCommunities = async () => {
            try {
                console.log('Carregant comunitats amb apiKey:', apiKey);
                const data = await fetchCommunities(apiKey, 'all');
                console.log('Comunitats carregades:', data);
                setAvailableCommunities(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching communities:', err);
                // Si no es poden carregar les comunitats, continuem sense elles
                // No és obligatori tenir comunitats per crear un post
                setAvailableCommunities([]);
                setError(null); // No mostrem error, ja que no és crític
                console.log('Continuant sense comunitats - això és opcional');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🚀 Iniciant creació del post...');
        console.log('📝 Dades del post:', {
            title,
            content: content.substring(0, 50) + '...',
            url,
            hasImage: !!image,
            communities: selectedCommunities
        });
        
        setLoading(true);
        setError(null);

        try {
            console.log('📡 Enviant petició a createPost...');
            const result = await createPost(apiKey, {
                title,
                content,
                url: url || undefined,
                image: image || undefined,
                communities: selectedCommunities, // Pot estar buit, no passa res
            });
            
            console.log('✅ Post creat correctament:', result);
            console.log('🔄 Actualitzant llista de posts...');
            onPostCreated();
            console.log('❌ Tancant modal...');
            onClose();
        } catch (err) {
            console.error('❌ Error creant post:', err);
            console.error('❌ Error complet:', JSON.stringify(err, null, 2));
            const errorMessage = err instanceof Error ? err.message : 'Error desconegut';
            console.error('❌ Missatge error final:', errorMessage);
            setError(`Error: ${errorMessage}`);
            // NO tanquem el modal quan hi ha error perquè l'usuari pugui veure'l
            console.log('⚠️ Modal mantingut obert per mostrar error');
        } finally {
            console.log('🏁 Finalitzant handleSubmit, loading = false');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">✍️ Crear Post Nou</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                            style={{ background: 'transparent', boxShadow: 'none' }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl">
                            <p className="font-semibold">❌ Error</p>
                            <p className="text-sm">{error}</p>
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
                            required
                            placeholder="Escriu un títol atractiu..."
                            className="w-full"
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
                            required
                            rows={8}
                            placeholder="Comparteix els teus pensaments..."
                            className="w-full resize-none"
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
                            className="w-full"
                        />
                    </div>

                    {/* Imatge */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            🖼️ IMATGE (opcional)
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
                            📁 COMUNITATS (opcional) ({selectedCommunities.length} seleccionades)
                        </label>

                        {loadingCommunities ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-rose-700">Carregant comunitats...</span>
                            </div>
                        ) : availableCommunities.length === 0 ? (
                            <div className="bg-blue-50 border-2 border-blue-300 text-blue-800 px-4 py-3 rounded-xl">
                                <p className="text-sm">
                                    📋 No hi ha comunitats disponibles. Pots crear el post sense comunitat.
                                </p>
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
                                            className="hover:text-rose-600 transition"
                                            style={{ background: 'transparent', padding: '0 0 0 4px', boxShadow: 'none' }}
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
                            style={{ boxShadow: 'none' }}
                        >
                            ❌ Cancel·lar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim() || !content.trim()}
                            className="flex-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Publicant...
                </span>
                            ) : (
                                '✨ Publicar Post'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;