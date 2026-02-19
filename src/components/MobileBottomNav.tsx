import { Link, useLocation } from "react-router-dom";
import { Home, Film, Tv, Sparkles, User, Shield } from "lucide-react";
import { useState } from "react";
import LoginModal from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Movies", path: "/movies", icon: Film },
  { label: "Series", path: "/series", icon: Tv },
  { label: "Agent", path: "/agent", icon: Sparkles },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { user, profile, isAdmin } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
        <div className="flex items-center justify-around px-2 pt-2 pb-3">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex flex-col items-center gap-0.5 min-w-[56px] group"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                      : "text-muted-foreground group-hover:text-foreground group-hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Admin link for admins */}
          {user && isAdmin() && (
            <Link
              to="/admin"
              className="flex flex-col items-center gap-0.5 min-w-[56px] group"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${
                  location.pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                    : "text-muted-foreground group-hover:text-foreground group-hover:bg-secondary"
                }`}
              >
                <Shield className="w-5 h-5" strokeWidth={location.pathname.startsWith("/admin") ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Admin
              </span>
            </Link>
          )}

          {/* Account */}
          {user ? (
            <Link
              to="/subscription"
              className="flex flex-col items-center gap-0.5 min-w-[56px] group"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${
                  location.pathname === "/subscription"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                    : "text-muted-foreground group-hover:text-foreground group-hover:bg-secondary"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                  {(profile?.name || user.email || "U")[0].toUpperCase()}
                </div>
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  location.pathname === "/subscription" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Account
              </span>
            </Link>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl text-muted-foreground group-hover:text-foreground group-hover:bg-secondary transition-all duration-200">
                <User className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">Account</span>
            </button>
          )}
        </div>
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
