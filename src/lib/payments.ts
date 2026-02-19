import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const API_BASE = "https://api.thevoiceofdestiny0.workers.dev/api";

interface RelworxResult {
  internal_reference?: string;
  status?: string;
  amount?: number;
  msisdn?: string;
}

interface DepositResponse {
  success: boolean;
  relworx?: RelworxResult;
  message?: string;
}

interface StatusResponse {
  success: boolean;
  relworx?: RelworxResult & {
    request_status?: string;
    provider?: string;
    provider_transaction_id?: string;
    completed_at?: string;
  };
  message?: string;
}

export interface WalletBalanceResponse {
  success: boolean;
  message?: string;
  relworx?: {
    success: boolean;
    balance: number;
    message?: string;
  };
}

export interface BackendTransaction {
  id?: string;
  internal_reference?: string;
  amount?: number;
  msisdn?: string;
  status?: string;
  type?: string;
  created_at?: string;
  [key: string]: any;
}

export interface TransactionsResponse {
  success: boolean;
  message?: string;
  relworx?: {
    success: boolean;
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
    transactions: BackendTransaction[];
    message?: string;
  };
}

export async function fetchWalletBalance(): Promise<WalletBalanceResponse> {
  console.log("[payments] fetchWalletBalance →", `${API_BASE}/wallet/balance`);
  const res = await fetch(`${API_BASE}/wallet/balance`);
  const data = await res.json();
  console.log("[payments] fetchWalletBalance response:", JSON.stringify(data));
  if (!res.ok) throw new Error(data?.relworx?.message || data?.message || JSON.stringify(data));
  return data;
}

export async function fetchBackendTransactions(): Promise<TransactionsResponse> {
  console.log("[payments] fetchBackendTransactions →", `${API_BASE}/transactions`);
  const res = await fetch(`${API_BASE}/transactions`);
  const data = await res.json();
  console.log("[payments] fetchBackendTransactions response:", JSON.stringify(data));
  if (!res.ok) throw new Error(data?.relworx?.message || data?.message || JSON.stringify(data));
  return data;
}

export async function initiateDeposit(msisdn: string, amount: number, description: string): Promise<DepositResponse> {
  console.log("[payments] initiateDeposit →", { msisdn, amount, description });
  const res = await fetch(`${API_BASE}/request-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn, amount, description }),
  });
  const data = await res.json();
  console.log("[payments] initiateDeposit response:", JSON.stringify(data));
  return data;
}

export async function initiateWithdraw(msisdn: string, amount: number, description: string) {
  console.log("[payments] initiateWithdraw →", { msisdn, amount, description });
  const res = await fetch(`${API_BASE}/send-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn, amount, description }),
  });
  const data = await res.json();
  console.log("[payments] initiateWithdraw response:", JSON.stringify(data));
  return data;
}

export async function checkStatus(internalReference: string): Promise<StatusResponse> {
  console.log("[payments] checkStatus →", internalReference);
  const res = await fetch(`${API_BASE}/request-status?internal_reference=${encodeURIComponent(internalReference)}`);
  const data = await res.json();
  console.log("[payments] checkStatus response:", JSON.stringify(data));
  return data;
}

export function pollPaymentStatus(
  internalReference: string,
  onSuccess: (data: StatusResponse) => void,
  onFail: (msg: string) => void,
  onPoll?: (attempt: number) => void,
  maxAttempts = 30,
  intervalMs = 10000
): () => void {
  let attempt = 0;
  const id = setInterval(async () => {
    attempt++;
    onPoll?.(attempt);
    try {
      const data = await checkStatus(internalReference);
      if (data.success && data.relworx?.status === "success") {
        clearInterval(id);
        onSuccess(data);
      } else if (data.relworx?.status === "failed") {
        clearInterval(id);
        onFail(data.message || "Payment failed");
      } else if (attempt >= maxAttempts) {
        clearInterval(id);
        onFail("Payment verification timed out. Please check your phone.");
      }
    } catch {
      if (attempt >= maxAttempts) {
        clearInterval(id);
        onFail("Could not verify payment. Please try again.");
      }
    }
  }, intervalMs);

  return () => clearInterval(id);
}

export async function activateSubscription(
  uid: string,
  planName: string,
  durationDays: number
) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durationDays);

  await updateDoc(doc(db, "users", uid), {
    subscriptionPlan: planName,
    subscriptionExpiry: expiry.toISOString(),
    updatedAt: serverTimestamp(),
  });
}
