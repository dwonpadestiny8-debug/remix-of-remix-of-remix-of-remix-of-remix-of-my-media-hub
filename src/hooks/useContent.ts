import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ContentType = "movie" | "series";
export type ContentStatus = "published" | "agent" | "draft";

export interface Episode {
  id: string;
  seriesId: string;
  season: number;
  number: number;
  title: string;
  videoUrl: string;
  duration: string;
}

export interface Content {
  id: string;
  title: string;
  poster: string;
  videoUrl?: string;
  trailerUrl?: string;
  type: ContentType;
  status: ContentStatus;
  rating: number;
  year: number;
  genres: string[];
  description: string;
  isVip: boolean;
  isNew: boolean;
  episodes?: Episode[];
  createdAt: string;
}

export const useContent = (type?: ContentType, status: ContentStatus = "published") => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      let q;
      if (type) {
        q = query(
          collection(db, "content"),
          where("type", "==", type),
          where("status", "==", status)
        );
      } else {
        q = query(collection(db, "content"), where("status", "==", status));
      }
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return { id: d.id, ...data } as Content;
      });
      setContent(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [type, status]);

  return { content, loading, refetch: fetch };
};

export const useAllContent = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "content"));
      const items = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return { id: d.id, ...data } as Content;
      });
      setContent(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { content, loading, refetch: fetch };
};

export const useContentById = (id: string) => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "content", id));
        if (snap.exists()) {
          setContent({ id: snap.id, ...snap.data() } as Content);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { content, loading };
};

export const addContent = async (data: Omit<Content, "id">) => {
  const ref = await addDoc(collection(db, "content"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
};

export const updateContentStatus = async (id: string, status: ContentStatus) => {
  await updateDoc(doc(db, "content", id), { status });
};

export const updateContent = async (id: string, data: Partial<Omit<Content, "id">>) => {
  await updateDoc(doc(db, "content", id), data);
};

export const deleteContent = async (id: string) => {
  await deleteDoc(doc(db, "content", id));
};

export const addEpisode = async (seriesId: string, episode: Omit<Episode, "id">) => {
  const ref = await addDoc(collection(db, `content/${seriesId}/episodes`), episode);
  // Also update the episodes array in the content doc for quick reads
  const snap = await getDoc(doc(db, "content", seriesId));
  if (snap.exists()) {
    const data = snap.data();
    const eps: Episode[] = data.episodes || [];
    eps.push({ id: ref.id, ...episode });
    await updateDoc(doc(db, "content", seriesId), { episodes: eps });
  }
};
