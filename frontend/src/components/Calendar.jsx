import { useMemo, useState } from "react";

const DOW = ["D", "S", "T", "Q", "Q", "S", "S"];

function toISO(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function MonthGrid({ year, month, bookedSet, todayISO, selection, onDayClick, readOnly }) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const { checkIn, checkOut } = selection || {};

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar-month">
      <div className="calendar-month-label">{monthLabel}</div>
      <div className="calendar-grid">
        {DOW.map((d, i) => (
          <span key={i} className="dow">{d}</span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const iso = toISO(date);
          const isBooked = bookedSet.has(iso);
          const isPast = iso < todayISO;
          const isSelected = iso === checkIn || iso === checkOut;
          const inRange = checkIn && checkOut && iso > checkIn && iso < checkOut;
          return (
            <button
              key={iso}
              type="button"
              className={`calendar-day${isSelected ? " selected" : ""}${inRange ? " in-range" : ""}`}
              disabled={isBooked || isPast || readOnly}
              onClick={() => onDayClick(iso)}
              title={isBooked ? "Indisponível (reservado)" : iso}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Calendário de seleção de intervalo.
 * bookedRanges: [{check_in, check_out}] — dias [check_in, check_out) ficam indisponíveis.
 * selection: {checkIn, checkOut} (ISO) | onSelect(selection)
 */
export default function Calendar({
  bookedRanges = [],
  selection,
  onSelect,
  readOnly = false,
  months = 1,
}) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const todayISO = toISO(new Date());

  const bookedSet = useMemo(() => {
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
  }, [bookedRanges]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { checkIn, checkOut } = selection || {};

  const hasBookedBetween = (startISO, endISO) => {
    const cur = new Date(startISO + "T00:00:00");
    const end = new Date(endISO + "T00:00:00");
    while (cur < end) {
      if (bookedSet.has(toISO(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  const handleClick = (iso) => {
    if (readOnly) return;
    if (!checkIn || (checkIn && checkOut)) {
      onSelect({ checkIn: iso, checkOut: null });
    } else if (iso > checkIn) {
      if (hasBookedBetween(checkIn, iso)) {
        onSelect({ checkIn: iso, checkOut: null });
      } else {
        onSelect({ checkIn, checkOut: iso });
      }
    } else {
      onSelect({ checkIn: iso, checkOut: null });
    }
  };

  const clearDates = () => onSelect({ checkIn: null, checkOut: null });

  const monthOffsets = Array.from({ length: months }, (_, i) => i);

  return (
    <div className={`calendar${months > 1 ? " calendar--multi" : ""}`}>
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Mês anterior"
        >
          ‹
        </button>
        {months === 1 && (
          <span className="month-label">
            {viewDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>
        )}
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="calendar-months">
        {monthOffsets.map((offset) => {
          const m = month + offset;
          const y = year + Math.floor(m / 12);
          const normMonth = ((m % 12) + 12) % 12;
          return (
            <MonthGrid
              key={`${y}-${normMonth}`}
              year={y}
              month={normMonth}
              bookedSet={bookedSet}
              todayISO={todayISO}
              selection={selection}
              onDayClick={handleClick}
              readOnly={readOnly}
            />
          );
        })}
      </div>

      <div className="calendar-footer">
        <button type="button" className="calendar-clear" onClick={clearDates}>
          Limpar datas
        </button>
      </div>
    </div>
  );
}
