import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';
import type { User } from '../data/users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Carregar usuari del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      // Utilitzem setTimeout per evitar warnings de cascada d'actualitzacions
      setTimeout(() => {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Opcional: Verificar que l'API key encara és vàlida
        fetchUserProfile(parsedUser.apiKey)
          .then(profile => {
            console.log('✅ User profile verified:', profile);
          })
          .catch(err => {
            console.error('⚠️ API key might be invalid:', err);
            // Opcional: fer logout si l'API key no és vàlida
            // logout();
          });
      }, 0);
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('✅ Login successful:', user.name, 'API Key:', user.apiKey);
    
    // Verificar que l'API key funciona
    fetchUserProfile(user.apiKey)
      .then(profile => {
        console.log('✅ Backend user info:', profile);
      })
      .catch(err => {
        console.error('❌ Failed to fetch user profile:', err);
      });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    console.log('👋 Logout successful');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};