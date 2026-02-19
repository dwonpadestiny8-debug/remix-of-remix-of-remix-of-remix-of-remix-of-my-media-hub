import { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import AgentSubscriptionModal from "@/components/AgentSubscriptionModal";
import LoginModal from "@/components/LoginModal";
import { useContent, type Content } from "@/hooks/useContent";
import { Download, Lock, Loader2, Play, Star, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDriveEmbedUrl, getDriveDownloadUrl } from "@/lib/driveUtils";

const Agent = () => {
  const { user, hasAgentSubscription } = useAuth();
  const { content, loading } = useContent(undefined, "agent");
  const [selected, setSelected] = useState<Content | null>(null);
  const [activeEp, setActiveEp] = useState(0);
  const [subOpen, setSubOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const hasAccess = hasAgentSubscription();
  const isSeries = selected?.type === "series";
  const episodes = selected?.episodes || [];
  const currentVideoUrl = isSeries && episodes[activeEp]
    ? episodes[activeEp].videoUrl
    : selected?.videoUrl || "";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-16 max-w-[1400px] mx-auto px-4 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Agent</h1>
            <span className="text-xs text-muted-foreground">Early access content</span>
          </div>
          {!hasAccess && (
            <button
              onClick={() => user ? setSubOpen(true) : setLoginOpen(true)}
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              Subscribe to Agent
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center mt-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !hasAccess ? (
          /* Locked state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Lock className="w-16 h-16 text-primary/40 mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Agent Access Required</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Subscribe to Agent to watch and download new content 3 days before it's released to everyone.
            </p>
            <button
              onClick={() => user ? setSubOpen(true) : setLoginOpen(true)}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              {user ? "Get Agent Access" : "Login & Subscribe"}
            </button>
          </div>
        ) : (
          <>
            {/* Player section */}
            {selected && (
              <div className="mb-6">
                <div className="flex gap-3">
                  {/* Video Player */}
                  <div className={`${isSeries ? 'flex-1 min-w-0' : 'w-full'}`}>
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden" style={{ maxHeight: '400px' }}>
                      {currentVideoUrl ? (
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
                      )}
                    </div>
                  </div>

                  {/* Episode sidebar for series */}
                  {isSeries && episodes.length > 0 && (
                    <div className="w-[180px] flex-shrink-0">
                      <h3 className="text-xs font-bold text-foreground mb-2">Episodes ({episodes.length})</h3>
                      <div className="grid grid-cols-4 gap-1.5 max-h-[400px] overflow-y-auto scrollbar-hide">
                        {episodes.map((ep, i) => (
                          <button
                            key={ep.id}
                            onClick={() => setActiveEp(i)}
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

                {/* Info + download */}
                <div className="flex items-start justify-between gap-4 py-3 border-b border-border">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {selected.title}
                      {isSeries && ` — Ep ${activeEp + 1}`}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
                      <span className="flex items-center gap-1 text-accent">
                        <Star className="w-3 h-3 fill-current" /> {selected.rating}
                      </span>
                      <span className="text-muted-foreground">{selected.year}</span>
                      {selected.genres.map(g => (
                        <span key={g} className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">{g}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{selected.description}</p>
                  </div>
                  {currentVideoUrl && (
                    <a
                      href={getDriveDownloadUrl(currentVideoUrl)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex-shrink-0"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Content grid */}
            {content.length === 0 ? (
              <p className="text-muted-foreground text-center mt-12">No new content in Agent right now.</p>
            ) : (
              <div>
                <h2 className="text-sm font-bold text-foreground mb-3">
                  {selected ? "More in Agent" : "Available Now"}
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {content.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setSelected(item); setActiveEp(0); }}
                      className={`group relative rounded-lg overflow-hidden transition-transform hover:scale-105 text-left ${
                        selected?.id === item.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="relative aspect-[2/3]">
                        <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-primary-foreground drop-shadow-lg" />
                        </div>
                        {item.type === "series" && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary text-primary-foreground">
                            {item.episodes?.length || 0} Eps
                          </span>
                        )}
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-accent text-accent-foreground">
                          Agent
                        </span>
                      </div>
                      <div className="p-1.5">
                        <h3 className="text-[11px] font-medium text-foreground truncate">{item.title}</h3>
                        <p className="text-[10px] text-muted-foreground">{item.year}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <MobileBottomNav />
      <AgentSubscriptionModal open={subOpen} onClose={() => setSubOpen(false)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default Agent;
