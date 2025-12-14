import { useState } from 'react';
import { createCommunity } from '../services/api';

interface CreateCommunityModalProps {
    apiKey: string;
    onClose: () => void;
    onCommunityCreated: () => void;
}

const CreateCommunityModal = ({ apiKey, onClose, onCommunityCreated }: CreateCommunityModalProps) => {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBanner(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createCommunity(apiKey, {
                name,
                avatar: avatar || undefined,
                banner: banner || undefined,
            });

            onCommunityCreated();
            onClose();
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'Error desconegut');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">👥 Crear Comunitat Nova</h2>
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

                    {/* Nom */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            📝 NOM DE LA COMUNITAT *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Ex: Tecnologia, Ciència, Art..."
                            className="w-full"
                        />
                        <p className="text-xs text-rose-600 mt-1">
                            Tria un nom descriptiu i únic per la teva comunitat
                        </p>
                    </div>

                    {/* Avatar */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            🖼️ AVATAR (opcional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="w-full bg-white border-2 border-rose-400 rounded-2xl px-5 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rose-100 file:text-rose-700 file:font-semibold hover:file:bg-rose-200 transition"
                        />
                        {avatar && (
                            <div className="mt-3 flex items-center gap-3">
                                <img
                                    src={URL.createObjectURL(avatar)}
                                    alt="Avatar preview"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-rose-300"
                                />
                                <p className="text-sm text-rose-700 font-medium">
                                    📎 {avatar.name}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Banner */}
                    <div>
                        <label className="block text-rose-800 font-bold text-sm mb-2">
                            🎨 BANNER (opcional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerChange}
                            className="w-full bg-white border-2 border-rose-400 rounded-2xl px-5 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rose-100 file:text-rose-700 file:font-semibold hover:file:bg-rose-200 transition"
                        />
                        {banner && (
                            <div className="mt-3">
                                <img
                                    src={URL.createObjectURL(banner)}
                                    alt="Banner preview"
                                    className="w-full h-32 rounded-xl object-cover border-2 border-rose-300"
                                />
                                <p className="text-sm text-rose-700 font-medium mt-2">
                                    📎 {banner.name}
                                </p>
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
                            disabled={loading || !name.trim()}
                            className="flex-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creant...
                </span>
                            ) : (
                                '✨ Crear Comunitat'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCommunityModal;