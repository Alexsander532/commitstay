import { useEffect, useRef, useState } from "react";
import SearchWhenPopover, {
  formatWhenLabel,
  resolveSearchDates,
} from "./SearchWhenPopover";

const EMPTY = {
  city: "",
  check_in: "",
  check_out: "",
  guests: "",
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0,
  date_mode: "dates",
  flex_days: 0,
  flex_duration: "",
  flex_month: "",
  min_price: "",
  max_price: "",
};

const SUGGESTED_CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Campinas",
  "Curitiba",
  "Florianópolis",
  "Gramado",
  "Salvador",
  "Belo Horizonte",
  "Recife",
  "Fortaleza",
  "Natal",
  "Brasília",
];

const GUEST_CATEGORIES = [
  { key: "adults", label: "Adultos", hint: "A partir de 18 anos" },
  { key: "children", label: "Crianças", hint: "De 2 a 17 anos" },
  { key: "infants", label: "Bebês", hint: "Menor de 2 anos" },
  { key: "pets", label: "Animais de estimação", hint: "Vai levar um animal?" },
];

function totalTravelers({ adults, children, infants }) {
  return Number(adults || 0) + Number(children || 0) + Number(infants || 0);
}

function guestsLabel(filters) {
  const total = totalTravelers(filters);
  const pets = Number(filters.pets || 0);
  if (!total && !pets) return "Hóspedes?";

  const parts = [];
  if (total === 1) parts.push("1 hóspede");
  else if (total > 1) parts.push(`${total} hóspedes`);
  if (pets === 1) parts.push("1 animal");
  else if (pets > 1) parts.push(`${pets} animais`);

  return parts.join(" · ");
}

