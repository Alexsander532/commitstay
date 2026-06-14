import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

const pinIcon = L.divIcon({
  className: "location-pin",
  html: `<div class="location-pin-inner">🏠</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

export default function PropertyLocationMap({ latitude, longitude, city, state }) {
  if (!latitude || !longitude) {
    return (
      <div className="location-map location-map--empty">
        Localização não disponível para este imóvel.
      </div>
    );
  }

  const pos = [Number(latitude), Number(longitude)];

  return (
    <div className="location-map">
      <MapContainer center={pos} zoom={14} scrollWheelZoom={false} style={{ height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pos} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}
