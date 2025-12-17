import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';
import type { User } from '../data/users';
import type { UserProfile } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setTimeout(() => {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

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

  const enrichedUser = user ? {
    ...user,
    avatar: user.avatar,
    username: userProfile?.username || user.name,
    nombre: userProfile?.nombre || user.name,
    bio: userProfile?.bio || '',
    avatarUrl: userProfile?.avatar, // URL de S3 en un campo separado
    banner: userProfile?.banner,
    user_id: userProfile?.user_id,
  } : null;

  return (
      <AuthContext.Provider value={{ user: enrichedUser, login, logout, isAuthenticated }}>
        {children}
      </AuthContext.Provider>
  );
};