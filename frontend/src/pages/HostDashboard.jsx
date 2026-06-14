import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  approveBooking,
  deleteProperty,
  getMyProperties,
  getReceivedBookings,
  rejectBooking,
} from "../api/endpoints";
import { formatPrice } from "../components/PropertyCard";
import PropertyForm from "../components/PropertyForm";
import StatusBadge from "../components/StatusBadge";

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getReceivedBookings(statusFilter === "ALL" ? "" : statusFilter)
      .then((data) => setBookings(data.results ?? data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const act = async (fn, id) => {
    setError(null);
    try {
      await fn(id);
      load();
    } catch (err) {
      setError(err.data?.detail || "Erro ao processar a ação.");
    }
  };

  return (
    <>
      <div className="dash-tabs">
        {[
          ["PENDING", "Pendentes"],
          ["APPROVED", "Aprovadas"],
          ["REJECTED", "Recusadas"],
          ["ALL", "Todas"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={statusFilter === key ? "active" : ""}
            onClick={() => setStatusFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
      {loading && <div className="loading">Carregando…</div>}
      {!loading && bookings.length === 0 && (
        <div className="empty-state">Nenhum pedido de reserva aqui.</div>
      )}

      <div className="booking-list">
        {bookings.map((b) => (
          <div key={b.id} className="booking-row">
            <div className="info">
              <div className="title">
                <Link to={`/imovel/${b.property}`}>{b.property_title}</Link>
              </div>
              <div className="dates">
                👤 {b.guest_name} · {formatDate(b.check_in)} →{" "}
                {formatDate(b.check_out)} · {b.guests} hóspede(s)
              </div>
              <div className="dates">
                💰 {formatPrice(b.total_price)} ({b.nights} noite(s)) · 💳{" "}
                {b.card_brand} •••• {b.card_last4}
              </div>
            </div>
            <div className="actions">
              <StatusBadge status={b.status} />
              {b.status === "PENDING" && (
                <>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => act(approveBooking, b.id)}
                  >
                    ✓ Aprovar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => act(rejectBooking, b.id)}
                  >
                    ✕ Recusar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PropertiesTab() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | id

  const load = () => {
    setLoading(true);
    getMyProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Desativar este imóvel? Ele deixará de aparecer nas buscas.")) return;
    await deleteProperty(id);
    load();
  };

  if (editing !== null) {
    return (
      <>
        <h2 style={{ marginBottom: 16 }}>
          {editing === "new" ? "Novo imóvel" : "Editar imóvel"}
        </h2>
        <PropertyForm
          propertyId={editing === "new" ? null : editing}
          onDone={() => {
            setEditing(null);
            load();
          }}
          onCancel={() => setEditing(null)}
        />
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>
          + Cadastrar imóvel
        </button>
      </div>

      {loading && <div className="loading">Carregando…</div>}
      {!loading && properties.length === 0 && (
        <div className="empty-state">Você ainda não cadastrou nenhum imóvel.</div>
      )}

      <div className="booking-list">
        {properties.map((p) => (
          <div key={p.id} className="booking-row">
            <div className="info" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              {p.cover_photo && (
                <img
                  src={p.cover_photo}
                  alt=""
                  style={{ width: 90, height: 64, objectFit: "cover", borderRadius: 8 }}
                />
              )}
              <div>
                <div className="title">
                  <Link to={`/imovel/${p.id}`}>{p.title}</Link>
                  {!p.is_active && " · (desativado)"}
                </div>
                <div className="dates">
                  {p.city}, {p.state} · {formatPrice(p.price_per_night)}/noite · até{" "}
                  {p.max_guests} hóspedes
                  {p.avg_rating ? ` · ★ ${p.avg_rating.toFixed(1)}` : ""}
                </div>
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(p.id)}>
                ✎ Editar
              </button>
              {p.is_active && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                  Desativar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function HostDashboard() {
  const [tab, setTab] = useState("bookings");

  return (
    <main className="container dash-page">
      <h1>Painel do anfitrião</h1>
      <p className="dash-sub">Gerencie seus imóveis e responda aos pedidos de reserva.</p>

      <div className="dash-tabs" style={{ borderBottom: "1px solid var(--gray-300)", paddingBottom: 16 }}>
        <button
          className={tab === "bookings" ? "active" : ""}
          onClick={() => setTab("bookings")}
        >
          📥 Pedidos de reserva
        </button>
        <button
          className={tab === "properties" ? "active" : ""}
          onClick={() => setTab("properties")}
        >
          🏠 Meus imóveis
        </button>
      </div>

      {tab === "bookings" ? <BookingsTab /> : <PropertiesTab />}
    </main>
  );
}
