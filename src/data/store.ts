import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";
import poster3 from "@/assets/poster-3.jpg";
import poster4 from "@/assets/poster-4.jpg";
import poster5 from "@/assets/poster-5.jpg";
import poster6 from "@/assets/poster-6.jpg";
import poster7 from "@/assets/poster-7.jpg";
import poster8 from "@/assets/poster-8.jpg";

const posters = [poster1, poster2, poster3, poster4, poster5, poster6, poster7, poster8];

// ─── Types ───
export type ContentType = "movie" | "series";
export type ContentStatus = "published" | "agent" | "draft";

export interface Episode {
  id: string;
  seriesId: string;
  season: number;
  number: number;
  title: string;
  videoUrl: string;
  duration: string;
}

export interface Content {
  id: string;
  title: string;
  poster: string;
  videoUrl?: string;
  type: ContentType;
  status: ContentStatus;
  rating: number;
  year: number;
  genres: string[];
  description: string;
  isVip: boolean;
  isNew: boolean;
  episodes?: Episode[];
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  subscriptionPlan: string | null;
  subscriptionExpiry: string | null;
  walletBalance: number;
  joinedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "subscription" | "wallet_topup" | "wallet_withdraw";
  amount: number;
  plan?: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  durationDays: number;
}

// ─── Subscription Plans ───
export const subscriptionPlans: SubscriptionPlan[] = [
  { id: "plan-1day", name: "1 Day Pass", duration: "1 Day", price: 5000, durationDays: 1 },
  { id: "plan-1week", name: "1 Week Pass", duration: "1 Week", price: 10000, durationDays: 7 },
  { id: "plan-1month", name: "1 Month Pass", duration: "1 Month", price: 15000, durationDays: 30 },
];

// ─── Sample Video URL ───
const sampleVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// ─── Mock Data Generation ───
const movieTitles = [
  "Eternal Love of the Fox", "Fated Hearts", "Ultimate Note", "The Grand Heiress Romance",
  "Miss in the Rain", "First Flight", "Destined", "Pursuit of Justice",
  "When I Met the Moon", "The Legend of Rising Clouds", "Fate Chaser You", "How Dare You!",
];

const seriesTitles = [
  "Dating with You", "The Best Thing", "Fire Sparks & Diamonds", "Speedy Love",
  "The Undiscovered Road", "Peach Lover", "In the Shadows", "Love in the Mountains",
  "In the Name of the Brother", "War of Faith", "City of the City", "Always on the Full Moon",
];

