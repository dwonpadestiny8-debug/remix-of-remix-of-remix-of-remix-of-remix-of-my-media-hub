import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useCarouselSlides } from "@/hooks/useCarousel";
import heroBannerFallback from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  const { slides, loading } = useCarouselSlides();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeIndex];

  // Fallback if no slides uploaded
  const imageUrl = currentSlide?.imageUrl || heroBannerFallback;
  const title = currentSlide?.title || "";
  const subtitle = currentSlide?.subtitle || "";
  const linkTo = currentSlide?.linkTo || "";

  return (
    <section className="relative w-full h-[200px] md:h-[320px] overflow-hidden">
      <img
        src={imageUrl}
        alt={title || "Featured"}
        className="w-full h-full object-cover object-top transition-all duration-700"
        key={activeIndex}
      />
      <div className="absolute inset-0 hero-gradient" />

      {/* Text overlay */}
      {title && (
        <div className="hidden md:block absolute bottom-4 left-0 px-4 max-w-[1400px] mx-auto w-full">
          <div className="max-w-sm animate-fade-in">
            <h1 className="text-lg font-black text-foreground mb-1 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground">{subtitle}</p>
            )}
            {linkTo && (
              <div className="flex items-center gap-2 mt-2">
                <Link
                  to={linkTo}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Play
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeIndex ? "bg-primary" : "bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroBanner;
