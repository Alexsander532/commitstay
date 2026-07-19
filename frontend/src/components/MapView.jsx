import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { formatPrice } from "./PropertyCard";

const PLACEHOLDER =
  "https://placehold.co/600x400/e8f2fb/1B6CA8?text=CommitStay";

function priceIcon(price) {
  return L.divIcon({
    className: "price-marker",
    html: `<span class="price-marker-text">R$&nbsp;${Math.round(Number(price))}</span>`,
    iconSize: null,
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  const key = positions.map((p) => p.join(",")).join("|");

  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 12 });
  }, [map, key, positions]);

  return null;
}

function MapPopupCard({ property }) {
  const guestFavorite =
    property.avg_rating >= 4.8 && property.review_count >= 3;

  return (
    <article className="map-popup-card">
      <div className="map-popup-media">
        <img
          src={property.cover_photo || PLACEHOLDER}
          alt={property.title}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        {guestFavorite && (
          <span className="map-popup-badge">Preferido dos hóspedes</span>
        )}
      </div>
      <div className="map-popup-body">
        <p className="map-popup-location">
          {property.city}, {property.state}
        </p>
        <h3 className="map-popup-title">{property.title}</h3>
        <div className="map-popup-meta">
          {property.avg_rating > 0 && (
            <span className="map-popup-rating">
              ★ {property.avg_rating.toFixed(1).replace(".", ",")}
              {property.review_count > 0 && (
                <span className="map-popup-reviews">
                  {" "}
                  ({property.review_count})
                </span>
              )}
            </span>
          )}
          {property.max_guests > 0 && (
            <span className="map-popup-guests">
              Até {property.max_guests} hóspede
              {property.max_guests > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="map-popup-price">
          <strong>{formatPrice(property.price_per_night)}</strong>
          <span> / noite</span>
        </p>
        <Link to={`/imovel/${property.id}`} className="map-popup-btn">
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}

export default function MapView({ properties }) {
  const valid = properties.filter((p) => p.latitude && p.longitude);
  const positions = useMemo(
    () => valid.map((p) => [Number(p.latitude), Number(p.longitude)]),
    [valid]
  );

  const center = positions.length ? positions[0] : [-15.78, -47.93];
  const missingCoords = properties.length - valid.length;

  return (
    <div className="map-wrapper">
      <div className="map-meta">
        <span>
          {valid.length} imóve{valid.length === 1 ? "l" : "is"} no mapa
          {properties.length > valid.length && ` (de ${properties.length} encontrados)`}
        </span>
        {missingCoords > 0 && (
          <span className="map-meta-warn">{missingCoords} sem coordenadas</span>
        )}
      </div>
      <div className="map-canvas">
        <MapContainer center={center} zoom={4} style={{ height: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={positions} />
          {valid.map((p) => (
            <Marker
              key={p.id}
              position={[Number(p.latitude), Number(p.longitude)]}
              icon={priceIcon(p.price_per_night)}
            >
              <Popup
                className="map-leaflet-popup"
                maxWidth={250}
                minWidth={230}
                closeButton
              >
                <MapPopupCard property={p} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
