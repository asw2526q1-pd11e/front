import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { USERS } from '../data/users';

const LoginPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = USERS.find(u => u.id === selectedUserId);
    if (user) {
      login(user);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100 flex items-center justify-center p-4 relative">
      {/* Patrón de fondo animado */}
      <div className="absolute inset-0 opacity-30 animate-float">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-rose"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-rose" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-rose" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-rose-300/30 p-8 max-w-md w-full border-2 border-rose-200 relative z-10 animate-fade-in">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl mb-4 shadow-xl shadow-rose-400/50 animate-bounce-soft">
            <span className="text-white font-bold text-3xl drop-shadow-lg">D</span>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 mb-2 drop-shadow-sm">
            Benvingut a DailyDev
          </h1>
          <p className="text-gray-700 font-medium">Selecciona el teu perfil per continuar ✨</p>
        </div>

        {/* Selecció d'usuari */}
        <div className="space-y-3 mb-6">
          {USERS.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left hover-lift ${
                selectedUserId === user.id
                  ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 shadow-xl shadow-rose-300/40 scale-[1.02]'
                  : 'border-rose-300 bg-white hover:border-rose-400 hover:bg-rose-50/50 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-300 ${
                  selectedUserId === user.id
                    ? 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white scale-110 animate-glow'
                    : 'bg-gradient-to-br from-rose-300 to-pink-300 text-rose-900'
                }`}>
                  {user.avatar || user.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg truncate transition-colors duration-200 ${
                    selectedUserId === user.id
                      ? 'text-rose-800'
                      : 'text-gray-900'
                  }`}>
                    {user.name}
                  </h3>
                  <p className={`text-sm truncate transition-colors duration-200 ${
                    selectedUserId === user.id
                      ? 'text-rose-700'
                      : 'text-gray-700'
                  }`}>
                    {user.email}
                  </p>
                </div>

                {/* Checkmark */}
                {selectedUserId === user.id && (
                  <div className="flex-shrink-0 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* API Key preview (només si està seleccionat) */}
              {selectedUserId === user.id && (
                <div className="mt-3 pt-3 border-t border-rose-200 animate-slide-in">
                  <div className="flex items-center gap-2 bg-rose-100/60 rounded-lg px-3 py-2">
                    <span className="text-lg">🔑</span>
                    <p className="text-xs text-gray-800 font-mono font-semibold">
                      API Key: {user.apiKey.slice(0, 20)}...
                    </p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Botó de login */}
        <button
          onClick={handleLogin}
          disabled={!selectedUserId}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl relative overflow-hidden ${
            selectedUserId
              ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white hover:shadow-2xl hover:shadow-rose-400/50 hover:scale-[1.03] active:scale-[0.97] animate-pulse-rose'
              : 'bg-rose-200 text-rose-400 cursor-not-allowed'
          }`}
        >
          <span className="relative z-10">
            {selectedUserId ? '🚀 Entrar a DailyDev' : '👆 Selecciona un usuari primer'}
          </span>
          {selectedUserId && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>
          )}
        </button>

        {/* Info adicional */}
        <div className="mt-6 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200 shadow-md animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-xs text-gray-800 font-medium leading-relaxed">
              Les API keys són hardcodejades per a cada usuari. Selecciona el perfil amb el que vols treballar!
            </p>
          </div>
        </div>

        {/* Decoración adicional */}
        <div className="mt-4 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;