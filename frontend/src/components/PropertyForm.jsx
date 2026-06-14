import { useEffect, useState } from "react";
import {
  createProperty,
  getProperty,
  listAmenities,
  updateProperty,
} from "../api/endpoints";

const EMPTY = {
  title: "",
  description: "",
  address: "",
  city: "",
  state: "",
  latitude: "",
  longitude: "",
  price_per_night: "",
  max_guests: 2,
};

export default function PropertyForm({ propertyId, onDone, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [photoUrls, setPhotoUrls] = useState([""]);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!propertyId);

  useEffect(() => {
    listAmenities().then(setAmenities);
    if (propertyId) {
      getProperty(propertyId).then((p) => {
        setForm({
          title: p.title,
          description: p.description,
          address: p.address,
          city: p.city,
          state: p.state,
          latitude: p.latitude,
          longitude: p.longitude,
          price_per_night: p.price_per_night,
          max_guests: p.max_guests,
        });
        setPhotoUrls(p.photos.length ? p.photos.map((ph) => ph.url) : [""]);
        setSelectedAmenities(p.amenities.map((a) => a.id));
        setLoading(false);
      });
    }
  }, [propertyId]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleAmenity = (id) =>
    setSelectedAmenities((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );

  const setPhoto = (i, value) =>
    setPhotoUrls((urls) => urls.map((u, j) => (j === i ? value : u)));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      ...form,
      photo_urls: photoUrls.map((u) => u.trim()).filter(Boolean),
      amenity_ids: selectedAmenities,
    };
    try {
      if (propertyId) await updateProperty(propertyId, payload);
      else await createProperty(payload);
      onDone();
    } catch (err) {
      const data = err.data;
      setError(
        data
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${[].concat(v).join(" ")}`)
              .join(" · ")
          : "Erro ao salvar o imóvel."
      );
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Carregando…</div>;

  return (
    <form className="property-form" onSubmit={submit}>
      <div className="form-field">
        <label>Título</label>
        <input value={form.title} onChange={set("title")} required maxLength={200} />
      </div>
      <div className="form-field">
        <label>Descrição</label>
        <textarea rows={4} value={form.description} onChange={set("description")} required />
      </div>
      <div className="form-field">
        <label>Endereço</label>
        <input value={form.address} onChange={set("address")} required />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Cidade</label>
          <input value={form.city} onChange={set("city")} required />
        </div>
        <div className="form-field">
          <label>Estado (UF)</label>
          <input value={form.state} onChange={set("state")} required maxLength={50} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Latitude</label>
          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={set("latitude")}
            placeholder="-27.595378"
            required
          />
        </div>
        <div className="form-field">
          <label>Longitude</label>
          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={set("longitude")}
            placeholder="-48.548050"
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Preço por diária (R$)</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={form.price_per_night}
            onChange={set("price_per_night")}
            required
          />
        </div>
        <div className="form-field">
          <label>Capacidade máxima de hóspedes</label>
          <input
            type="number"
            min="1"
            value={form.max_guests}
            onChange={set("max_guests")}
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label>Comodidades</label>
        <div className="amenity-checks">
          {amenities.map((a) => (
            <label key={a.id}>
              <input
                type="checkbox"
                checked={selectedAmenities.includes(a.id)}
                onChange={() => toggleAmenity(a.id)}
              />
              {a.icon} {a.name}
            </label>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label>Fotos (URLs)</label>
        <div className="form-stack">
          {photoUrls.map((url, i) => (
            <div key={i} className="photo-url-row">
              <input
                type="url"
                placeholder="https://exemplo.com/foto.jpg"
                value={url}
                onChange={(e) => setPhoto(i, e.target.value)}
              />
              {photoUrls.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setPhotoUrls((urls) => urls.filter((_, j) => j !== i))
                  }
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setPhotoUrls((urls) => [...urls, ""])}
          >
            + Adicionar foto
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Salvando…" : propertyId ? "Salvar alterações" : "Cadastrar imóvel"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
