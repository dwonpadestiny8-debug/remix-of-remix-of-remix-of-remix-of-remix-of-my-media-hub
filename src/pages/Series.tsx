import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

import { useContent } from "@/hooks/useContent";
import { Star } from "lucide-react";

const Series = () => {
  const { content: series, loading } = useContent("series", "published");
  const [search, setSearch] = useState("");

  const filtered = series.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-20 max-w-[1400px] mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Series</h1>
          <input
            type="text"
            placeholder="Search series..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border w-60 placeholder:text-muted-foreground"
          />
        </div>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-secondary animate-pulse h-[180px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {filtered.map(s => (
              <Link key={s.id} to={`/movie/${s.id}`} className="group rounded-lg overflow-hidden hover:scale-105 transition-transform">
                <div className="relative h-[160px] sm:h-[200px]">
                  <img src={s.poster} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary/80 text-primary-foreground capitalize">
                    {s.type}
                  </span>
                  {s.isVip && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-badge-vip text-primary-foreground">VIP</span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary text-primary-foreground">
                    {s.episodes?.length || 0} Eps
                  </span>
                </div>
                <div className="p-1.5">
                  <h3 className="text-xs font-medium text-foreground truncate">{s.title}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Star className="w-2.5 h-2.5 text-badge-vip fill-current" />
                    <span>{s.rating}</span>
                    <span>· {s.year}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && <p className="text-center text-muted-foreground mt-12">No series found.</p>}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default Series;
