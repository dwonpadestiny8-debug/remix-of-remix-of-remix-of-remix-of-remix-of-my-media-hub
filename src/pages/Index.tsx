import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import HeroBanner from "@/components/HeroBanner";

import { useAllContent } from "@/hooks/useContent";
import { Star } from "lucide-react";

const genreTags = [
  "All", "Drama", "Romance", "Action", "Mystery", "Anime", "Comedy", "Thriller",
  "Historical", "Fantasy", "Sci-Fi", "Youth", "LGBT",
];

const Index = () => {
  const { content: allContent, loading } = useAllContent();
  const [activeGenre, setActiveGenre] = useState("All");

  const published = allContent.filter((c) => c.status === "published");
  const filtered = published.filter((c) => {
    if (activeGenre === "All") return true;
    return c.genres?.includes(activeGenre);
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main>
        <HeroBanner />
        <div className="py-4">
          {/* Genre Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 max-w-[1400px] mx-auto mb-6">
            {genreTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveGenre(tag)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeGenre === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-card-hover"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="px-4 max-w-[1400px] mx-auto">
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-secondary animate-pulse h-[180px]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground mt-12">No content found.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {filtered.map((c) => (
                  <Link
                    key={c.id}
                    to={`/movie/${c.id}`}
                    className="group rounded-lg overflow-hidden hover:scale-105 transition-transform"
                  >
                    <div className="relative h-[160px] sm:h-[200px]">
                      <img
                        src={c.poster}
                        alt={c.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary/80 text-primary-foreground capitalize">
                        {c.type}
                      </span>
                      {c.isVip && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-badge-vip text-primary-foreground">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="p-1.5">
                      <h3 className="text-xs font-medium text-foreground truncate">{c.title}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Star className="w-2.5 h-2.5 text-badge-vip fill-current" />
                        <span>{c.rating}</span>
                        <span>· {c.year}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default Index;
