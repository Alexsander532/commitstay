import { useEffect, useRef, useState } from "react";
import { listProperties } from "../api/endpoints";
import MapView from "../components/MapView";
import PropertyCard from "../components/PropertyCard";
import PropertyCarousel from "../components/PropertyCarousel";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";
import { resolveSearchDates } from "../components/SearchWhenPopover";

function toApiFilters(filters) {
  const resolved = resolveSearchDates(filters);
  const params = {
    city: resolved.city,
    check_in: resolved.check_in,
    check_out: resolved.check_out,
    guests: resolved.guests,
    min_price: resolved.min_price,
    max_price: resolved.max_price,
  };
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v != null)
  );
}

function hasActiveFilters(filters) {
  const {
    city,
    check_in,
    check_out,
    guests,
    min_price,
    max_price,
    date_mode,
    flex_duration,
    flex_month,
  } = filters;
  if (city) return true;
  if (guests) return true;
  if (min_price) return true;
  if (max_price) return true;
  if (check_in || check_out) return true;
  if (date_mode === "flexible" && flex_duration && flex_month) return true;
  return false;
}

function groupByCity(properties) {
  const map = {};
  for (const p of properties) {
    if (!map[p.city]) map[p.city] = [];
    map[p.city].push(p);
  }
  return Object.entries(map)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([city, items]) => ({
      city,
      properties: [...items].sort(
        (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0) || b.review_count - a.review_count
      ),
    }));
}

async function fetchAllProperties(params = {}) {
  let page = 1;
  let all = [];
  let total = 0;
  do {
    const data = await listProperties({ ...params, page });
    all = all.concat(data.results);
    total = data.count;
    page += 1;
  } while (all.length < total);
  return all;
}

const SECTION_LABELS = {
  "São Paulo": "Muito procurados em São Paulo",
  "Rio de Janeiro": "Disponíveis no Rio de Janeiro",
  "Campinas": "Hospedagens em Campinas",
  "Curitiba": "Lugares para ficar em Curitiba",
  "Florianópolis": "Destaques em Florianópolis",
  "Belo Horizonte": "Opções em Belo Horizonte",
  "Salvador": "Experiências em Salvador",
  "Gramado": "Acomodações em Gramado",
};

function sectionTitle(city) {
  return SECTION_LABELS[city] || `Imóveis em ${city}`;
}

export default function Home() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [mapProperties, setMapProperties] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  // Guard contra re-execução do fetchAllProperties (ex: React StrictMode)
  const initialFetchDone = useRef(false);

  const searching = hasActiveFilters(filters);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (searching) {
      listProperties({ ...toApiFilters(filters), page })
        .then((data) => {
          setProperties(data.results);
          setCount(data.count);
        })
        .catch(() => setError("Não foi possível carregar os imóveis. O backend está rodando?"))
        .finally(() => setLoading(false));
    } else if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAllProperties()
        .then((all) => {
          setAllProperties(all);
          setCount(all.length);
        })
        .catch(() => setError("Não foi possível carregar os imóveis. O backend está rodando?"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [filters, page, searching]);

  useEffect(() => {
    if (view !== "map") return;

    if (!searching) {
      setMapProperties(allProperties);
      setMapLoading(false);
      return;
    }

    setMapLoading(true);
    fetchAllProperties(toApiFilters(filters))
      .then((all) => setMapProperties(all))
      .catch(() => setError("Não foi possível carregar os imóveis no mapa."))
      .finally(() => setMapLoading(false));
  }, [filters, searching, view, allProperties]);

  const totalPages = Math.ceil(count / 12);
  const citySections = groupByCity(allProperties);
  const topRated = [...allProperties]
    .filter((p) => p.avg_rating >= 4.5)
    .sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
    .slice(0, 12);

  const resultLabel = loading
    ? "Carregando…"
    : searching
      ? `${count} imóve${count === 1 ? "l" : "is"} encontrado${count === 1 ? "" : "s"}`
      : `${count} imóve${count === 1 ? "l" : "is"} disponíve${count === 1 ? "l" : "is"}`;

  return (
    <main className={searching ? "container" : "home-page"}>
      <div className={searching ? "" : "container"}>
        <SearchBar
          onSearch={(f) => {
            setPage(1);
            setFilters(f);
          }}
        />
      </div>

      {!loading && !error && (
        <div className="container">
          <div className="results-bar home-results-bar">
            <span>{resultLabel}</span>
            <div className="view-toggle">
              <button
                type="button"
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
              >
                ☰ Lista
              </button>
              <button
                type="button"
                className={view === "map" ? "active" : ""}
                onClick={() => setView("map")}
              >
                🗺 Mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="container">
          <div className="form-error">{error}</div>
        </div>
      )}

      {loading && <div className="loading">Carregando imóveis…</div>}

      {!loading && !error && searching && properties.length === 0 && view === "list" && (
        <div className="container empty-state">
          <h3>Nenhum imóvel encontrado</h3>
          <p>Tente ajustar os filtros de busca.</p>
        </div>
      )}

      {!loading && !error && view === "map" && (
        <div className="container home-map-section">
          {mapLoading ? (
            <div className="loading">Carregando mapa com todos os imóveis…</div>
          ) : mapProperties.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum imóvel no mapa</h3>
              <p>Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <MapView properties={mapProperties} />
          )}
        </div>
      )}

      {!loading && !error && view === "list" && searching && (
        <div className="container">
          <div className="property-grid">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} user={user} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="results-bar" style={{ justifyContent: "center", paddingBottom: 48 }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && !error && view === "list" && !searching && (
        <div className="home-sections">
          {topRated.length >= 4 && (
            <PropertyCarousel
              title="Preferidos dos hóspedes"
              properties={topRated}
              user={user}
            />
          )}
          {citySections.map(({ city, properties: cityProps }) => (
            <PropertyCarousel
              key={city}
              title={sectionTitle(city)}
              properties={cityProps}
              user={user}
            />
          ))}
        </div>
      )}
    </main>
  );
}
