import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchSavedComments } from '../services/api';

interface SavedCommentContextType {
    savedCommentIds: Set<number>;
    isCommentSaved: (commentId: number) => boolean;
    toggleCommentSaved: (commentId: number, saved: boolean) => void;
    refreshSavedComments: () => Promise<void>;
}

const SavedCommentContext = createContext<SavedCommentContextType | undefined>(undefined);

export const SavedCommentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [savedCommentIds, setSavedCommentIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (user?.apiKey) {
            refreshSavedComments();
        } else {
            setSavedCommentIds(new Set());
        }
    }, [user?.apiKey]);

    const refreshSavedComments = async () => {
        if (!user?.apiKey) return;

        try {
            const comments = await fetchSavedComments(user.apiKey);
            const savedIds = new Set(
                comments.map(comment => comment.id)
            );
            setSavedCommentIds(savedIds);
            console.log('💾 Comentaris guardats carregats:', savedIds);
        } catch (error) {
            console.error('Error carregant comentaris guardats:', error);
            setSavedCommentIds(new Set());
        }
    };

    const isCommentSaved = (commentId: number): boolean => {
        return savedCommentIds.has(commentId);
    };

    const toggleCommentSaved = (commentId: number, saved: boolean) => {
        setSavedCommentIds(prev => {
            const newSet = new Set(prev);
            if (saved) {
                newSet.add(commentId);
                console.log('➕ Comentari guardat:', commentId);
            } else {
                newSet.delete(commentId);
                console.log('➖ Comentari desguardat:', commentId);
            }
            console.log('📊 Total comentaris guardats:', newSet.size);
            return newSet;
        });
    };

    return (
        <SavedCommentContext.Provider
            value={{
                savedCommentIds,
                isCommentSaved,
                toggleCommentSaved,
                refreshSavedComments
            }}
        >
            {children}
        </SavedCommentContext.Provider>
    );
};

export const useSavedComments = () => {
    const context = useContext(SavedCommentContext);
    if (context === undefined) {
        throw new Error('useSavedComments must be used within a SavedCommentProvider');
    }
    return context;
};