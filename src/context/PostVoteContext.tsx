import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export type VoteType = 'up' | 'down' | null;

interface PostVote {
  postId: number;
  vote: VoteType;
}

interface PostVoteContextType {
  getPostVote: (postId: number) => VoteType;
  setPostVote: (postId: number, vote: VoteType) => void;
  clearAllVotes: () => void;
}

const PostVoteContext = createContext<PostVoteContextType | undefined>(undefined);

interface PostVoteProviderProps {
  children: ReactNode;
}

export const PostVoteProvider: React.FC<PostVoteProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState<PostVote[]>([]);

  // Clave única para cada usuario
  const getStorageKey = () => user?.id ? `postVotes_${user.id}` : null;

  // Cargar votos del localStorage cuando el usuario cambie
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      const savedVotes = localStorage.getItem(storageKey);
      if (savedVotes) {
        try {
          setVotes(JSON.parse(savedVotes));
        } catch (error) {
          console.error('Error cargando votos guardados:', error);
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

  const getPostVote = (postId: number): VoteType => {
    const vote = votes.find(v => v.postId === postId);
    return vote ? vote.vote : null;
  };

  const setPostVote = (postId: number, vote: VoteType) => {
    setVotes(prevVotes => {
      const existingVoteIndex = prevVotes.findIndex(v => v.postId === postId);
      
      if (vote === null) {
        // Eliminar el voto
        if (existingVoteIndex >= 0) {
          return prevVotes.filter(v => v.postId !== postId);
        }
        return prevVotes;
      } else {
        // Agregar o actualizar el voto
        if (existingVoteIndex >= 0) {
          const updatedVotes = [...prevVotes];
          updatedVotes[existingVoteIndex] = { postId, vote };
          return updatedVotes;
        } else {
          return [...prevVotes, { postId, vote }];
        }
      }
    });
  };

  const clearAllVotes = () => {
    setVotes([]);
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  return (
    <PostVoteContext.Provider value={{ getPostVote, setPostVote, clearAllVotes }}>
      {children}
    </PostVoteContext.Provider>
  );
};

export const usePostVotes = (): PostVoteContextType => {
  const context = useContext(PostVoteContext);
  if (!context) {
    throw new Error('usePostVotes must be used within a PostVoteProvider');
  }
  return context;
};
