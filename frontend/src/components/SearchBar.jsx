import { useState } from "react";

export default function SearchBar({ initial = {}, onSearch }) {
  const [filters, setFilters] = useState({
    city: "",
    check_in: "",
    check_out: "",
    guests: "",
    min_price: "",
    max_price: "",
    ...initial,
  });

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clear = () => {
    const empty = {
      city: "", check_in: "", check_out: "", guests: "", min_price: "", max_price: "",
    };
    setFilters(empty);
    onSearch(empty);
  };

  return (
    <form className="search-bar" onSubmit={submit}>
      <div className="search-field">
        <label htmlFor="f-city">Cidade</label>
        <input
          id="f-city"
          type="text"
          placeholder="Para onde você vai?"
          value={filters.city}
          onChange={set("city")}
        />
      </div>
      <div className="search-field">
        <label htmlFor="f-checkin">Check-in</label>
        <input id="f-checkin" type="date" value={filters.check_in} onChange={set("check_in")} />
      </div>
      <div className="search-field">
        <label htmlFor="f-checkout">Check-out</label>
        <input
          id="f-checkout"
          type="date"
          min={filters.check_in || undefined}
          value={filters.check_out}
          onChange={set("check_out")}
        />
      </div>
      <div className="search-field search-field--guests">
        <label htmlFor="f-guests">Hóspedes</label>
        <input
          id="f-guests"
          type="number"
          min="1"
          placeholder="Qtd."
          value={filters.guests}
          onChange={set("guests")}
        />
      </div>
      <div className="search-field search-field--price">
        <label>Preço por diária (R$)</label>
        <div className="price-range">
          <input
            type="number"
            min="0"
            placeholder="Mín."
            value={filters.min_price}
            onChange={set("min_price")}
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            placeholder="Máx."
            value={filters.max_price}
            onChange={set("max_price")}
          />
        </div>
      </div>
      <div className="search-actions">
        <button type="submit" className="btn btn-primary">
          🔍 Buscar
        </button>
        <button type="button" className="btn btn-ghost" onClick={clear}>
          Limpar
        </button>
      </div>
    </form>
  );
}
