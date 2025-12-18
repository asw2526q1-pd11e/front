import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';
import type { User } from '../data/users';
import type { UserProfile } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);

  const loadUserProfile = useCallback(async (apiKey: string) => {
    try {
      const profile = await fetchUserProfile(apiKey);
      setUserProfile(profile);
      setProfileVersion(prev => prev + 1);
      return profile;
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserProfile(parsedUser.apiKey);
    }
  }, [loadUserProfile]);

  const login = useCallback((user: User) => {
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    loadUserProfile(user.apiKey);
  }, [loadUserProfile]);

  const logout = useCallback(() => {
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

  return (
      <AuthContext.Provider value={{ user: enrichedUser, login, logout, isAuthenticated }}>
        {children}
      </AuthContext.Provider>
  );
};