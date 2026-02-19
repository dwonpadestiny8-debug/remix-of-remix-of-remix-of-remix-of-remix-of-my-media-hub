import { useState } from "react";
import { useAllContent, addContent, deleteContent, updateContent, type Content } from "@/hooks/useContent";
import { Plus, Trash2, Loader2, Pencil, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSeries = () => {
  const { toast } = useToast();
  const { content, loading, refetch } = useAllContent();
  const series = content.filter(c => c.type === "series");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("2026");
  const [genres, setGenres] = useState("Drama");
  const [posterUrl, setPosterUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isAgent, setIsAgent] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Content>>({});

  const startEdit = (s: Content) => {
    setEditingId(s.id);
    setEditData({
      title: s.title,
      year: s.year,
      genres: s.genres,
      poster: s.poster,
      description: s.description,
      isVip: s.isVip,
      isNew: s.isNew,
      status: s.status,
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateContent(editingId, editData);
      toast({ title: "Series updated" });
      setEditingId(null);
      refetch();
    } catch {
      toast({ title: "Error updating series", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const newSeries: Omit<Content, "id"> = {
        title,
        poster: posterUrl.trim() || "https://placehold.co/300x450/111/22c55e?text=" + encodeURIComponent(title),
        type: "series",
        status: isAgent ? "agent" : "published",
        rating: 8.0,
        year: parseInt(year),
        genres: genres.split(",").map(g => g.trim()),
        description: description.trim() || "A captivating series.",
        isVip,
        isNew,
        episodes: [],
        createdAt: new Date().toISOString(),
      };
      await addContent(newSeries);
      toast({ title: "Series added", description: isAgent ? "Sent to agent review." : "Published." });
      setTitle(""); setPosterUrl(""); setDescription("");
      setShowForm(false);
      refetch();
    } catch {
      toast({ title: "Error adding series", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteContent(id);
      toast({ title: "Deleted" });
      refetch();
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Series ({series.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Upload Series
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Series title *" className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border" />
          <div className="flex gap-3">
            <input value={year} onChange={e => setYear(e.target.value)} placeholder="Year" className="px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border w-32" />
            <input value={genres} onChange={e => setGenres(e.target.value)} placeholder="Genres (comma separated)" className="flex-1 px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border" />
          </div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border resize-none" />
          <input value={posterUrl} onChange={e => setPosterUrl(e.target.value)} placeholder="Poster URL" className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isVip} onChange={e => setIsVip(e.target.checked)} className="rounded" /> VIP Only
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="rounded" /> Mark as New
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isAgent} onChange={e => setIsAgent(e.target.checked)} className="rounded" /> Send to Agent Review
            </label>
          </div>
          <button onClick={handleAdd} disabled={saving} className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50">
            {saving && <Loader2 className="w-3 h-3 animate-spin" />} Add Series
          </button>
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <div className="bg-card border-2 border-primary rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-primary">✏️ Editing Series</h2>
            <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <input value={editData.title || ""} onChange={e => setEditData(p => ({ ...p, title: e.target.value }))} placeholder="Title *" className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border" />
          <div className="flex gap-3">
            <input value={editData.year || ""} onChange={e => setEditData(p => ({ ...p, year: parseInt(e.target.value) || 0 }))} placeholder="Year" className="px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border w-32" />
            <input value={editData.genres?.join(", ") || ""} onChange={e => setEditData(p => ({ ...p, genres: e.target.value.split(",").map(g => g.trim()) }))} placeholder="Genres" className="flex-1 px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border" />
          </div>
          <textarea value={editData.description || ""} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border resize-none" />
          <input value={editData.poster || ""} onChange={e => setEditData(p => ({ ...p, poster: e.target.value }))} placeholder="Poster URL" className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={editData.isVip || false} onChange={e => setEditData(p => ({ ...p, isVip: e.target.checked }))} className="rounded" /> VIP Only
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={editData.isNew || false} onChange={e => setEditData(p => ({ ...p, isNew: e.target.checked }))} className="rounded" /> Mark as New
            </label>
            <select value={editData.status || "published"} onChange={e => setEditData(p => ({ ...p, status: e.target.value as Content["status"] }))} className="px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border">
              <option value="published">Published</option>
              <option value="agent">Agent</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button onClick={handleUpdate} disabled={saving} className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-4 h-4" />} Save Changes
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left p-3">Poster</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Genres</th>
                <th className="text-left p-3">Episodes</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {series.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-3"><img src={s.poster} alt="" className="w-10 h-14 object-cover rounded" /></td>
                  <td className="p-3 text-foreground font-medium max-w-[180px] truncate">{s.title}</td>
                  <td className="p-3 text-muted-foreground text-xs">{s.genres.join(", ")}</td>
                  <td className="p-3 text-muted-foreground">{s.episodes?.length || 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === "published" ? "bg-primary/20 text-primary" :
                      s.status === "agent" ? "bg-badge-vip/20 text-badge-vip" :
                      "bg-secondary text-muted-foreground"
                    }`}>{s.status.replace("_", " ")}</span>
                  </td>
                  <td className="p-3 flex gap-1">
                    <button onClick={() => startEdit(s)} className="p-1 rounded hover:bg-primary/20 text-primary transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors disabled:opacity-50">
                      {deleting === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {series.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No series yet. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSeries;
