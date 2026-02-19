import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Plus, Share2, Star, Download, Lock, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getDriveEmbedUrl, getDriveDownloadUrl } from "@/lib/driveUtils";
import MobileBottomNav from "@/components/MobileBottomNav";
import LoginModal from "@/components/LoginModal";
import MovieCard from "@/components/MovieCard";
import { useContentById, useContent } from "@/hooks/useContent";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const { content, loading } = useContentById(id || "");
  const { user, hasActiveSubscription, hasAgentSubscription, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeEp, setActiveEp] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  // Fetch related content (same type)
  const { content: allContent, loading: relatedLoading } = useContent(content?.type);
  const relatedContent = allContent.filter(c => c.id !== id).slice(0, 12);

  const isSeries = content?.type === "series";
  const episodes = content?.episodes || [];
  const isAgentContent = content?.status === "agent";
  const hasSubscription = isAdmin() || (isAgentContent ? hasAgentSubscription() : hasActiveSubscription());
  const isLocked = !authLoading && !hasSubscription;

  const handleLockedAction = () => {
    if (!user) {
      setLoginOpen(true);
    }
  };

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

  const currentVideoUrl = isSeries && episodes[activeEp]
    ? episodes[activeEp].videoUrl
    : content.videoUrl || "";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="mt-14 max-w-[1400px] mx-auto px-4 py-4">
        {/* Player + Episodes Side Panel */}
        <div className={`flex gap-3 ${isSeries ? '' : ''}`}>
          {/* Video Player - smaller */}
          <div className={`${isSeries ? 'flex-1 min-w-0' : 'w-full'}`}>
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden" style={{ maxHeight: '450px' }}>
              {isLocked ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-secondary/20">
                  <Lock className="w-12 h-12 text-badge-vip" />
                  <p className="text-foreground font-bold text-sm">
                    {isAgentContent ? "Agent Subscription Required" : "Subscription Required"}
                  </p>
                  <p className="text-muted-foreground text-xs text-center max-w-xs">
                    {!user ? "Please log in and subscribe to watch." : isAgentContent ? "This is Agent early-access content. Subscribe to the Agent plan to watch." : "Subscribe to watch this content."}
                  </p>
                  {!user ? (
                    <button
                      onClick={() => setLoginOpen(true)}
                      className="px-5 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
                    >
                      Log In
                    </button>
                  ) : (
                    <Link
                      to="/subscription"
                      className="px-5 py-1.5 rounded-full bg-badge-vip text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
                    >
                      Subscribe Now
                    </Link>
                  )}
                </div>
              ) : (
                currentVideoUrl ? (
                  <iframe
                    src={getDriveEmbedUrl(currentVideoUrl)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    key={currentVideoUrl}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">No video available</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Episodes sidebar for series */}
          {isSeries && episodes.length > 0 && (
            <div className="w-[200px] flex-shrink-0">
              <h3 className="text-sm font-bold text-foreground mb-2">Episodes ({episodes.length})</h3>
              <div className="grid grid-cols-4 gap-1.5 max-h-[450px] overflow-y-auto scrollbar-hide">
                {episodes.map((ep, i) => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      if (isLocked) { handleLockedAction(); return; }
                      setActiveEp(i);
                    }}
                    className={`aspect-square rounded flex items-center justify-center text-xs font-bold transition-colors ${
                      i === activeEp
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-card-hover"
                    }`}
                  >
                    {ep.number}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Bar */}
        <div className="py-3 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-foreground mb-1">
                {content.title}
                {isSeries && ` — Ep ${activeEp + 1}`}
              </h1>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {content.isVip && (
                  <span className="px-2 py-0.5 font-bold rounded border border-badge-vip text-badge-vip text-[10px]">VIP</span>
                )}
                <span className="flex items-center gap-1 text-badge-vip">
                  <Star className="w-3 h-3 fill-current" />
                  {content.rating}
                </span>
                <span className="text-muted-foreground">{content.year}</span>
                {content.genres.map(g => (
                  <span key={g} className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">{g}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-2xl">{content.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasSubscription ? (
                currentVideoUrl ? (
                  <a
                    href={getDriveDownloadUrl(currentVideoUrl)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                ) : null
              ) : (
                <Link
                  to="/subscription"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-badge-vip text-primary-foreground text-xs font-medium hover:opacity-90 transition-colors"
                >
                  <Lock className="w-3 h-3" /> Subscribe
                </Link>
              )}
              <button
                className="p-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-card-hover transition-colors"
                onClick={() => { if (!user) { setLoginOpen(true); return; } }}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-card-hover transition-colors"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast({ title: "Link copied!" });
                }}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Related Content Grid */}
        <div className="py-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Related {isSeries ? 'Series' : 'Movies'}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {relatedLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full aspect-[2/3] rounded-lg bg-secondary animate-pulse" />
                ))
              : relatedContent.map(item => (
                  <MovieCard key={item.id} movie={item} />
                ))
            }
          </div>
        </div>
      </div>

      <MobileBottomNav />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default Watch;
