import { useEffect, useState } from 'react';
import { fetchCommunities, type Community } from '../services/api';
import CommunityCard from '../components/CommunityCard';
import { useAuth } from '../hooks/useAuth';
import CreateCommunityModal from '../components/CreateCommunityModal';

const ComunitatsPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  const loadCommunities = () => {
    setLoading(true);
    fetchCommunities(user?.apiKey || '', 'all')
        .then(data => {
          setCommunities(data);
          setError(null);
        })
        .catch(err => {
          console.error("Error fetching communities:", err);
          setError(err.message || "No s'han pogut carregar les comunitats");
        })
        .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCommunities();
  }, [user]);

  const handleCommunityCreated = () => {
    loadCommunities(); // Recarregar comunitats després de crear-ne una
  };

  const filteredCommunities = communities.filter(community =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-roseTheme-light border-t-roseTheme-dark rounded-full animate-spin"></div>
            <p className="text-roseTheme-dark text-lg">Carregant comunitats...</p>
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

  return (
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Botó flotant per crear comunitat */}
        {user && (
            <button
                onClick={() => setShowCreateModal(true)}
                className="fixed bottom-8 right-8 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold px-6 py-4 rounded-full shadow-2xl hover:shadow-rose-500/50 hover:scale-110 transition-all duration-300 flex items-center gap-2 z-40"
            >
              <span className="text-2xl">➕</span>
              <span className="hidden sm:inline">Crear Comunitat</span>
            </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-roseTheme-dark mb-3">
            👥 Comunitats
          </h1>
          <p className="text-roseTheme-dark/70 text-lg mb-6">
            Explora i uneix-te a les diferents comunitats
          </p>

          {/* Barra de cerca */}
          <div className="relative">
            <input
                type="text"
                placeholder="Cerca comunitats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 pl-12 rounded-xl border-2 border-roseTheme-light focus:border-roseTheme-dark focus:outline-none focus:ring-2 focus:ring-roseTheme-light transition"
            />
            <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roseTheme-dark/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Llista de comunitats */}
        {filteredCommunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-roseTheme-dark/60 text-lg mb-2">
                {searchTerm ? 'No s\'han trobat comunitats amb aquesta cerca' : 'No hi ha comunitats disponibles'}
              </p>
              {user && !searchTerm && (
                  <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition shadow-lg"
                  >
                    ➕ Crear la primera comunitat
                  </button>
              )}
            </div>
        ) : (
            <div className="grid gap-4">
              {filteredCommunities.map(community => (
                  <CommunityCard key={community.id} community={community} />
              ))}
            </div>
        )}

        {/* Modal de crear comunitat */}
        {showCreateModal && user?.apiKey && (
            <CreateCommunityModal
                apiKey={user.apiKey}
                onClose={() => setShowCreateModal(false)}
                onCommunityCreated={handleCommunityCreated}
            />
        )}
      </div>
  );
};

export default ComunitatsPage;