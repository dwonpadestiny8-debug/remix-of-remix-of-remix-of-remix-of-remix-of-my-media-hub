import { useState } from "react";
import { useAllContent } from "@/hooks/useContent";
import { useUsers, useTransactions } from "@/hooks/useUsers";
import { Film, Tv, Users, CreditCard, Clock, Loader2, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { content, loading: contentLoading } = useAllContent();
  const { users, loading: usersLoading } = useUsers();
  const { transactions, loading: txLoading } = useTransactions();

  const movies = content.filter(c => c.type === "movie" && c.status === "published").length;
  const series = content.filter(c => c.type === "series" && c.status === "published").length;
  const agentQueue = content.filter(c => c.status === "agent").length;
  const totalRevenue = transactions.filter(t => t.status === "completed").reduce((s, t) => s + t.amount, 0);

  const loading = contentLoading || usersLoading || txLoading;

  const stats = [
    { label: "Movies", value: movies, icon: Film, color: "text-primary" },
    { label: "Series", value: series, icon: Tv, color: "text-primary" },
    { label: "Users", value: users.length, icon: Users, color: "text-badge-vip" },
    { label: "Revenue", value: `${totalRevenue.toLocaleString()} UGX`, icon: CreditCard, color: "text-primary" },
    { label: "Agent Queue", value: agentQueue, icon: Clock, color: "text-badge-hot" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {stats.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-bold text-foreground mb-3">Recent Transactions</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map(tx => (
                  <tr key={tx.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-foreground">{tx.userName}</td>
                    <td className="p-3 text-muted-foreground capitalize">{tx.type.replace(/_/g, " ")}</td>
                    <td className="p-3 text-foreground">{tx.amount.toLocaleString()} UGX</td>
                    <td className="p-3 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.status === "completed" ? "bg-primary/20 text-primary" : "bg-badge-hot/20 text-badge-hot"}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No transactions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Change Password */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Change Admin Password
            </h2>
            <div className="bg-card border border-border rounded-xl p-4 max-w-md space-y-3">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="New password"
                className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border"
              />
              <button
                onClick={() => {
                  const stored = localStorage.getItem("admin_panel_password") || "admin123";
                  if (currentPw !== stored) {
                    toast({ title: "Wrong current password", variant: "destructive" });
                    return;
                  }
                  if (newPw.trim().length < 4) {
                    toast({ title: "Password too short", description: "Minimum 4 characters.", variant: "destructive" });
                    return;
                  }
                  localStorage.setItem("admin_panel_password", newPw.trim());
                  setCurrentPw(""); setNewPw("");
                  toast({ title: "Password updated!" });
                }}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
