import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Watch from "./pages/Watch";
import MovieDetail from "./pages/MovieDetail";
import Subscription from "./pages/Subscription";
import Agent from "./pages/Agent";
import Browse from "./pages/Browse";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMovies from "./pages/admin/AdminMovies";
import AdminSeries from "./pages/admin/AdminSeries";
import AdminEpisodes from "./pages/admin/AdminEpisodes";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminCarousel from "./pages/admin/AdminCarousel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/browse" element={<Browse />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="carousel" element={<AdminCarousel />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="series" element={<AdminSeries />} />
              <Route path="episodes" element={<AdminEpisodes />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="wallet" element={<AdminWallet />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
