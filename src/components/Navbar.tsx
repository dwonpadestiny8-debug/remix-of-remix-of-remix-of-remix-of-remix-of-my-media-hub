import { Link, useLocation } from "react-router-dom";
import { Search, User, Menu, Shield, LogOut, Crown } from "lucide-react";
import { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";
import LoginModal from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Movies", path: "/movies" },
  { label: "Series", path: "/series" },
  { label: "Agent", path: "/agent" },
];

const Navbar = () => {
  const location = useLocation();
  const { user, profile, logout, hasActiveSubscription } = useAuth();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out", description: "See you soon!" });
    setUserMenuOpen(false);
  };

  const hasActive = hasActiveSubscription();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="DWON PA DESTINY" className="w-8 h-8 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-[11px] md:text-lg font-black text-gradient-green tracking-tight leading-tight whitespace-nowrap">DWON PA DESTINY.ONLINE</span>
                <span className="text-[10px] md:text-xs font-semibold tracking-wide leading-tight">
                  <span className="text-primary">📞</span>{" "}
                  <span className="text-foreground/80">0782898630</span>
                  <span className="text-muted-foreground mx-1">•</span>
                  <span className="text-foreground/80">0394803113</span>
                </span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "text-primary font-semibold"
                      : "text-secondary-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/browse" className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Search className="w-4 h-4 text-secondary-foreground" />
            </Link>

            <button
              onClick={() => setSubOpen(true)}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                hasActive ? "bg-badge-vip text-primary-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              {hasActive ? "VIP ✓" : "VIP"}
            </button>

            {user?.email === "thevoiceofdestiny0@gmail.com" && (
              <Link to="/admin" className="p-2 rounded-full hover:bg-secondary transition-colors" title="Admin">
                <Shield className="w-4 h-4 text-secondary-foreground" />
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-secondary transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {(profile?.name || user.email || "U")[0].toUpperCase()}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-medium text-foreground truncate">{profile?.name || "User"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      {hasActive && (
                        <p className="text-[10px] text-badge-vip font-medium mt-0.5 flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" /> VIP Active
                        </p>
                      )}
                    </div>
                    <Link to="/subscription" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-xs text-secondary-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Crown className="w-3 h-3" /> Subscription
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-secondary transition-colors">
                      <LogOut className="w-3 h-3" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="px-3 py-1 text-xs font-bold rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1">
                <User className="w-3 h-3" /> Login
              </button>
            )}

            <button
              className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-4 h-4 text-secondary-foreground" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-card border-t border-border px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-secondary-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <SubscriptionModal open={subOpen} onClose={() => setSubOpen(false)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Navbar;
