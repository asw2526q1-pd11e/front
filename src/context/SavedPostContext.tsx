import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchSavedPosts } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface SavedPostsContextType {
    savedPostIds: Set<number>;
    isPostSaved: (postId: number) => boolean;
    togglePostSaved: (postId: number, saved: boolean) => void;
    refreshSavedPosts: () => Promise<void>;
    isLoading: boolean;
}

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined);

export const SavedPostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [savedPostIds, setSavedPostIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    // Carregar posts guardats del backend
    const refreshSavedPosts = useCallback(async () => {
        if (!user?.apiKey) {
            setSavedPostIds(new Set());
            return;
        }

        setIsLoading(true);
        try {
            const posts = await fetchSavedPosts(user.apiKey);
            const postIds = posts.map(post => post.id);
            setSavedPostIds(new Set(postIds));
            console.log('💾 Posts guardats carregats:', postIds);
        } catch (error) {
            console.error('Error carregant posts guardats:', error);
            setSavedPostIds(new Set());
        } finally {
            setIsLoading(false);
        }
    }, [user?.apiKey]);

    useEffect(() => {
        refreshSavedPosts();
    }, [refreshSavedPosts]);

    const isPostSaved = useCallback((postId: number) => {
        const saved = savedPostIds.has(postId);
        return saved;
    }, [savedPostIds]);

    const togglePostSaved = useCallback((postId: number, saved: boolean) => {
        setSavedPostIds(prev => {
            const newSet = new Set(prev);
            if (saved) {
                newSet.add(postId);
                console.log('➕ Post guardat:', postId);
            } else {
                newSet.delete(postId);
                console.log('➖ Post desguardat:', postId);
            }
            console.log('📊 Total posts guardats:', newSet.size);
            return newSet;
        });
    }, []);

    return (
        <SavedPostsContext.Provider value={{ savedPostIds, isPostSaved, togglePostSaved, refreshSavedPosts, isLoading }}>
            {children}
        </SavedPostsContext.Provider>
    );
};

export const useSavedPosts = () => {
    const context = useContext(SavedPostsContext);
    if (context === undefined) {
        throw new Error('useSavedPosts must be used within a SavedPostsProvider');
    }
    return context;
};