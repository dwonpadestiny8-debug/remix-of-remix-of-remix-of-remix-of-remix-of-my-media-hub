import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Crown, TrendingUp, TrendingDown, XCircle } from "lucide-react";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PLANS = [
  { id: "plan-1day", name: "1 Day Pass", price: 5000, durationDays: 1 },
  { id: "plan-1week", name: "1 Week Pass", price: 10000, durationDays: 7 },
  { id: "plan-1month", name: "1 Month Pass", price: 15000, durationDays: 30 },
];

const AdminSubscriptions = () => {
  const { toast } = useToast();
  const { users, loading, refetch } = useUsers();
  const [working, setWorking] = useState<string | null>(null);

  const now = new Date();
  const activeSubscribers = users.filter(
    u => u.subscriptionPlan && u.subscriptionExpiry && new Date(u.subscriptionExpiry) > now
  );

  const changePlan = async (userId: string, userName: string, newPlan: typeof PLANS[0]) => {
    setWorking(userId + newPlan.id);
    try {
      const expiry = new Date(Date.now() + newPlan.durationDays * 86400000).toISOString();
      await updateDoc(doc(db, "users", userId), {
        subscriptionPlan: newPlan.name,
        subscriptionExpiry: expiry,
      });
      await addDoc(collection(db, "transactions"), {
        userId,
        userName,
        type: "subscription",
        amount: 0,
        plan: newPlan.name,
        date: new Date().toISOString(),
        status: "completed",
        note: "Admin plan change",
        createdAt: serverTimestamp(),
      });
      toast({ title: "Plan updated", description: `${userName} upgraded to ${newPlan.name}.` });
      refetch();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setWorking(null);
    }
  };

  const deactivate = async (userId: string, userName: string) => {
    setWorking(userId + "deactivate");
    try {
      await updateDoc(doc(db, "users", userId), {
        subscriptionPlan: null,
        subscriptionExpiry: null,
      });
      toast({ title: "Subscription deactivated", description: `${userName}'s subscription has been removed.` });
      refetch();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setWorking(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Subscriptions</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage active subscribers — upgrade, downgrade or deactivate plans.</p>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {PLANS.map(plan => (
          <div key={plan.id} className="bg-card border border-border rounded-xl p-5 text-center">
            <Crown className="w-5 h-5 text-badge-vip mx-auto mb-2" />
            <h3 className="text-base font-bold text-foreground mb-1">{plan.name}</h3>
            <p className="text-2xl font-black text-primary">{plan.price.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">UGX · {plan.durationDays} day(s)</p>
          </div>
        ))}
      </div>

      {/* Active Subscribers */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-foreground">Active Subscribers</h2>
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">{activeSubscribers.length} active</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Current Plan</th>
                <th className="text-left p-3">Expires</th>
                <th className="text-left p-3">Wallet</th>
                <th className="text-left p-3">Change Plan</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeSubscribers.map(u => {
                const currentPlan = PLANS.find(p => p.name === u.subscriptionPlan);
                const currentIdx = currentPlan ? PLANS.indexOf(currentPlan) : -1;

                return (
                  <tr key={u.uid} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <p className="text-foreground font-medium">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">
                        {u.subscriptionPlan}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3 text-foreground font-bold text-xs">
                      {(u.walletBalance || 0).toLocaleString()} UGX
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {PLANS.map((plan, idx) => {
                          if (plan.name === u.subscriptionPlan) return null;
                          const isUpgrade = idx > currentIdx;
                          const isWorking = working === u.uid + plan.id;
                          return (
                            <button
                              key={plan.id}
                              onClick={() => changePlan(u.uid, u.name, plan)}
                              disabled={!!working}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold disabled:opacity-50 transition-colors ${
                                isUpgrade
                                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                                  : "bg-secondary text-muted-foreground hover:bg-card-hover"
                              }`}
                            >
                              {isWorking ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : isUpgrade ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                              {plan.name}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => deactivate(u.uid, u.name)}
                        disabled={!!working}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-badge-hot/20 text-badge-hot hover:bg-badge-hot/30 disabled:opacity-50 transition-colors"
                      >
                        {working === u.uid + "deactivate" ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <XCircle className="w-2.5 h-2.5" />}
                        Deactivate
                      </button>
                    </td>
                  </tr>
                );
              })}
              {activeSubscribers.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No active subscribers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
