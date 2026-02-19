import { useState } from "react";
import { useUsers, adminActivateSubscription, adminDeactivateSubscription, adminSetUserBlocked, adminDeleteUser } from "@/hooks/useUsers";
import { subscriptionPlans } from "@/data/store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, UserCheck, UserX, Trash2, ShieldBan, ShieldCheck, Crown, ChevronUp, ChevronDown, XCircle } from "lucide-react";

type Filter = "all" | "active" | "inactive";

const AdminUsers = () => {
  const { users, loading, refetch } = useUsers();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [planModal, setPlanModal] = useState<{ uid: string; name: string; mode: "activate" | "upgrade" | "downgrade" } | null>(null);

  const now = new Date();
  const activeUsers = users.filter(u => u.subscriptionExpiry && new Date(u.subscriptionExpiry) > now);
  const inactiveUsers = users.filter(u => !u.subscriptionExpiry || new Date(u.subscriptionExpiry) <= now);
  const displayed = filter === "all" ? users : filter === "active" ? activeUsers : inactiveUsers;

  const tabs: { key: Filter; label: string; count: number; icon: typeof Users }[] = [
    { key: "all", label: "All Users", count: users.length, icon: Users },
    { key: "active", label: "Active", count: activeUsers.length, icon: UserCheck },
    { key: "inactive", label: "Inactive / No Sub", count: inactiveUsers.length, icon: UserX },
  ];

  const getSubStatus = (u: typeof users[0]) => {
    if (!u.subscriptionPlan || !u.subscriptionExpiry) return "none";
    return new Date(u.subscriptionExpiry) > now ? "active" : "expired";
  };

  const withAction = async (uid: string, fn: () => Promise<void>) => {
    setActionLoading(uid);
    try {
      await fn();
      await refetch();
      toast({ title: "Done" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivatePlan = async (uid: string, planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;
    await withAction(uid, () => adminActivateSubscription(uid, plan.name, plan.durationDays));
    setPlanModal(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Users</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${filter === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Expires</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(u => {
                const status = getSubStatus(u);
                const isBlocked = u.blocked === true;
                const busy = actionLoading === u.uid;

                return (
                  <tr key={u.uid} className={`border-b border-border last:border-0 ${isBlocked ? "opacity-50" : ""}`}>
                    <td className="p-3 text-foreground font-medium">
                      {u.name}
                      {isBlocked && <span className="ml-1 text-[10px] text-destructive font-bold">(blocked)</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      {u.subscriptionPlan ? (
                        <span className="text-foreground text-xs font-semibold">{u.subscriptionPlan}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        status === "active" ? "bg-primary/20 text-primary" :
                        status === "expired" ? "bg-destructive/20 text-destructive" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {status === "active" ? "Active" : status === "expired" ? "Expired" : "No Plan"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {busy ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <>
                            {/* Activate / Upgrade / Downgrade */}
                            {status === "none" || status === "expired" ? (
                              <button
                                onClick={() => setPlanModal({ uid: u.uid, name: u.name, mode: "activate" })}
                                title="Activate subscription"
                                className="p-1 rounded hover:bg-primary/10 text-primary"
                              >
                                <Crown className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setPlanModal({ uid: u.uid, name: u.name, mode: "upgrade" })}
                                  title="Upgrade plan"
                                  className="p-1 rounded hover:bg-primary/10 text-primary"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setPlanModal({ uid: u.uid, name: u.name, mode: "downgrade" })}
                                  title="Downgrade plan"
                                  className="p-1 rounded hover:bg-accent/10 text-accent-foreground"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => withAction(u.uid, () => adminDeactivateSubscription(u.uid))}
                                  title="Deactivate subscription"
                                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Block / Unblock */}
                            <button
                              onClick={() => withAction(u.uid, () => adminSetUserBlocked(u.uid, !isBlocked))}
                              title={isBlocked ? "Unblock user" : "Block user"}
                              className={`p-1 rounded ${isBlocked ? "hover:bg-primary/10 text-primary" : "hover:bg-destructive/10 text-muted-foreground"}`}
                            >
                              {isBlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldBan className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Delete user ${u.name}? This cannot be undone.`)) {
                                  withAction(u.uid, () => adminDeleteUser(u.uid));
                                }
                              }}
                              title="Delete user"
                              className="p-1 rounded hover:bg-destructive/10 text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {displayed.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No users in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Plan Selection Modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPlanModal(null)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {planModal.mode === "activate" ? "Activate" : planModal.mode === "upgrade" ? "Upgrade" : "Downgrade"} Subscription
            </h3>
            <p className="text-sm text-muted-foreground mb-4">For: {planModal.name}</p>
            <div className="space-y-2">
              {subscriptionPlans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => handleActivatePlan(planModal.uid, plan.id)}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.duration}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{plan.price.toLocaleString()} UGX</p>
                </button>
              ))}
            </div>
            <button onClick={() => setPlanModal(null)} className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;