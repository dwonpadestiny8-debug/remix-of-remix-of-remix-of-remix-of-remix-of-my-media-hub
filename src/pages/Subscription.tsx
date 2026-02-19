import { useState, useRef } from "react";
import { Check, Crown, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import LoginModal from "@/components/LoginModal";
import PhonePaymentModal from "@/components/PhonePaymentModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { initiateDeposit, pollPaymentStatus, activateSubscription } from "@/lib/payments";

const subscriptionPlans = [
  { id: "plan-1day", name: "1 Day Pass", duration: "1 Day", price: 5000, durationDays: 1 },
  { id: "plan-1week", name: "1 Week Pass", duration: "1 Week", price: 10000, durationDays: 7 },
  { id: "plan-1month", name: "1 Month Pass", duration: "1 Month", price: 15000, durationDays: 30 },
];

const Subscription = () => {
  const { toast } = useToast();
  const { user, profile, hasActiveSubscription, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof subscriptionPlans[0] | null>(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const cancelPoll = useRef<(() => void) | null>(null);

  const hasActive = hasActiveSubscription();

  const handleSelectPlan = (plan: typeof subscriptionPlans[0]) => {
    if (!user || !profile) {
      setLoginOpen(true);
      return;
    }
    setSelectedPlan(plan);
    setPhoneModalOpen(true);
  };

  const handlePay = async (phoneNumber: string) => {
    if (!user || !profile || !selectedPlan) return;

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
            toast({ title: "✅ Subscription activated!", description: `${selectedPlan.name} is now active. Enjoy!` });
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-20 max-w-[800px] mx-auto px-4 pb-12">
        <div className="text-center mb-10">
          <Crown className="w-12 h-12 text-accent mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-foreground mb-2">VIP Subscription</h1>
          <p className="text-muted-foreground">Watch and download unlimited content</p>

          {!user && (
            <p className="mt-4 text-sm text-muted-foreground">
              Please{" "}
              <button onClick={() => setLoginOpen(true)} className="text-primary font-medium hover:underline">
                log in
              </button>{" "}
              to subscribe
            </p>
          )}

          {user && profile && hasActive && (
            <p className="mt-3 text-sm text-primary font-medium">
              ✓ Active: {profile.subscriptionPlan} — expires{" "}
              {new Date(profile.subscriptionExpiry!).toLocaleDateString()}
            </p>
          )}
        </div>

        {polling ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-base font-medium text-foreground">Waiting for payment confirmation...</p>
            <p className="text-sm text-muted-foreground">Please confirm the payment on your phone.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {subscriptionPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className={`border rounded-xl p-6 bg-card transition-colors text-center ${
                  selectedPlan?.id === plan.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary"
                }`}
              >
                <h3 className="text-lg font-bold text-foreground mb-1">{plan.duration}</h3>
                <p className="text-3xl font-black text-primary mb-1">{plan.price.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mb-4">UGX</p>
                <ul className="text-xs text-muted-foreground space-y-1 text-left">
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Watch all content</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Download offline</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> No ads</li>
                </ul>
              </button>
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
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
    </div>
  );
};

export default Subscription;
