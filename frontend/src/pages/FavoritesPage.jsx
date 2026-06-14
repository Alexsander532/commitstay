import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites } from "../api/endpoints";
import PropertyCard from "../components/PropertyCard";
import { useAuth } from "../context/AuthContext";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container dash-page">
      <h1>Meus favoritos</h1>
      <p className="dash-sub">
        Imóveis que você salvou para consultar depois.
      </p>

      {loading && <div className="loading">Carregando…</div>}

      {!loading && properties.length === 0 && (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">♡</div>
          <h3>Nenhum favorito ainda</h3>
          <p>Salve imóveis que você gostou para encontrá-los aqui com facilidade.</p>
          <Link to="/" className="btn btn-primary">
            Explorar imóveis
          </Link>
        </div>
      )}

      {!loading && properties.length > 0 && (
        <div className="property-grid">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} user={user} />
          ))}
        </div>
      )}
    </main>
  );
}
