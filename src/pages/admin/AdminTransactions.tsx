import { useTransactions } from "@/hooks/useUsers";
import { Loader2 } from "lucide-react";

const AdminTransactions = () => {
  const { transactions, loading } = useTransactions();
  const total = transactions.filter(t => t.status === "completed").reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <span className="text-sm text-muted-foreground">Total: <span className="text-foreground font-bold">{total.toLocaleString()} UGX</span></span>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-foreground">{tx.userName}</td>
                  <td className="p-3 text-muted-foreground capitalize">{tx.type.replace(/_/g, " ")}</td>
                  <td className="p-3 text-muted-foreground">{tx.plan || "—"}</td>
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
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
