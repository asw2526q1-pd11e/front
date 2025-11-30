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
    <div className="min-h-screen bg-gradient-to-br from-roseTheme-soft via-roseTheme-light to-roseTheme-accent flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-roseTheme-light">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-roseTheme-dark to-roseTheme rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">D</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-roseTheme-dark to-roseTheme bg-clip-text text-transparent mb-2">
            Benvingut a DailyDev
          </h1>
          <p className="text-roseTheme-dark/60">Selecciona el teu perfil per continuar</p>
        </div>

        {/* Selecció d'usuari */}
        <div className="space-y-3 mb-6">
          {USERS.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedUserId === user.id
                  ? 'border-roseTheme-dark bg-roseTheme-soft shadow-md scale-[1.02]'
                  : 'border-roseTheme-light hover:border-roseTheme-accent hover:bg-roseTheme-soft/30'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  selectedUserId === user.id
                    ? 'bg-gradient-to-br from-roseTheme-dark to-roseTheme'
                    : 'bg-gradient-to-br from-roseTheme-light to-roseTheme-accent'
                } shadow-md transition-all duration-200`}>
                  {user.avatar || user.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-roseTheme-dark text-lg truncate">
                    {user.name}
                  </h3>
                  <p className="text-sm text-roseTheme-dark/60 truncate">
                    {user.email}
                  </p>
                </div>

                {/* Checkmark */}
                {selectedUserId === user.id && (
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-roseTheme-dark" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* API Key preview (només si està seleccionat) */}
              {selectedUserId === user.id && (
                <div className="mt-3 pt-3 border-t border-roseTheme-light">
                  <p className="text-xs text-roseTheme-dark/50 font-mono">
                    🔑 API Key: {user.apiKey.slice(0, 20)}...
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Botó de login */}
        <button
          onClick={handleLogin}
          disabled={!selectedUserId}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
            selectedUserId
              ? 'bg-gradient-to-r from-roseTheme-dark to-roseTheme text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-roseTheme-light/50 text-roseTheme-dark/30 cursor-not-allowed'
          }`}
        >
          {selectedUserId ? '🚀 Entrar' : '👆 Selecciona un usuari'}
        </button>

        {/* Info adicional */}
        <div className="mt-6 p-4 bg-roseTheme-soft/50 rounded-xl border border-roseTheme-light">
          <p className="text-xs text-roseTheme-dark/60 text-center">
            💡 Les API keys són hardcodejades per a cada usuari
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;