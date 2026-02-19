import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Play, Film, Star, Lock, Loader2, Share2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import LoginModal from "@/components/LoginModal";
import MovieCard from "@/components/MovieCard";
import { useContentById, useContent } from "@/hooks/useContent";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getDriveEmbedUrl } from "@/lib/driveUtils";

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { content, loading } = useContentById(id || "");
  const { user, hasActiveSubscription, hasAgentSubscription, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { content: allContent } = useContent(content?.type);
  const relatedContent = allContent.filter(c => c.id !== id).slice(0, 12);

  const isAgentContent = content?.status === "agent";
  const hasSubscription = isAdmin() || (isAgentContent ? hasAgentSubscription() : hasActiveSubscription());

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Content not found</p>
      </div>
    );
  }

  const handleWatch = () => {
    if (!user) { setLoginOpen(true); return; }
    if (!hasSubscription && !isAdmin()) {
      navigate("/subscription");
      return;
    }
    navigate(`/watch/${content.id}`);
  };

  const trailerUrl = (content as any).trailerUrl;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Hero banner - carousel style */}
      <div className="relative mt-14 w-full h-[280px] sm:h-[340px] md:h-[420px] overflow-hidden">
        {trailerOpen && trailerUrl ? (
          <iframe
            src={getDriveEmbedUrl(trailerUrl)}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        ) : (
          <img
            src={content.poster}
            alt={content.title}
            className="w-full h-full object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors z-10"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {content.isVip && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-badge-vip text-primary-foreground">VIP</span>
            )}
            {content.isNew && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-badge-hot text-primary-foreground">NEW</span>
            )}
            {content.type === "series" && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary text-primary-foreground">
                {content.episodes?.length || 0} Episodes
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-2 leading-tight">{content.title}</h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 flex-wrap">
            <span className="flex items-center gap-1 text-badge-vip font-semibold">
              <Star className="w-4 h-4 fill-current" /> {content.rating}
            </span>
            <span>{content.year}</span>
            <span className="capitalize">{content.type}</span>
            {content.genres.map(g => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-secondary/80 text-[11px] text-muted-foreground">{g}</span>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl line-clamp-2 md:line-clamp-3">{content.description}</p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleWatch}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
            >
              {hasSubscription || isAdmin() ? (
                <><Play className="w-4 h-4 fill-current" /> Watch Now</>
              ) : (
                <><Lock className="w-4 h-4" /> Subscribe to Watch</>
              )}
            </button>

            <button
              onClick={() => {
                if (trailerUrl) {
                  setTrailerOpen(!trailerOpen);
                } else {
                  toast({ title: "No trailer available", description: "Trailer has not been uploaded yet." });
                }
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-colors border border-border/50 ${
                trailerOpen
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/10 backdrop-blur-sm text-foreground hover:bg-white/20"
              }`}
            >
              <Film className="w-4 h-4" /> {trailerOpen ? "Show Poster" : "Play Trailer"}
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast({ title: "Link copied!" });
              }}
              className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-foreground hover:bg-white/20 transition-colors border border-border/50"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      {/* Related */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Related {content.type === 'series' ? 'Series' : 'Movies'}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {relatedContent.map(item => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      </div>

      <MobileBottomNav />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default MovieDetail;
