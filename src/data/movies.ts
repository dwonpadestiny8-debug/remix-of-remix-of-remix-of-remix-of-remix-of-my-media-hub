import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";
import poster3 from "@/assets/poster-3.jpg";
import poster4 from "@/assets/poster-4.jpg";
import poster5 from "@/assets/poster-5.jpg";
import poster6 from "@/assets/poster-6.jpg";
import poster7 from "@/assets/poster-7.jpg";
import poster8 from "@/assets/poster-8.jpg";

export interface Movie {
  id: string;
  title: string;
  poster: string;
  episodes?: string;
  rating?: number;
  year?: number;
  genres?: string[];
  description?: string;
  isVip?: boolean;
  isNew?: boolean;
  isComingSoon?: boolean;
  rank?: number;
}

const posters = [poster1, poster2, poster3, poster4, poster5, poster6, poster7, poster8];

const titles = [
  "Eternal Love of the Fox",
  "Fated Hearts",
  "Ultimate Note",
  "The Grand Heiress Romance",
  "Miss in the Rain",
  "First Flight",
  "Destined",
  "Pursuit of Justice",
  "When I Met the Moon",
  "The Legend of Rising Clouds",
  "Fate Chaser You",
  "How Dare You!",
  "Dating with You",
  "The Best Thing",
  "Fire Sparks & Diamonds",
  "Speedy Love",
  "The Undiscovered Road",
  "Peach Lover",
  "In the Shadows",
  "Love in the Mountains",
  "In the Name of the Brother",
  "War of Faith",
  "City of the City",
  "Always on the Full Moon",
  "Imperfect Victim",
  "Detective Unknown",
  "Infinite Cycle of Love",
  "Moonlight Mystery",
  "King of Running Palace",
  "Coroner's Story",
  "My Journey to You",
  "New Life Begins",
  "Sharp Blade in the Snow",
];

function makePoster(index: number) {
  return posters[index % posters.length];
}

function makeMovie(id: number, extra?: Partial<Movie>): Movie {
  return {
    id: `movie-${id}`,
    title: titles[id % titles.length],
    poster: makePoster(id),
    episodes: `${Math.floor(Math.random() * 30 + 10)} Episodes`,
    rating: +(Math.random() * 2 + 7.5).toFixed(1),
    year: 2024 + Math.floor(Math.random() * 3),
    genres: ["Drama", "Romance"].slice(0, Math.floor(Math.random() * 2) + 1),
    description:
      "A captivating story of love, loyalty, and destiny set against a breathtaking backdrop of ancient landscapes and modern intrigue.",
    isVip: Math.random() > 0.5,
    ...extra,
  };
}

export const popularMovies: Movie[] = Array.from({ length: 8 }, (_, i) => makeMovie(i));
export const comingSoonMovies: Movie[] = Array.from({ length: 8 }, (_, i) =>
  makeMovie(i + 8, { isComingSoon: true, episodes: "Coming soon" })
);
export const dramaSelection: Movie[] = Array.from({ length: 8 }, (_, i) =>
  makeMovie(i, { rank: i + 1, isNew: i < 2 })
);
export const highQualityDramas: Movie[] = Array.from({ length: 8 }, (_, i) => makeMovie(i + 16));
export const sweetRomance: Movie[] = Array.from({ length: 8 }, (_, i) => makeMovie(i + 4));
export const ancientCostume: Movie[] = Array.from({ length: 8 }, (_, i) => makeMovie(i + 24));

export const genreTags = [
  "All Video", "Chinese Mainland", "South Korea", "Thailand",
  "Japan", "Malaysia", "Anime", "Lit", "Youth",
  "Mystery", "LGBT", "Reviews", "Best Love", "Marriage",
];

export const allMovies: Movie[] = [
  ...popularMovies,
  ...comingSoonMovies.map((m) => ({ ...m, isComingSoon: false })),
  ...highQualityDramas,
  ...sweetRomance,
  ...ancientCostume,
];

export function getMovieById(id: string): Movie | undefined {
  return allMovies.find((m) => m.id === id) || makeMovie(parseInt(id.replace("movie-", "")) || 0);
}
