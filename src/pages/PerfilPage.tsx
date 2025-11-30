import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchUserProfile, type UserProfile } from '../services/api';

const PerfilPage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <button className="bg-roseTheme-dark text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-roseTheme transition shadow-md hover:shadow-lg">
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
              <p className="text-3xl font-bold text-roseTheme-dark">24</p>
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
            <button className="flex-1 bg-roseTheme-light text-roseTheme-dark font-semibold py-3 rounded-xl hover:bg-roseTheme-accent transition border border-roseTheme-accent">
              📝 Els meus posts
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
    </div>
  );
};

export default PerfilPage;