function makeEpisodes(seriesId: string, count: number): Episode[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${seriesId}-ep-${i + 1}`,
    seriesId,
    season: Math.ceil((i + 1) / 10),
    number: i + 1,
    title: `Episode ${i + 1}`,
    videoUrl: sampleVideo,
    duration: `${Math.floor(Math.random() * 20 + 30)}min`,
  }));
}

function makeContent(id: number, type: ContentType, status: ContentStatus = "published"): Content {
  const titles = type === "movie" ? movieTitles : seriesTitles;
  const contentId = `${type}-${id}`;
  const epCount = type === "series" ? Math.floor(Math.random() * 20 + 8) : 0;
  return {
    id: contentId,
    title: titles[id % titles.length],
    poster: posters[id % posters.length],
    type,
    status,
    rating: +(Math.random() * 2 + 7.5).toFixed(1),
    year: 2024 + Math.floor(Math.random() * 3),
    genres: ["Drama", "Romance", "Action", "Mystery"].slice(0, Math.floor(Math.random() * 2) + 1),
    description: "A captivating story of love, loyalty, and destiny set against a breathtaking backdrop.",
    isVip: Math.random() > 0.5,
    isNew: Math.random() > 0.7,
    episodes: type === "series" ? makeEpisodes(contentId, epCount) : undefined,
    createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
  };
}

// ─── Mock Store (mutable, simulates DB) ───
let _movies: Content[] = Array.from({ length: 10 }, (_, i) => makeContent(i, "movie"));
let _series: Content[] = Array.from({ length: 10 }, (_, i) => makeContent(i, "series"));
// 2 agent items
_movies.push(makeContent(20, "movie", "agent"));
_series.push(makeContent(20, "series", "agent"));

let _users: AppUser[] = [
  { id: "user-1", name: "John Mukasa", email: "john@example.com", subscriptionPlan: "1 Month Pass", subscriptionExpiry: new Date(Date.now() + 20 * 86400000).toISOString(), walletBalance: 25000, joinedAt: "2025-11-01T00:00:00Z" },
  { id: "user-2", name: "Sarah Nambi", email: "sarah@example.com", subscriptionPlan: null, subscriptionExpiry: null, walletBalance: 5000, joinedAt: "2025-12-15T00:00:00Z" },
  { id: "user-3", name: "Peter Ochen", email: "peter@example.com", subscriptionPlan: "1 Week Pass", subscriptionExpiry: new Date(Date.now() + 3 * 86400000).toISOString(), walletBalance: 12000, joinedAt: "2026-01-05T00:00:00Z" },
  { id: "user-4", name: "Grace Akello", email: "grace@example.com", subscriptionPlan: "1 Day Pass", subscriptionExpiry: new Date(Date.now() - 1 * 86400000).toISOString(), walletBalance: 0, joinedAt: "2026-02-01T00:00:00Z" },
];

let _transactions: Transaction[] = [
  { id: "tx-1", userId: "user-1", userName: "John Mukasa", type: "subscription", amount: 15000, plan: "1 Month Pass", date: "2026-02-01T10:00:00Z", status: "completed" },
  { id: "tx-2", userId: "user-2", userName: "Sarah Nambi", type: "wallet_topup", amount: 5000, date: "2026-02-05T14:00:00Z", status: "completed" },
  { id: "tx-3", userId: "user-3", userName: "Peter Ochen", type: "subscription", amount: 10000, plan: "1 Week Pass", date: "2026-02-10T09:00:00Z", status: "completed" },
  { id: "tx-4", userId: "user-1", userName: "John Mukasa", type: "wallet_topup", amount: 30000, date: "2026-01-28T16:00:00Z", status: "completed" },
  { id: "tx-5", userId: "user-4", userName: "Grace Akello", type: "subscription", amount: 5000, plan: "1 Day Pass", date: "2026-02-15T08:00:00Z", status: "completed" },
];

// ─── Current user (mock auth) ───
let _currentUser: AppUser = _users[0];

// ─── API-like functions ───
export const store = {
  // Content
  getMovies: (status: ContentStatus = "published") => _movies.filter(m => m.status === status),
  getSeries: (status: ContentStatus = "published") => _series.filter(s => s.status === status),
  getAllContent: () => [..._movies, ..._series],
  getContentById: (id: string) => [..._movies, ..._series].find(c => c.id === id),
  addContent: (content: Content) => {
    if (content.type === "movie") _movies.push(content);
    else _series.push(content);
  },
  updateContentStatus: (id: string, status: ContentStatus) => {
    const item = [..._movies, ..._series].find(c => c.id === id);
    if (item) item.status = status;
  },
  deleteContent: (id: string) => {
    _movies = _movies.filter(m => m.id !== id);
    _series = _series.filter(s => s.id !== id);
  },
  addEpisode: (seriesId: string, episode: Episode) => {
    const series = _series.find(s => s.id === seriesId);
    if (series) {
      if (!series.episodes) series.episodes = [];
      series.episodes.push(episode);
    }
  },

  // Users
  getUsers: () => _users,
  getUserById: (id: string) => _users.find(u => u.id === id),
  getCurrentUser: () => _currentUser,
  hasActiveSubscription: () => {
    if (!_currentUser.subscriptionExpiry) return false;
    return new Date(_currentUser.subscriptionExpiry) > new Date();
  },
  subscribe: (planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return false;
    if (_currentUser.walletBalance < plan.price) return false;
    _currentUser.walletBalance -= plan.price;
    _currentUser.subscriptionPlan = plan.name;
    _currentUser.subscriptionExpiry = new Date(Date.now() + plan.durationDays * 86400000).toISOString();
    _transactions.push({
      id: `tx-${Date.now()}`,
      userId: _currentUser.id,
      userName: _currentUser.name,
      type: "subscription",
      amount: plan.price,
      plan: plan.name,
      date: new Date().toISOString(),
      status: "completed",
    });
    return true;
  },
  topUpWallet: (userId: string, amount: number) => {
    const user = _users.find(u => u.id === userId);
    if (user) {
      user.walletBalance += amount;
      _transactions.push({
        id: `tx-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        type: "wallet_topup",
        amount,
        date: new Date().toISOString(),
        status: "completed",
      });
    }
  },

  // Transactions
  getTransactions: () => _transactions,

  // Agent content
  getAgentQueue: () => [..._movies, ..._series].filter(c => c.status === "agent"),
  approveContent: (id: string) => {
    const item = [..._movies, ..._series].find(c => c.id === id);
    if (item) item.status = "published";
  },
  rejectContent: (id: string) => {
    const item = [..._movies, ..._series].find(c => c.id === id);
    if (item) item.status = "draft";
  },

  // Plans
  getPlans: () => subscriptionPlans,

  // Posters helper
  getRandomPoster: () => posters[Math.floor(Math.random() * posters.length)],
};
