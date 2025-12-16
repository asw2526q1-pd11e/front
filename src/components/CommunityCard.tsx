import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Community {
  id: number;
  name: string;
  avatar: string | null;
  banner: string | null;
  subs_count: number;
  posts_count: number;
  comments_count: number;
}

interface Props {
  community: Community;
}

const CommunityCard: React.FC<Props> = ({ community }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita que el Link es dispari
    e.stopPropagation(); // Evita la propagació de l'event
    setIsSubscribed(!isSubscribed);
    // Aquí pots afegir la lògica per fer la petició al backend
  };

  return (
    <Link 
      to={`/comunitats/${community.id}`}
      className="block bg-white rounded-xl border-2 border-roseTheme-light hover:border-roseTheme hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {/* Banner superior (si existeix) */}
      {community.banner && (
        <div className="h-24 bg-gradient-to-r from-roseTheme-light to-roseTheme-accent overflow-hidden">
          <img 
            src={community.banner} 
            alt={`Banner de ${community.name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Contingut principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              {/* Avatar de la comunitat */}
              <div className="flex-shrink-0">
                {community.avatar ? (
                  <img 
                    src={community.avatar} 
                    alt={`Avatar de ${community.name}`}
                    className="w-16 h-16 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-roseTheme-dark to-roseTheme flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-2xl">
                      {community.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Nom i badge */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-roseTheme-dark group-hover:text-roseTheme transition truncate">
                  {community.name}
                </h3>
                <p className="text-sm text-roseTheme-dark/60">
                  c/{community.name.toLowerCase().replace(/\s+/g, '')}
                </p>
              </div>
            </div>

            {/* Estadístiques */}
            <div className="flex items-center gap-6 text-sm text-roseTheme-dark/70">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-semibold text-roseTheme-dark">{community.subs_count}</span>
                <span>subscriptors</span>
              </div>

              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="font-semibold text-roseTheme-dark">{community.posts_count}</span>
                <span>posts</span>
              </div>

              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-semibold text-roseTheme-dark">{community.comments_count}</span>
                <span>comentaris</span>
              </div>
            </div>
          </div>

          {/* Botó de subscripció */}
          <button
            onClick={handleSubscribe}
            className={`flex-shrink-0 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              isSubscribed
                ? 'bg-roseTheme-light text-roseTheme-dark border-2 border-roseTheme-accent hover:bg-roseTheme-accent'
                : 'bg-gradient-to-r from-roseTheme-dark to-roseTheme text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {isSubscribed ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Subscrit
              </span>
            ) : (
              '+ Unir-se'
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CommunityCard;