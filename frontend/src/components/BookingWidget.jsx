import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "./PropertyCard";

function toISO(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildBookedSet(bookedRanges) {
  const set = new Set();
  for (const range of bookedRanges) {
    const cur = new Date(range.check_in + "T00:00:00");
    const end = new Date(range.check_out + "T00:00:00");
    while (cur < end) {
      set.add(toISO(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }
  return set;
}

function hasBookedBetween(bookedSet, startISO, endISO) {
  const cur = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  while (cur < end) {
    if (bookedSet.has(toISO(cur))) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}

export default function BookingWidget({
  property,
  selection,
  onSelect,
  bookedRanges = [],
  guests,
  onGuestsChange,
  nights,
  total,
  user,
  card,
  onCardChange,
  onSubmit,
  submitting,
  success,
  error,
  onScrollToCalendar,
}) {
  const canBook = user?.role === "guest";
  const todayISO = toISO(new Date());
  const bookedSet = useMemo(() => buildBookedSet(bookedRanges), [bookedRanges]);

  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef(null);

  const setCardField = (key) => (e) => onCardChange((c) => ({ ...c, [key]: e.target.value }));

  useEffect(() => {
    if (!guestsOpen) return;
    const onClick = (e) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target)) {
        setGuestsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [guestsOpen]);

  const handleCheckIn = (e) => {
    const val = e.target.value;
    if (!val) {
      onSelect({ checkIn: null, checkOut: null });
      return;
    }
    if (bookedSet.has(val) || val < todayISO) return;
    const checkOut = selection.checkOut && selection.checkOut > val ? selection.checkOut : null;
    if (checkOut && hasBookedBetween(bookedSet, val, checkOut)) {
      onSelect({ checkIn: val, checkOut: null });
    } else {
      onSelect({ checkIn: val, checkOut });
    }
  };

  const handleCheckOut = (e) => {
    const val = e.target.value;
    if (!val) {
      onSelect({ ...selection, checkOut: null });
      return;
    }
    if (!selection.checkIn || val <= selection.checkIn) return;
    if (bookedSet.has(val) || val < todayISO) return;
    if (hasBookedBetween(bookedSet, selection.checkIn, val)) return;
    onSelect({ checkIn: selection.checkIn, checkOut: val });
  };

  const minCheckout = selection.checkIn
    ? toISO(new Date(new Date(selection.checkIn + "T00:00:00").getTime() + 86400000))
    : todayISO;

  return (
    <aside className="booking-widget">
      {property.review_count >= 3 && (
        <div className="booking-alert">
          <span className="booking-alert-icon">◆</span>
          <span>Achado! Este espaço costuma estar sempre reservado</span>
        </div>
      )}

      <div className="booking-box">
        <div className="booking-price-header">
          {nights > 0 ? (
            <strong>Total: {formatPrice(total)}</strong>
          ) : (
            <>
              <strong>{formatPrice(property.price_per_night)}</strong>
              <span>/ noite</span>
            </>
          )}
          {property.avg_rating > 0 && (
            <span className="booking-rating">
              <span className="stars">★</span> {property.avg_rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="booking-inputs">
          <div className="booking-dates-row">
            <label className="booking-date-box">
              <span className="booking-date-label">Check-in</span>
              <input
                type="date"
                className="booking-date-input"
                value={selection.checkIn || ""}
                min={todayISO}
                onChange={handleCheckIn}
                onFocus={onScrollToCalendar}
              />
            </label>
            <label className="booking-date-box">
              <span className="booking-date-label">Checkout</span>
              <input
                type="date"
                className="booking-date-input"
                value={selection.checkOut || ""}
                min={minCheckout}
                disabled={!selection.checkIn}
                onChange={handleCheckOut}
                onFocus={onScrollToCalendar}
              />
            </label>
          </div>

          <div className="booking-guests-wrap" ref={guestsRef}>
            <button
              type="button"
              className="booking-guests-trigger"
              onClick={() => setGuestsOpen((o) => !o)}
              aria-expanded={guestsOpen}
            >
              <span className="booking-date-label">Hóspedes</span>
              <span className="booking-guests-value">
                {guests} hóspede{guests > 1 ? "s" : ""}
              </span>
              <span className="booking-guests-chevron" aria-hidden="true">▾</span>
            </button>

            {guestsOpen && (
              <div className="booking-guests-popover">
                <div className="booking-guests-stepper">
                  <div>
                    <strong>Hóspedes</strong>
                    <div className="booking-guests-limit">Máximo {property.max_guests}</div>
                  </div>
                  <div className="stepper-controls">
                    <button
                      type="button"
                      className="stepper-btn"
                      disabled={guests <= 1}
                      onClick={() => onGuestsChange(guests - 1)}
                      aria-label="Menos hóspedes"
                    >
                      −
                    </button>
                    <span className="stepper-value">{guests}</span>
                    <button
                      type="button"
                      className="stepper-btn"
                      disabled={guests >= property.max_guests}
                      onClick={() => onGuestsChange(guests + 1)}
                      aria-label="Mais hóspedes"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="booking-guests-close"
                  onClick={() => setGuestsOpen(false)}
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>

        {nights > 0 && (
          <div className="booking-summary">
            <div className="booking-summary-row">
              <span>{formatPrice(property.price_per_night)} × {nights} noite{nights > 1 ? "s" : ""}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        )}

        {!user && (
          <p className="booking-hint">
            <a href="/login">Entre</a> como hóspede para solicitar uma reserva.
          </p>
        )}
        {user?.role === "host" && (
          <p className="booking-hint">Anfitriões não podem fazer reservas.</p>
        )}

        {canBook && (
          <form className="form-stack" onSubmit={onSubmit}>
            <div className="payment-section-label">
              <span>💳</span> Dados de pagamento
            </div>
            <div className="payment-fields">
              <div className="full">
                <input
                  type="text"
                  placeholder="Nome impresso no cartão"
                  value={card.card_holder}
                  onChange={setCardField("card_holder")}
                  required
                />
              </div>
              <div className="full">
                <input
                  type="text"
                  placeholder="Número do cartão"
                  inputMode="numeric"
                  maxLength={19}
                  value={card.card_number}
                  onChange={setCardField("card_number")}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="MM/AA"
                maxLength={5}
                value={card.card_expiry}
                onChange={setCardField("card_expiry")}
                required
              />
              <input
                type="password"
                placeholder="CVV"
                inputMode="numeric"
                maxLength={4}
                value={card.card_cvv}
                onChange={setCardField("card_cvv")}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && (
              <div className="form-success">
                ✓ Pedido enviado! Redirecionando para suas reservas…
              </div>
            )}

            <button
              type="submit"
              className="btn btn-reserve"
              disabled={!nights || submitting || success}
            >
              {submitting ? "Enviando…"
                : nights ? "Reservar"
                : "Selecione as datas"}
            </button>
            <p className="booking-disclaimer">
              Você ainda não será cobrado — o anfitrião precisa aprovar a reserva.
            </p>
          </form>
        )}

        {!canBook && nights > 0 && !user && (
          <a href="/login" className="btn btn-reserve">Reservar</a>
        )}
      </div>
    </aside>
  );
}
