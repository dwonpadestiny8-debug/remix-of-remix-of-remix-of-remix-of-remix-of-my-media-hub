import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/contexts/AuthContext";

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "subscription" | "wallet_topup" | "wallet_withdraw";
  amount: number;
  plan?: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((d) => ({ ...d.data() } as UserProfile)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);
  return { users, loading, refetch: fetchUsers };
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTx = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "transactions"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTx(); }, []);
  return { transactions, loading, refetch: fetchTx };
};

// Admin: activate subscription for a user
export const adminActivateSubscription = async (
  uid: string,
  planName: string,
  durationDays: number
) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durationDays);
  await updateDoc(doc(db, "users", uid), {
    subscriptionPlan: planName,
    subscriptionExpiry: expiry.toISOString(),
    updatedAt: serverTimestamp(),
  });
};

// Admin: deactivate subscription
export const adminDeactivateSubscription = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    subscriptionPlan: null,
    subscriptionExpiry: null,
    updatedAt: serverTimestamp(),
  });
};

// Admin: block/unblock user
export const adminSetUserBlocked = async (uid: string, blocked: boolean) => {
  await updateDoc(doc(db, "users", uid), {
    blocked,
    updatedAt: serverTimestamp(),
  });
};

// Admin: delete user document
export const adminDeleteUser = async (uid: string) => {
  await deleteDoc(doc(db, "users", uid));
};
