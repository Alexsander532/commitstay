import { useCallback, useEffect, useState } from "react";

const PLACEHOLDER = "https://placehold.co/900x600/e8f2fb/1B6CA8?text=CommitStay";

export default function PhotoGallery({ photos, title }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const isOpen = lightboxIdx !== null;

  const open = (i) => setLightboxIdx(i);
  const close = () => setLightboxIdx(null);
  const prev = useCallback(() => setLightboxIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setLightboxIdx((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, prev, next]);

  if (!photos || photos.length === 0) {
    return (
      <div className="gallery gallery--empty">
        <img src={PLACEHOLDER} alt={title} />
      </div>
    );
  }

  const showAllLabel = photos.length > 5
    ? `Mostrar todas as ${photos.length} fotos`
    : "Mostrar todas as fotos";

  return (
    <>
      <div className="gallery-wrap">
        <div
          className={`gallery gallery--${Math.min(photos.length, 5)}`}
          role="list"
          aria-label="Fotos do imóvel"
        >
          {photos.slice(0, 5).map((photo, i) => (
            <button
              key={photo.id ?? i}
              type="button"
              className={`gallery-cell${i === 0 ? " gallery-cell--main" : ""}`}
              onClick={() => open(i)}
              aria-label={`Ver foto ${i + 1}${photo.caption ? `: ${photo.caption}` : ""}`}
            >
              <img
                src={photo.url || PLACEHOLDER}
                alt={photo.caption || `Foto ${i + 1} de ${title}`}
                loading={i === 0 ? "eager" : "lazy"}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
              />
            </button>
          ))}
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            className="gallery-show-all"
            onClick={() => open(0)}
          >
            <span className="gallery-show-all-icon">▦</span>
            {showAllLabel}
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="lightbox-backdrop"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos"
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={close}
            aria-label="Fechar galeria"
          >
            ✕
          </button>

          <button
            type="button"
            className="lightbox-nav lightbox-nav--prev"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Foto anterior"
          >
            ‹
          </button>

          <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIdx].url || PLACEHOLDER}
              alt={photos[lightboxIdx].caption || `Foto ${lightboxIdx + 1}`}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
            />
            {photos[lightboxIdx].caption && (
              <div className="lightbox-caption">{photos[lightboxIdx].caption}</div>
            )}
          </div>

          <button
            type="button"
            className="lightbox-nav lightbox-nav--next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Próxima foto"
          >
            ›
          </button>

          <div className="lightbox-counter">
            {lightboxIdx + 1} / {photos.length}
          </div>

          <div className="lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
            {photos.map((p, i) => (
              <button
                key={p.id ?? i}
                type="button"
                className={`lightbox-thumb${i === lightboxIdx ? " active" : ""}`}
                onClick={() => setLightboxIdx(i)}
                aria-label={`Ir para foto ${i + 1}`}
                aria-current={i === lightboxIdx}
              >
                <img
                  src={p.url || PLACEHOLDER}
                  alt=""
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
