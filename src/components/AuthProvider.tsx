import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';
import type { User } from '../data/users';
import type { UserProfile } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Carregar usuari del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setTimeout(() => {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Carregar el perfil del backend
        fetchUserProfile(parsedUser.apiKey)
          .then(profile => {
            console.log('✅ Backend user info:', profile);
            setUserProfile(profile);
          })
          .catch(err => {
            console.error('⚠️ API key might be invalid:', err);
          });
      }, 0);
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('✅ Login successful:', user.name, 'API Key:', user.apiKey);
    
    // Carregar perfil del backend
    fetchUserProfile(user.apiKey)
      .then(profile => {
        console.log('✅ Backend user info:', profile);
        setUserProfile(profile);
      })
      .catch(err => {
        console.error('❌ Failed to fetch user profile:', err);
      });
  };

  const logout = () => {
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('currentUser');
    console.log('👋 Logout successful');
  };

  const isAuthenticated = !!user;

  // Combinar user local amb userProfile del backend
  const enrichedUser = user ? {
    ...user,
    username: userProfile?.username,
    nombre: userProfile?.nombre,
    bio: userProfile?.bio,
    avatar: userProfile?.avatar,
    banner: userProfile?.banner,
  } : null;

  return (
    <AuthContext.Provider value={{ user: enrichedUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};