import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, getMyBookings, reviewBooking } from "../api/endpoints";
import { formatPrice } from "../components/PropertyCard";
import StatusBadge from "../components/StatusBadge";

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

function ReviewModal({ booking, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await reviewBooking(booking.id, { rating, comment });
      onDone();
    } catch (err) {
      setError(err.data?.detail || "Erro ao enviar avaliação.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Avaliar: {booking.property_title}</h2>
        <form className="form-stack" onSubmit={submit}>
          <div className="form-field">
            <label>Nota</label>
            <div style={{ display: "flex", gap: 4, fontSize: "1.6rem" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  style={{ color: n <= rating ? "#f5a623" : "#ddd" }}
                  aria-label={`${n} estrelas`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="comment">Comentário</label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Como foi a sua estadia?"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              Enviar avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GuestDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [reviewing, setReviewing] = useState(null);

  const load = () => {
    setLoading(true);
    getMyBookings()
      .then((data) => setBookings(data.results ?? data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancelar este pedido de reserva?")) return;
    await cancelBooking(id);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <main className="container dash-page">
      <h1>Minhas reservas</h1>
      <p className="dash-sub">Acompanhe o status dos seus pedidos de reserva.</p>

      <div className="dash-tabs">
        {[
          ["ALL", "Todas"],
          ["PENDING", "Pendentes"],
          ["APPROVED", "Aprovadas"],
          ["REJECTED", "Recusadas"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Carregando…</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <h3>Nenhuma reserva por aqui</h3>
          <p>
            <Link to="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Explore os imóveis
            </Link>{" "}
            e faça o seu primeiro pedido.
          </p>
        </div>
      )}

      <div className="booking-list">
        {filtered.map((b) => (
          <div key={b.id} className="booking-row">
            <div className="info">
              <div className="title">
                <Link to={`/imovel/${b.property}`}>{b.property_title}</Link>
                {" · "}
                <small>{b.property_city}</small>
              </div>
              <div className="dates">
                {formatDate(b.check_in)} → {formatDate(b.check_out)} · {b.guests}{" "}
                hóspede(s) · {formatPrice(b.total_price)}
              </div>
              <div className="dates">
                💳 {b.card_brand} •••• {b.card_last4}
              </div>
            </div>
            <div className="actions">
              <StatusBadge status={b.status} />
              {b.status === "PENDING" && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleCancel(b.id)}
                >
                  Cancelar
                </button>
              )}
              {b.status === "APPROVED" && b.check_out <= today && !b.has_review && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setReviewing(b)}
                >
                  ★ Avaliar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {reviewing && (
        <ReviewModal
          booking={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null);
            load();
          }}
        />
      )}
    </main>
  );
}
