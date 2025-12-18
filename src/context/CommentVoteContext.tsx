import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export type VoteType = 'up' | 'down' | null;

interface CommentVote {
  commentId: number;
  vote: VoteType;
}

interface CommentVoteContextType {
  getCommentVote: (commentId: number) => VoteType;
  setCommentVote: (commentId: number, vote: VoteType) => void;
  clearAllCommentVotes: () => void;
}

const CommentVoteContext = createContext<CommentVoteContextType | undefined>(undefined);

interface CommentVoteProviderProps {
  children: ReactNode;
}

export const CommentVoteProvider: React.FC<CommentVoteProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState<CommentVote[]>([]);

  // Clave única para cada usuario
  const getStorageKey = () => user?.id ? `commentVotes_${user.id}` : null;

  // Cargar votos del localStorage cuando el usuario cambie
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      const savedVotes = localStorage.getItem(storageKey);
      if (savedVotes) {
        try {
          setVotes(JSON.parse(savedVotes));
        } catch (error) {
          console.error('Error cargando votos de comentarios guardados:', error);
          setVotes([]);
        }
      }
    } else {
      // Si no hay usuario, limpiar votos
      setVotes([]);
    }
  }, [user?.id]);

  // Guardar votos en localStorage cuando cambien
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey && votes.length >= 0) {
      localStorage.setItem(storageKey, JSON.stringify(votes));
    }
  }, [votes, user?.id]);

  const getCommentVote = useCallback((commentId: number): VoteType => {
    const vote = votes.find(v => v.commentId === commentId);
    return vote ? vote.vote : null;
  }, [votes]);

  const setCommentVote = useCallback((commentId: number, vote: VoteType) => {
    console.log(`Setting comment vote for comment ${commentId} to:`, vote);
    setVotes(prevVotes => {
      const existingVoteIndex = prevVotes.findIndex(v => v.commentId === commentId);
      
      if (vote === null) {
        // Eliminar el voto
        if (existingVoteIndex >= 0) {
          const newVotes = prevVotes.filter(v => v.commentId !== commentId);
          console.log('Removed vote, new votes:', newVotes);
          return newVotes;
        }
        return prevVotes;
      } else {
        // Agregar o actualizar el voto
        let newVotes;
        if (existingVoteIndex >= 0) {
          newVotes = [...prevVotes];
          newVotes[existingVoteIndex] = { commentId, vote };
        } else {
          newVotes = [...prevVotes, { commentId, vote }];
        }
        console.log('Updated votes:', newVotes);
        return newVotes;
      }
    });
  }, []);

  const clearAllCommentVotes = useCallback(() => {
    setVotes([]);
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [user?.id]);

  const value = {
    getCommentVote,
    setCommentVote,
    clearAllCommentVotes
  };

  return (
    <CommentVoteContext.Provider value={value}>
      {children}
    </CommentVoteContext.Provider>
  );
};

export const useCommentVotes = (): CommentVoteContextType => {
  const context = useContext(CommentVoteContext);
  if (!context) {
    throw new Error('useCommentVotes must be used within a CommentVoteProvider');
  }
  return context;
};
