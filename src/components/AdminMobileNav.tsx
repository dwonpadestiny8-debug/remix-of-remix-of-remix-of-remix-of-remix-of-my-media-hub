import { NavLink, useLocation } from "react-router-dom";
import { Film, Tv, Users, CreditCard, Wallet, LayoutDashboard, ListVideo, Crown, ImageIcon } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Carousel", path: "/admin/carousel", icon: ImageIcon },
  { label: "Movies", path: "/admin/movies", icon: Film },
  { label: "Series", path: "/admin/series", icon: Tv },
  { label: "Episodes", path: "/admin/episodes", icon: ListVideo },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Transactions", path: "/admin/transactions", icon: CreditCard },
  { label: "Wallet", path: "/admin/wallet", icon: Wallet },
  { label: "Subs", path: "/admin/subscriptions", icon: Crown },
];

const AdminMobileNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center overflow-x-auto scrollbar-hide px-1 pt-1 pb-3 gap-0.5">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className="flex flex-col items-center gap-0.5 min-w-[60px] flex-shrink-0 py-1"
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[9px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminMobileNav;
