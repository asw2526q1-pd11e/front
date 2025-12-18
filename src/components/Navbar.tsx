import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchUserProfile, type UserProfile } from '../services/api';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Cargar perfil cuando cambia el usuario
  useEffect(() => {
    if (user?.apiKey) {
      fetchUserProfile(user.apiKey)
          .then(setProfile)
          .catch(() => setProfile(null));
    } else {
      setProfile(null);
    }
  }, [user?.apiKey]);

  // Escuchar evento personalizado para actualizar el perfil
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user?.apiKey) {
        fetchUserProfile(user.apiKey)
            .then(setProfile)
            .catch(() => setProfile(null));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user?.apiKey]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = profile?.username || profile?.nombre || user?.name || 'Usuario';
  const displayAvatar = user?.avatar || displayName.charAt(0);

  return (
      <nav className="sticky top-0 z-50 bg-white border-b border-roseTheme-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand - Esquerra */}
            <Link
                to="/"
                className="flex items-center gap-2 no-underline group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-roseTheme-dark to-roseTheme rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-md">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-roseTheme-dark to-roseTheme bg-clip-text text-transparent">
              DailyDev
            </span>
            </Link>

            {/* Navigation Links - Centre */}
            <div className="flex items-center gap-1">
              <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 no-underline ${
                      isActive('/')
                          ? 'bg-roseTheme-dark text-white shadow-md'
                          : 'text-roseTheme-dark hover:bg-roseTheme-light'
                  }`}
              >
                📝 Posts
              </Link>

              <Link
                  to="/comunitats"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 no-underline ${
                      isActive('/comunitats')
                          ? 'bg-roseTheme-dark text-white shadow-md'
                          : 'text-roseTheme-dark hover:bg-roseTheme-light'
                  }`}
              >
                👥 Comunitats
              </Link>

              <Link
                  to="/perfil"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 no-underline ${
                      isActive('/perfil')
                          ? 'bg-roseTheme-dark text-white shadow-md'
                          : 'text-roseTheme-dark hover:bg-roseTheme-light'
                  }`}
              >
                👤 Perfil
              </Link>
            </div>

            {/* Search Button */}
            <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg hover:bg-roseTheme-light transition"
                title="Buscar"
            >
              🔍
            </button>

            {/* User Menu - Dreta */}
            {user && (
                <div className="relative">
                  <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-roseTheme-light transition no-underline"
                  >
                    {profile?.avatar ? (
                        <img
                            src={profile.avatar}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-2xl">{displayAvatar}</span>
                    )}
                    <span className="font-semibold text-roseTheme-dark hidden sm:block">
                  {displayName.split(' ')[0]}
                </span>
                    <svg className="w-4 h-4 text-roseTheme-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                      <>
                        {/* Overlay per tancar el menu */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowUserMenu(false)}
                        />

                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-roseTheme-light z-20 overflow-hidden">
                          {/* User Info */}
                          <div className="p-4 bg-gradient-to-r from-roseTheme-light to-roseTheme-accent border-b border-roseTheme-light">
                            <div className="flex items-center gap-3 mb-2">
                              {profile?.avatar ? (
                                  <img
                                      src={profile.avatar}
                                      alt={displayName}
                                      className="w-12 h-12 rounded-full object-cover"
                                  />
                              ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-roseTheme-dark to-roseTheme flex items-center justify-center text-2xl">
                                    {displayAvatar}
                                  </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-roseTheme-dark truncate">{displayName}</p>
                                <p className="text-sm text-roseTheme-dark/60 truncate">{user.email}</p>
                              </div>
                            </div>
                            <p className="text-xs text-roseTheme-dark/50 font-mono mt-2">
                              🔑 {user.apiKey.slice(0, 20)}...
                            </p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                                to="/perfil"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-roseTheme-soft transition no-underline text-roseTheme-dark"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              El meu perfil
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600 font-semibold"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Tancar sessió
                            </button>
                          </div>
                        </div>
                      </>
                  )}
                </div>
            )}
          </div>
        </div>
      </nav>
  );
};

export default Navbar;