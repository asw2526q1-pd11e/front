import React, { useState } from 'react';

interface Community {
  id: number;
  name: string;
  description: string;
  subscribers?: number;
  created_date?: string;
}

interface Props {
  community: Community;
}

const CommunityCard: React.FC<Props> = ({ community }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    // Aquí pots afegir la lògica per fer la petició al backend
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data desconeguda";
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-roseTheme-light hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Contingut principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar de la comunitat */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-roseTheme-dark to-roseTheme flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">
                  {community.name.charAt(0).toUpperCase()}
                </span>
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

            {/* Descripció */}
            <p className="text-roseTheme-dark/80 mb-4 line-clamp-2 leading-relaxed">
              {community.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-roseTheme-dark/60">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-medium">{community.subscribers || 0}</span>
                <span>subscriptors</span>
              </div>

              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Creada {formatDate(community.created_date)}</span>
              </div>
            </div>
          </div>

          {/* Botó de subscripció */}
          <button
            onClick={handleSubscribe}
            className={`flex-shrink-0 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              isSubscribed
                ? 'bg-roseTheme-light text-roseTheme-dark border-2 border-roseTheme-accent hover:bg-roseTheme-accent'
                : 'bg-roseTheme-dark text-white hover:bg-roseTheme hover:scale-105 shadow-md'
            }`}
          >
            {isSubscribed ? (
              <>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Subscrit
                </span>
              </>
            ) : (
              '+ Unir-se'
            )}
          </button>
        </div>
      </div>

      {/* Barra inferior amb accions */}
      <div className="bg-roseTheme-soft/50 px-6 py-3 border-t border-roseTheme-light">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm text-roseTheme-dark hover:text-roseTheme transition group/btn">
            <svg className="w-5 h-5 group-hover/btn:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Veure posts
          </button>

          <button className="flex items-center gap-2 text-sm text-roseTheme-dark hover:text-roseTheme transition group/btn">
            <svg className="w-5 h-5 group-hover/btn:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sobre la comunitat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;