import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';
import type { User } from '../data/users';
import type { UserProfile } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Función para cargar el perfil del backend
  const loadUserProfile = async (apiKey: string) => {
    try {
      const profile = await fetchUserProfile(apiKey);
      console.log('✅ Backend user info:', profile);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.error('⚠️ Error loading profile:', err);
      return null;
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setTimeout(() => {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Cargar el perfil del backend
        loadUserProfile(parsedUser.apiKey);
      }, 0);
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('✅ Login successful:', user.name, 'API Key:', user.apiKey);

    // Cargar perfil del backend
    loadUserProfile(user.apiKey);
  };

  const logout = () => {
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('currentUser');
    console.log('👋 Logout successful');
  };

  // Función pública para refrescar el perfil
  const refreshProfile = async () => {
    if (user?.apiKey) {
      const profile = await loadUserProfile(user.apiKey);
      return profile;
    }
    return null;
  };

  const isAuthenticated = !!user;

  // Combinar user local con userProfile del backend
  const enrichedUser = user ? {
    ...user,
    // Mantener el avatar original (emoji)
    avatar: user.avatar,
    // Agregar nuevos campos del backend
    username: userProfile?.username || user.name,
    nombre: userProfile?.nombre || user.name,
    bio: userProfile?.bio || '',
    avatarUrl: userProfile?.avatar, // URL de S3 en un campo separado
    banner: userProfile?.banner,
    user_id: userProfile?.user_id,
    // Agregar la función de refresh al objeto user
    refreshProfile,
  } : null;

  return (
      <AuthContext.Provider value={{ user: enrichedUser, login, logout, isAuthenticated }}>
        {children}
      </AuthContext.Provider>
  );
};