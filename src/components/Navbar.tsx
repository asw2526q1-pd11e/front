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
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-rose-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand - Esquerra */}
            <Link
                to="/"
                className="flex items-center gap-3 no-underline group"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-rose-500/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                DailyDev
              </span>
            </Link>

            {/* Navigation Links - Centre */}
            <div className="flex items-center gap-2">
              <Link
                  to="/"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 no-underline ${
                      isActive('/')
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/50 scale-105'
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:scale-105'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Posts</span>
              </Link>

              <Link
                  to="/comunitats"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 no-underline ${
                      isActive('/comunitats')
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/50 scale-105'
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:scale-105'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">Comunitats</span>
              </Link>

              <Link
                  to="/perfil"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 no-underline ${
                      isActive('/perfil')
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/50 scale-105'
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:scale-105'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Perfil</span>
              </Link>

              {/* Search Button */}
              <button
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-rose-50 text-gray-700 hover:text-rose-600 transition-all duration-300 hover:scale-110"
                  title="Buscar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* User Menu - Dreta */}
            {user && (
                <div className="relative">
                  <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 transition-all duration-300 no-underline group"
                  >
                    {profile?.avatar ? (
                        <img
                            src={profile.avatar}
                            alt={displayName}
                            className="w-9 h-9 rounded-full object-cover border-2 border-rose-200 group-hover:border-rose-400 transition-all"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm border-2 border-rose-200 group-hover:border-rose-400 transition-all">
                          {displayAvatar}
                        </div>
                    )}
                    <span className="font-semibold text-gray-700 hidden md:block group-hover:text-rose-600 transition-colors">
                      {displayName.split(' ')[0]}
                    </span>
                    <svg className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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

                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border-2 border-rose-100 z-20 overflow-hidden animate-fade-in">
                          {/* User Info */}
                          <div className="p-5 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 border-b-2 border-rose-100">
                            <div className="flex items-center gap-3 mb-3">
                              {profile?.avatar ? (
                                  <img
                                      src={profile.avatar}
                                      alt={displayName}
                                      className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                                  />
                              ) : (
                                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl border-3 border-white shadow-lg">
                                    {displayAvatar}
                                  </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate text-lg">{displayName}</p>
                                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                              </div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-rose-200">
                              <p className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                                </svg>
                                API Key
                              </p>
                              <p className="text-xs text-gray-700 font-mono truncate">
                                {user.apiKey.slice(0, 24)}...
                              </p>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                                to="/perfil"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-all duration-200 no-underline text-gray-700 hover:text-rose-600 group"
                            >
                              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-rose-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="font-semibold">El meu perfil</span>
                            </Link>

                            <div className="mx-2 my-2 border-t border-gray-200"></div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all duration-200 text-red-600 font-semibold group"
                            >
                              <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                              </div>
                              <span>Tancar sessió</span>
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