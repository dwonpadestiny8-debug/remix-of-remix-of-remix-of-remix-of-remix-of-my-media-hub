import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  linkTo?: string;
  order: number;
  createdAt: string;
}

export const useCarouselSlides = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "carousel"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CarouselSlide[];
      setSlides(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return { slides, loading, refetch: fetchSlides };
};

export const addCarouselSlide = async (
  data: Omit<CarouselSlide, "id" | "createdAt">
) => {
  const ref = await addDoc(collection(db, "carousel"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const deleteCarouselSlide = async (id: string) => {
  await deleteDoc(doc(db, "carousel", id));
};
