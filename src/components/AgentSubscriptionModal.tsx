import { useState, useRef } from "react";
import { Check, X, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { initiateDeposit, pollPaymentStatus, activateSubscription } from "@/lib/payments";
import LoginModal from "./LoginModal";
import PhonePaymentModal from "./PhonePaymentModal";

const agentPlans = [
  { id: "agent-1week", name: "1 Week Agent", duration: "1 Week", price: 20000, durationDays: 7 },
  { id: "agent-1month", name: "1 Month Agent", duration: "1 Month", price: 50000, durationDays: 30 },
];

interface AgentSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const AgentSubscriptionModal = ({ open, onClose }: AgentSubscriptionModalProps) => {
  const { toast } = useToast();
  const { user, profile, hasAgentSubscription, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof agentPlans[0] | null>(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const cancelPoll = useRef<(() => void) | null>(null);

  if (!open) return null;

  const handleSelectPlan = (plan: typeof agentPlans[0]) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setSelectedPlan(plan);
    setPhoneModalOpen(true);
  };

  const handlePay = async (phoneNumber: string) => {
    if (!user || !selectedPlan) return;

    const msisdn = phoneNumber.startsWith("+") ? phoneNumber : `+256${phoneNumber.replace(/^0/, "")}`;
    setLoading(true);

    try {
      const res = await initiateDeposit(msisdn, selectedPlan.price, `${selectedPlan.name} Subscription`);
      if (res.success && res.relworx?.internal_reference) {
        toast({ title: "Confirm payment", description: `Check your phone (${msisdn}) and enter your PIN to pay ${selectedPlan.price.toLocaleString()} UGX.` });
        setLoading(false);
        setPhoneModalOpen(false);
        setPolling(true);

        cancelPoll.current = pollPaymentStatus(
          res.relworx.internal_reference,
          async () => {
            await activateSubscription(user.uid, selectedPlan.name, selectedPlan.durationDays);
            await refreshProfile();
            setPolling(false);
            toast({ title: "✅ Agent Access activated!", description: `${selectedPlan.name} is now active. Enjoy early access!` });
            onClose();
          },
          (msg) => {
            setPolling(false);
            toast({ title: "Payment failed", description: msg, variant: "destructive" });
          }
        );
      } else {
        setLoading(false);
        toast({ title: "Error", description: res.message || "Could not initiate payment.", variant: "destructive" });
      }
    } catch {
      setLoading(false);
      toast({ title: "Error", description: "Network error. Try again.", variant: "destructive" });
    }
  };

  const hasActive = hasAgentSubscription();

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => { if (!polling) onClose(); }}>
        <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-[460px] mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {!polling && (
            <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          <div className="text-center mb-6">
            <Zap className="w-10 h-10 text-accent mx-auto mb-2" />
            <h2 className="text-xl font-bold text-foreground mb-1">Agent Access</h2>
            <p className="text-sm text-muted-foreground">Watch new content 3 days before everyone else</p>
            {hasActive && profile && (
              <p className="mt-2 text-xs text-primary font-medium">
                ✓ Active Agent Plan — expires {new Date(profile.subscriptionExpiry!).toLocaleDateString()}
              </p>
            )}
          </div>

          {polling ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Waiting for payment confirmation...</p>
              <p className="text-xs text-muted-foreground">Please confirm the payment on your phone.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {agentPlans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`border rounded-xl p-4 bg-secondary/30 transition-colors text-center ${
                      selectedPlan?.id === plan.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary"
                    }`}
                  >
                    <h3 className="text-sm font-bold text-foreground mb-1">{plan.duration}</h3>
                    <p className="text-2xl font-black text-primary mb-0.5">{plan.price.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">UGX</p>
                    <ul className="text-[11px] text-muted-foreground space-y-1 mt-3 text-left">
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Early access</li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Download content</li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Watch + stream</li>
                    </ul>
                  </button>
                ))}
              </div>

              {!user && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  <button onClick={() => setLoginOpen(true)} className="text-primary font-medium hover:underline">Log in</button> to subscribe
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {selectedPlan && (
        <PhonePaymentModal
          open={phoneModalOpen}
          onClose={() => setPhoneModalOpen(false)}
          planName={selectedPlan.name}
          price={selectedPlan.price}
          loading={loading}
          onPay={handlePay}
        />
      )}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default AgentSubscriptionModal;
