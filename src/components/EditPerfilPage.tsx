import { useState } from 'react';

const EditProfileModal = ({ profile, apiKey, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: profile.nombre,
        bio: profile.bio
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '');
    const [bannerPreview, setBannerPreview] = useState(profile.banner || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview('');
    };

    const removeBanner = () => {
        setBannerFile(null);
        setBannerPreview('');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const formDataToSend = new FormData();

            formDataToSend.append('nombre', formData.nombre);
            formDataToSend.append('bio', formData.bio);

            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            }

            if (bannerFile) {
                formDataToSend.append('banner', bannerFile);
            }

            console.log('Enviant dades:', {
                nombre: formData.nombre,
                bio: formData.bio,
                avatarFile: avatarFile?.name,
                bannerFile: bannerFile?.name,
                apiKey: apiKey ? '✓' : '✗'
            });

            const response = await fetch('/api/accounts/users/me/', {
                method: 'PUT',
                headers: {
                    'X-API-Key': apiKey
                },
                body: formDataToSend
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error response:', errorData);
                throw new Error(errorData?.detail || errorData?.error || `Error ${response.status}: ${response.statusText}`);
            }

            const updatedProfile = await response.json();
            console.log('Perfil actualitzat:', updatedProfile);
            onSave(updatedProfile);
            onClose();
        } catch (err) {
            console.error('Error complet:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-roseTheme-light px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-roseTheme-dark">✏️ Editar perfil</h2>
                    <button
                        onClick={onClose}
                        className="text-roseTheme-dark/60 hover:text-roseTheme-dark text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-roseTheme-light/50 transition"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            ❌ {error}
                        </div>
                    )}

                    {/* Banner */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-roseTheme-dark mb-2">
                            🖼️ Banner
                        </label>
                        <div
                            className="h-32 rounded-xl bg-gradient-to-r from-roseTheme-light via-roseTheme-accent to-roseTheme mb-2 relative overflow-hidden group"
                            style={bannerPreview ? {
                                backgroundImage: `url(${bannerPreview})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            } : {}}
                        >
                            {bannerPreview && (
                                <button
                                    onClick={removeBanner}
                                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <label className="flex-1 px-4 py-2.5 bg-roseTheme-light text-roseTheme-dark rounded-lg hover:bg-roseTheme-accent transition cursor-pointer text-center font-semibold">
                                📁 Seleccionar imatge
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                    className="hidden"
                                />
                            </label>
                            {bannerFile && (
                                <div className="px-4 py-2.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center">
                                    ✓ {bannerFile.name.slice(0, 20)}...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-roseTheme-dark mb-2">
                            👤 Avatar
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        className="w-24 h-24 rounded-full border-2 border-roseTheme-light object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-roseTheme-dark to-roseTheme flex items-center justify-center text-white text-3xl font-bold border-2 border-roseTheme-light">
                                        {formData.nombre.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {avatarPreview && (
                                    <button
                                        onClick={removeAvatar}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 text-sm"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block px-4 py-2.5 bg-roseTheme-light text-roseTheme-dark rounded-lg hover:bg-roseTheme-accent transition cursor-pointer text-center font-semibold">
                                    📁 Seleccionar imatge
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                                {avatarFile && (
                                    <div className="mt-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold text-center">
                                        ✓ {avatarFile.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nom */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-roseTheme-dark mb-2">
                            ✨ Nom
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            maxLength={50}
                            className="w-full px-4 py-2.5 border border-roseTheme-light rounded-lg focus:outline-none focus:ring-2 focus:ring-roseTheme-accent"
                        />
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-roseTheme-dark mb-2">
                            📝 Biografia
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            maxLength={200}
                            className="w-full px-4 py-2.5 border border-roseTheme-light rounded-lg focus:outline-none focus:ring-2 focus:ring-roseTheme-accent resize-none"
                        />
                        <p className="text-xs text-roseTheme-dark/60 mt-1 text-right">
                            {formData.bio.length}/200
                        </p>
                    </div>

                    {/* Botons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-roseTheme-light text-roseTheme-dark font-semibold rounded-xl hover:bg-roseTheme-light/50 transition"
                        >
                            Cancel·lar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-roseTheme-dark text-white font-semibold rounded-xl hover:bg-roseTheme transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardant...
                </span>
                            ) : (
                                '💾 Guardar canvis'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;