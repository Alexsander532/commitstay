import { useRef } from "react";
import PropertyCard from "./PropertyCard";

export default function PropertyCarousel({ title, properties, user }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!properties.length) return null;

  return (
    <section className="home-carousel">
      <div className="home-carousel-head">
        <h2 className="home-carousel-title">{title}</h2>
        <div className="home-carousel-nav">
          <button
            type="button"
            className="carousel-btn"
            onClick={() => scroll(-1)}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-btn"
            onClick={() => scroll(1)}
            aria-label="Próximo"
          >
            ›
          </button>
        </div>
      </div>
      <div className="home-carousel-track" ref={trackRef}>
        {properties.map((p) => (
          <div key={p.id} className="home-carousel-item">
            <PropertyCard property={p} user={user} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
