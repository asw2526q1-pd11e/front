import React from 'react';
import type { Post } from '../services/api';

interface Props {
  post: Post;
}

const PostCard: React.FC<Props> = ({ post }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sense data";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ara mateix";
    if (diffMins < 60) return `Fa ${diffMins}m`;
    if (diffHours < 24) return `Fa ${diffHours}h`;
    if (diffDays < 7) return `Fa ${diffDays}d`;
    
    return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <article className="bg-white hover:bg-roseTheme-soft/30 transition-colors duration-200 cursor-pointer">
      <div className="px-4 py-4">
        {/* Header del post */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-roseTheme-light to-roseTheme-accent flex items-center justify-center text-roseTheme-dark font-bold text-lg">
            {post.author ? post.author[0].toUpperCase() : '?'}
          </div>

          {/* Contingut principal */}
          <div className="flex-1 min-w-0">
            {/* Nom i data */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-bold text-roseTheme-dark hover:underline">
                {post.author || 'Anònim'}
              </span>
              <span className="text-roseTheme-dark/50 text-sm">·</span>
              <span className="text-roseTheme-dark/50 text-sm">
                {formatDate(post.published_date)}
              </span>
            </div>

            {/* Títol */}
            <h2 className="font-bold text-lg text-roseTheme-dark mb-2 leading-tight">
              {post.title}
            </h2>

            {/* Contingut */}
            <p className="text-roseTheme-dark/80 mb-3 whitespace-pre-line leading-relaxed">
              {post.content}
            </p>

            {/* Imatge (si n'hi ha) */}
            {post.image && (
              <div className="rounded-2xl overflow-hidden border border-roseTheme-light mb-3">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full object-cover max-h-96" 
                />
              </div>
            )}

            {/* Comunitats (si n'hi ha) */}
            {post.communities && post.communities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.communities.map(community => (
                  <span 
                    key={community.id}
                    className="text-xs bg-roseTheme-light text-roseTheme-dark px-3 py-1 rounded-full font-medium"
                  >
                    {community.name}
                  </span>
                ))}
              </div>
            )}

            {/* Accions (likes, comentaris, compartir) */}
            <div className="flex items-center gap-6 text-roseTheme-dark/60">
              {/* Likes */}
              <button className="flex items-center gap-2 hover:text-rose-600 transition group">
                <div className="group-hover:bg-rose-100 rounded-full p-2 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{post.votes}</span>
              </button>

              {/* Comentaris */}
              <button className="flex items-center gap-2 hover:text-blue-600 transition group">
                <div className="group-hover:bg-blue-100 rounded-full p-2 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </button>

              {/* Compartir */}
              <button className="flex items-center gap-2 hover:text-green-600 transition group">
                <div className="group-hover:bg-green-100 rounded-full p-2 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
              </button>

              {/* Enllaç extern */}
              {post.url && (
                <a 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-2 hover:text-roseTheme-dark transition group"
                >
                  <div className="group-hover:bg-roseTheme-light rounded-full p-2 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;