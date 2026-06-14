import { useState } from "react";

function StarsFilled({ n, size = "sm" }) {
  return (
    <span className={`stars stars--${size}`} aria-label={`${n} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= n ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const VISIBLE_COUNT = 6;

function ReviewItem({ review, expanded, onToggle }) {
  const isLong = (review.comment || "").length > 200;
  const text = review.comment || "Sem comentário.";
  const displayText = !expanded && isLong ? `${text.slice(0, 200)}…` : text;

  return (
    <article className="review-item-airbnb">
      <div className="review-item-head">
        <div className="review-avatar">{initials(review.author_name)}</div>
        <div className="review-author-info">
          <div className="review-author-name">{review.author_name}</div>
          {review.created_at && (
            <div className="review-date">{formatDate(review.created_at)}</div>
          )}
        </div>
      </div>
      <StarsFilled n={review.rating} />
      <p className="review-comment">{displayText}</p>
      {isLong && (
        <button type="button" className="review-show-more" onClick={onToggle}>
          {expanded ? "Mostrar menos" : "Mostrar mais"}
        </button>
      )}
    </article>
  );
}

export default function ReviewsCarousel({ reviews, avgRating, reviewCount }) {
  const [showAll, setShowAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isGuestFavorite = avgRating >= 4.8 && reviewCount >= 5;
  const visible = showAll ? reviews : reviews.slice(0, VISIBLE_COUNT);

  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <span>💬</span>
        <p>Este imóvel ainda não tem avaliações.</p>
        <p className="reviews-empty-sub">Seja o primeiro a avaliar após a sua estadia!</p>
      </div>
    );
  }

  return (
    <div className="reviews-airbnb">
      {isGuestFavorite && (
        <div className="reviews-hero">
          <div className="reviews-hero-score">
            <span className="reviews-hero-wreath">🏅</span>
            <span className="reviews-hero-number">{avgRating?.toFixed(1)}</span>
            <span className="reviews-hero-wreath">🏅</span>
          </div>
          <h3 className="reviews-hero-title">Preferido dos hóspedes</h3>
          <p className="reviews-hero-desc">
            Esta acomodação está entre as mais bem avaliadas, com base em notas,
            comentários e confiabilidade.
          </p>
        </div>
      )}

      <div className="reviews-ratings-row">
        <div className="reviews-rating-cat">
          <span className="reviews-rating-cat-score">{avgRating?.toFixed(1)}</span>
          <span className="reviews-rating-cat-label">Avaliação geral</span>
          <StarsFilled n={Math.round(avgRating ?? 0)} />
        </div>
        <div className="reviews-rating-cat">
          <span className="reviews-rating-cat-score">{avgRating?.toFixed(1)}</span>
          <span className="reviews-rating-cat-label">Limpeza</span>
        </div>
        <div className="reviews-rating-cat">
          <span className="reviews-rating-cat-score">{avgRating?.toFixed(1)}</span>
          <span className="reviews-rating-cat-label">Comunicação</span>
        </div>
        <div className="reviews-rating-cat">
          <span className="reviews-rating-cat-score">{avgRating?.toFixed(1)}</span>
          <span className="reviews-rating-cat-label">Check-in</span>
        </div>
        <div className="reviews-rating-cat">
          <span className="reviews-rating-cat-score">{avgRating?.toFixed(1)}</span>
          <span className="reviews-rating-cat-label">Localização</span>
        </div>
        <div className="reviews-rating-cat">
          <span className="reviews-rating-cat-score">{avgRating?.toFixed(1)}</span>
          <span className="reviews-rating-cat-label">Custo-benefício</span>
        </div>
      </div>

      <div className="reviews-grid-airbnb">
        {visible.map((r) => (
          <ReviewItem
            key={r.id}
            review={r}
            expanded={expandedIds.has(r.id)}
            onToggle={() => toggleExpand(r.id)}
          />
        ))}
      </div>

      {reviews.length > VISIBLE_COUNT && !showAll && (
        <button
          type="button"
          className="btn-show-all"
          onClick={() => setShowAll(true)}
        >
          Mostrar todas as {reviewCount} avaliações
        </button>
      )}
    </div>
  );
}
