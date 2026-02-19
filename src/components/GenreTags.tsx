import { genreTags } from "@/data/movies";
import { Link } from "react-router-dom";

const GenreTags = () => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 max-w-[1400px] mx-auto mb-8">
      {genreTags.map((tag) => (
        <Link
          key={tag}
          to={`/browse?genre=${tag.toLowerCase().replace(/\s+/g, "-")}`}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-card-hover transition-colors"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
};

export default GenreTags;
