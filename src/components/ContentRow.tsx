import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import type { Content } from "@/hooks/useContent";

interface ContentRowProps {
  title: string;
  movies: Content[];
  showRank?: boolean;
  categoryLink?: string;
  loading?: boolean;
}

const ContentRow = ({ title, movies, showRank, categoryLink, loading }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -400 : 400;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 px-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-primary">{title}</h2>
          {categoryLink && (
            <Link to={categoryLink} className="text-xs text-muted-foreground hover:text-foreground">
              ›
            </Link>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 max-w-[1400px] mx-auto"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[120px] h-[185px] rounded-lg bg-secondary animate-pulse" />
            ))
          : movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} showRank={showRank} />
            ))}
      </div>
    </section>
  );
};

export default ContentRow;
