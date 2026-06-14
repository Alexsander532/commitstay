import { Link } from "react-router-dom";
import CardFavoriteButton from "./CardFavoriteButton";

const PLACEHOLDER =
  "https://placehold.co/600x400/e8f2fb/1B6CA8?text=CommitStay";

export function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isGuestFavorite(property) {
  return property.avg_rating >= 4.8 && property.review_count >= 3;
}

export default function PropertyCard({ property, user, compact = false }) {
  const guestFavorite = isGuestFavorite(property);

  return (
    <Link
      to={`/imovel/${property.id}`}
      className={`property-card${compact ? " property-card--compact" : ""}`}
      aria-label={property.title}
    >
      <div className="pc-image-wrap">
        <img
          src={property.cover_photo || PLACEHOLDER}
          alt={property.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />
        {guestFavorite && (
          <span className="pc-guest-fav-badge">Preferido dos hóspedes</span>
        )}
        <CardFavoriteButton propertyId={property.id} user={user} />
      </div>

      <div className="pc-body">
        <div className="pc-top-row">
          <h3 className="pc-title">
            {property.city} · {property.state}
          </h3>
          {property.avg_rating > 0 && (
            <span className="pc-rating-inline">
              ★ {property.avg_rating.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        <p className="pc-subtitle">{property.title}</p>
        <p className="pc-price-line">
          <strong>{formatPrice(property.price_per_night)}</strong>
          <span> / noite</span>
        </p>
      </div>
    </Link>
  );
}
