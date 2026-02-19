import { useState } from "react";
import { useCarouselSlides, addCarouselSlide, deleteCarouselSlide } from "@/hooks/useCarousel";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Plus, Image } from "lucide-react";

const AdminCarousel = () => {
  const { toast } = useToast();
  const { slides, loading, refetch } = useCarouselSlides();
  const [adding, setAdding] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkTo, setLinkTo] = useState("");
  const [order, setOrder] = useState(0);

  const handleAdd = async () => {
    if (!imageUrl.trim()) {
      toast({ title: "Image URL is required", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      await addCarouselSlide({
        imageUrl: imageUrl.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        linkTo: linkTo.trim(),
        order,
      });
      toast({ title: "Slide added!" });
      setImageUrl("");
      setTitle("");
      setSubtitle("");
      setLinkTo("");
      setOrder(slides.length);
      refetch();
    } catch {
      toast({ title: "Error adding slide", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCarouselSlide(id);
      toast({ title: "Slide removed" });
      refetch();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Carousel Manager</h1>

      {/* Add new slide */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8 max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Add Carousel Slide</h2>
        </div>
        <div className="space-y-3">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (paste direct image link)"
            className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border placeholder:text-muted-foreground"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border placeholder:text-muted-foreground"
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle (optional)"
            className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border placeholder:text-muted-foreground"
          />
          <input
            value={linkTo}
            onChange={(e) => setLinkTo(e.target.value)}
            placeholder="Link to (e.g. /watch/movie-id, optional)"
            className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border placeholder:text-muted-foreground"
          />
          <input
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            placeholder="Order (0, 1, 2...)"
            type="number"
            className="w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm border border-border placeholder:text-muted-foreground"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-1 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50"
          >
            {adding && <Loader2 className="w-3 h-3 animate-spin" />} Add Slide
          </button>
        </div>
      </div>

      {/* Current slides */}
      <h2 className="text-lg font-bold text-foreground mb-3">Current Slides</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Image className="w-10 h-10 mb-2" />
          <p className="text-sm">No carousel slides yet. Add one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <div key={slide.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <img
                src={slide.imageUrl}
                alt={slide.title || "Carousel slide"}
                className="w-full h-40 object-cover"
              />
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{slide.title || "Untitled"}</p>
                  <p className="text-[10px] text-muted-foreground">Order: {slide.order}</p>
                </div>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCarousel;
