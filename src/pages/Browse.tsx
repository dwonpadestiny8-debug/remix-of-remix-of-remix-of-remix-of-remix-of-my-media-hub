import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

import { useAllContent } from "@/hooks/useContent";
import { Star, Search } from "lucide-react";

const genreTags = [
  "All", "Drama", "Romance", "Action", "Mystery", "Anime", "Comedy", "Thriller",
];

const Browse = () => {
  const { content: allContent, loading } = useAllContent();
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");

  const published = allContent.filter(c => c.status === "published");
  const filtered = published.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = activeGenre === "All" || c.genres.includes(activeGenre);
    return matchSearch && matchGenre;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-20 max-w-[1400px] mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search all content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {genreTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveGenre(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeGenre === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-card-hover"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-secondary animate-pulse h-[290px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(c => (
              <Link key={c.id} to={`/movie/${c.id}`} className="group rounded-lg overflow-hidden hover:scale-105 transition-transform">
                <div className="relative h-[240px]">
                  <img src={c.poster} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary/80 text-primary-foreground capitalize">{c.type}</span>
                  {c.isVip && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-badge-vip text-primary-foreground">VIP</span>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium text-foreground truncate">{c.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-badge-vip fill-current" />
                    <span>{c.rating}</span>
                    <span>· {c.year}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && <p className="text-center text-muted-foreground mt-12">No results found.</p>}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default Browse;
