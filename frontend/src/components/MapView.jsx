import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { formatPrice } from "./PropertyCard";

function priceIcon(price) {
  return L.divIcon({
    className: "price-marker",
    html: `R$ ${Math.round(Number(price))}`,
    iconSize: null,
  });
}

export default function MapView({ properties }) {
  const valid = properties.filter((p) => p.latitude && p.longitude);
  const center = valid.length
    ? [Number(valid[0].latitude), Number(valid[0].longitude)]
    : [-15.78, -47.93]; // Brasília como fallback

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={valid.length > 1 ? 4 : 12} style={{ height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {valid.map((p) => (
          <Marker
            key={p.id}
            position={[Number(p.latitude), Number(p.longitude)]}
            icon={priceIcon(p.price_per_night)}
          >
            <Popup>
              <div className="map-popup">
                {p.cover_photo && <img src={p.cover_photo} alt={p.title} />}
                <div className="title">{p.title}</div>
                <div>
                  {p.city}, {p.state}
                </div>
                <div>
                  <strong>{formatPrice(p.price_per_night)}</strong> / noite
                  {p.avg_rating ? ` · ★ ${p.avg_rating.toFixed(1)}` : ""}
                </div>
                <Link to={`/imovel/${p.id}`}>Ver detalhes →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
