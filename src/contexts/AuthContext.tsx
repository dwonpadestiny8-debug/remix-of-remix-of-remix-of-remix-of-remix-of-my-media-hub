import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "user" | "admin";
  walletBalance: number;
  subscriptionPlan: string | null;
  subscriptionExpiry: string | null;
  blocked?: boolean;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasActiveSubscription: () => boolean;
  hasAgentSubscription: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  };

  const ensureProfile = async (firebaseUser: User, name?: string) => {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        email: firebaseUser.email || "",
        role: "user",
        walletBalance: 0,
        subscriptionPlan: null,
        subscriptionExpiry: null,
        joinedAt: new Date().toISOString(),
      };
      await setDoc(ref, { ...newProfile, createdAt: serverTimestamp() });
      setProfile(newProfile);
    } else {
      setProfile(snap.data() as UserProfile);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await ensureProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(cred.user.uid);
  };

  const register = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await ensureProfile(cred.user, name);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await ensureProfile(cred.user);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  const isAdmin = () => profile?.role === "admin" || user?.email === "thevoiceofdestiny0@gmail.com";

  const hasActiveSubscription = () => {
    if (isAdmin()) return true;
    if (profile?.blocked) return false;
    if (!profile?.subscriptionExpiry) return false;
    return new Date(profile.subscriptionExpiry) > new Date();
  };

  const hasAgentSubscription = () => {
    if (isAdmin()) return true;
    if (profile?.blocked) return false;
    if (!profile?.subscriptionExpiry || !profile?.subscriptionPlan) return false;
    const isAgent = profile.subscriptionPlan.toLowerCase().includes("agent");
    return isAgent && new Date(profile.subscriptionExpiry) > new Date();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, loginWithGoogle, logout, refreshProfile, hasActiveSubscription, hasAgentSubscription, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