function GuestRow({ label, hint, value, onChange, min = 0, max = 16 }) {
  return (
    <div className="search-guest-row">
      <div>
        <strong>{label}</strong>
        <span className="search-guest-hint">{hint}</span>
      </div>
      <div className="search-stepper">
        <button
          type="button"
          className="search-stepper-btn"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={`Menos ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="search-stepper-value">{value}</span>
        <button
          type="button"
          className="search-stepper-btn"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label={`Mais ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function SearchBar({ initial = {}, onSearch }) {
  const [active, setActive] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const wrapRef = useRef(null);
  const cityInputRef = useRef(null);
  const [filters, setFilters] = useState({ ...EMPTY, ...initial });

  const hasTravelers = totalTravelers(filters) > 0 || Number(filters.pets || 0) > 0;
  const hasFilters = Object.entries(filters).some(([k, v]) => {
    if (["adults", "children", "infants", "pets", "flex_days"].includes(k)) {
      return Number(v) > 0;
    }
    if (k === "date_mode") return v === "flexible";
    return v !== "" && v != null;
  });
  const hasPriceFilters = filters.min_price !== "" || filters.max_price !== "";

  useEffect(() => {
    if (!active) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setActive(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [active]);

  useEffect(() => {
    if (active === "where") cityInputRef.current?.focus();
  }, [active]);

  const patch = (updates) => setFilters((f) => ({ ...f, ...updates }));

  const submit = (e) => {
    e.preventDefault();
    setActive(null);
    const resolved = resolveSearchDates(filters);
    const capacityGuests = Number(resolved.adults || 0) + Number(resolved.children || 0);
    onSearch({
      ...resolved,
      guests: capacityGuests > 0 ? String(capacityGuests) : "",
    });
  };

  const clear = () => {
    setFilters(EMPTY);
    onSearch(EMPTY);
    setActive(null);
    setAdvancedOpen(false);
  };

  const set = (key) => (value) => patch({ [key]: value });

  const toggle = (segment) => {
    setActive((a) => (a === segment ? null : segment));
  };

  const updateGuest = (key, next) => {
    setFilters((f) => {
      const updated = { ...f, [key]: Math.max(0, next) };
      const cap = Number(updated.adults || 0) + Number(updated.children || 0);
      return { ...updated, guests: cap > 0 ? String(cap) : "" };
    });
  };

  const cityValue = filters.city || "Buscar destinos";
  const whenValue = formatWhenLabel(filters);
  const whoValue = guestsLabel(filters);

  return (
    <div className="search-pill-wrap" ref={wrapRef}>
      <form
        className={`search-pill${active ? " search-pill--open" : ""}`}
        onSubmit={submit}
      >
        <div
          className={`search-segment${active === "where" ? " search-segment--active" : ""}`}
        >
          <button
            type="button"
            className="search-segment-btn"
            onClick={() => toggle("where")}
            aria-expanded={active === "where"}
          >
            <span className="search-segment-label">Onde</span>
            <span
              className={`search-segment-value${filters.city ? " search-segment-value--filled" : ""}`}
            >
              {cityValue}
            </span>
          </button>
        </div>

        <div className="search-segment-divider" aria-hidden />

        <div
          className={`search-segment${active === "when" ? " search-segment--active" : ""}`}
        >
          <button
            type="button"
            className="search-segment-btn"
            onClick={() => toggle("when")}
            aria-expanded={active === "when"}
          >
            <span className="search-segment-label">Quando</span>
            <span
              className={`search-segment-value${
                filters.check_in || filters.flex_duration ? " search-segment-value--filled" : ""
              }`}
            >
              {whenValue}
            </span>
          </button>
        </div>

        <div className="search-segment-divider" aria-hidden />

        <div
          className={`search-segment${active === "who" ? " search-segment--active" : ""}`}
        >
          <button
            type="button"
            className="search-segment-btn"
            onClick={() => toggle("who")}
            aria-expanded={active === "who"}
          >
            <span className="search-segment-label">Quem</span>
            <span
              className={`search-segment-value${hasTravelers ? " search-segment-value--filled" : ""}`}
            >
              {whoValue}
            </span>
          </button>
        </div>

        <button type="submit" className="search-pill-submit" aria-label="Buscar">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13 24a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm10.1-2.2 7 7c.4.4.4 1 0 1.4s-1 .4-1.4 0l-7-7c-1.4 1.1-3.1 1.7-4.9 1.7a7 7 0 1 1 7-7c0 1.8-.6 3.5-1.7 4.9z"
            />
          </svg>
          <span className="search-pill-submit-text">Buscar</span>
        </button>
      </form>

      {active === "where" && (
        <div className="search-popover search-popover--where" role="dialog" aria-label="Destino">
          <input
            ref={cityInputRef}
            id="f-city"
            type="text"
            className="search-popover-input"
            placeholder="Buscar destinos"
            value={filters.city}
            onChange={(e) => set("city")(e.target.value)}
            autoComplete="off"
          />
          <p className="search-popover-heading">Destinos sugeridos</p>
          <ul className="search-suggestions">
            {SUGGESTED_CITIES.filter((c) =>
              !filters.city || c.toLowerCase().includes(filters.city.toLowerCase())
            ).map((city) => (
              <li key={city}>
                <button
                  type="button"
                  className="search-suggestion"
                  onClick={() => {
                    set("city")(city);
                    setActive(null);
                  }}
                >
                  <span className="search-suggestion-icon" aria-hidden>📍</span>
                  <span className="search-suggestion-text">{city}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {active === "when" && (
        <div className="search-popover search-popover--when" role="dialog" aria-label="Datas">
          <SearchWhenPopover filters={filters} onChange={patch} />
        </div>
      )}

      {active === "who" && (
        <div className="search-popover search-popover--who" role="dialog" aria-label="Hóspedes">
          {GUEST_CATEGORIES.map((cat, i) => (
            <div key={cat.key}>
              {i > 0 && <div className="search-guest-divider" />}
              <GuestRow
                label={cat.label}
                hint={cat.hint}
                value={Number(filters[cat.key] || 0)}
                onChange={(n) => updateGuest(cat.key, n)}
                min={cat.key === "adults" && totalTravelers(filters) > 0 ? 1 : 0}
              />
            </div>
          ))}
        </div>
      )}

      <div className="search-pill-footer">
        <button
          type="button"
          className="search-more-filters"
          onClick={() => setAdvancedOpen((o) => !o)}
          aria-expanded={advancedOpen}
        >
          {advancedOpen ? "Ocultar filtros" : "Filtros de preço"}
          {hasPriceFilters && !advancedOpen && <span className="search-filter-dot" />}
        </button>
        {hasFilters && (
          <button type="button" className="search-clear-link" onClick={clear}>
            Limpar
          </button>
        )}
      </div>

      {advancedOpen && (
        <div className="search-advanced">
          <label className="search-advanced-field">
            <span>Preço mín. (R$)</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={filters.min_price}
              onChange={(e) => set("min_price")(e.target.value)}
            />
          </label>
          <label className="search-advanced-field">
            <span>Preço máx. (R$)</span>
            <input
              type="number"
              min="0"
              placeholder="Sem limite"
              value={filters.max_price}
              onChange={(e) => set("max_price")(e.target.value)}
            />
          </label>
        </div>
      )}
    </div>
  );
}
