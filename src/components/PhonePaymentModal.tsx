import { useState } from "react";
import { Phone, X, Loader2 } from "lucide-react";

interface PhonePaymentModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  price: number;
  loading: boolean;
  onPay: (phoneNumber: string) => void;
}

const PhonePaymentModal = ({ open, onClose, planName, price, loading, onPay }: PhonePaymentModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    onPay(phoneNumber);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-[380px] mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-foreground">{planName}</h3>
          <p className="text-2xl font-black text-primary mt-1">{price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">UGX</span></p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Mobile Money Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="0770123456"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !phoneNumber || phoneNumber.length < 10}
            className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {loading ? "Initiating..." : `Pay ${price.toLocaleString()} UGX`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhonePaymentModal;
