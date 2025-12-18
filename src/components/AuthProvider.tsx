import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';
import type { User } from '../data/users';
import type { UserProfile } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Afegit per gestionar la càrrega inicial

  const loadUserProfile = useCallback(async (apiKey: string) => {
    try {
      console.log('Carregant perfil amb API Key:', apiKey.slice(0, 10) + '...');
      const profile = await fetchUserProfile(apiKey);
      console.log('Perfil carregat correctament:', profile);
      setUserProfile(profile);
      setProfileVersion(prev => prev + 1);
      return profile;
    } catch (err) {
      console.error('Error carregant perfil:', err);
      return null;
    }
  }, []);

  // Carregar usuari del localStorage a l'inici
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        console.log('Comprovant localStorage...', savedUser ? 'Usuari trobat' : 'Cap usuari');
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log('Usuari recuperat del localStorage:', parsedUser.name);
          setUser(parsedUser);
          await loadUserProfile(parsedUser.apiKey);
        }
      } catch (err) {
        console.error('Error inicialitzant auth:', err);
        // Si hi ha error, netejar localStorage
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [loadUserProfile]);

  const login = useCallback((user: User) => {
    console.log('Login:', user.name);
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    loadUserProfile(user.apiKey);
  }, [loadUserProfile]);

  const logout = useCallback(() => {
    console.log('Logout');
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('currentUser');
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.apiKey) {
      return await loadUserProfile(user.apiKey);
    }
    return null;
  }, [user?.apiKey, loadUserProfile]);

  const isAuthenticated = !!user;

  const enrichedUser = useMemo(() => {
    if (!user) return null;

    return {
      ...user,
      avatar: user.avatar,
      username: userProfile?.username || user.name,
      nombre: userProfile?.nombre || user.name,
      bio: userProfile?.bio || '',
      avatarUrl: userProfile?.avatar,
      banner: userProfile?.banner,
      user_id: userProfile?.user_id,
      refreshProfile,
    };
  }, [user, userProfile, refreshProfile, profileVersion]);

  // Mostrar un loading mentre es carrega l'estat inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin"></div>
          <p className="text-rose-600 font-semibold text-lg">Carregant...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: enrichedUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};