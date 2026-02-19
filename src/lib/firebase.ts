import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCbBFwM3L0Hm3YfPNHWEgLjXEvSee1y9l8",
  authDomain: "luo-destiny-f775f.firebaseapp.com",
  projectId: "luo-destiny-f775f",
  storageBucket: "luo-destiny-f775f.firebasestorage.app",
  messagingSenderId: "690203628766",
  appId: "1:690203628766:web:a9d937663111adfec4de4f",
  measurementId: "G-XVL7CH5EBF",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics only in browser
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
export { analytics };
