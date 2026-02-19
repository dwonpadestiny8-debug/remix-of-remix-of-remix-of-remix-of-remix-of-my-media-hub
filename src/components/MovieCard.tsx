import { Link } from "react-router-dom";
import type { Content } from "@/hooks/useContent";

interface MovieCardProps {
  movie: Content;
  showRank?: boolean;
  size?: "default" | "large";
}

const MovieCard = ({ movie, showRank, size = "default" }: MovieCardProps) => {
  const isLarge = size === "large";

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={`group relative flex-shrink-0 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 ${
        isLarge ? "w-[150px]" : "w-[120px]"
      }`}
    >
      <div className={`relative ${isLarge ? "h-[210px]" : "h-[165px]"}`}>
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {movie.isVip && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-badge-vip text-primary-foreground">
            VIP
          </span>
        )}
        {movie.type === "series" && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary text-primary-foreground">
            {movie.episodes?.length || 0} Eps
          </span>
        )}
        {movie.isNew && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-badge-hot text-primary-foreground">
            New
          </span>
        )}

        {showRank && (movie as any).rank && (
          <div className="absolute bottom-0 left-2">
            <span
              className={`text-4xl font-black italic ${
                (movie as any).rank <= 3 ? "text-gradient-green" : "text-foreground/60"
              }`}
              style={
                (movie as any).rank <= 3
                  ? {
                      background: "linear-gradient(135deg, hsl(145 85% 45%), hsl(145 70% 60%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }
                  : undefined
              }
            >
              TOP {(movie as any).rank}
            </span>
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-xs font-medium text-foreground truncate">{movie.title}</h3>
        <p className="text-[10px] text-muted-foreground truncate">{movie.year} · {movie.genres?.join(", ")}</p>
      </div>
    </Link>
  );
};

export default MovieCard;
