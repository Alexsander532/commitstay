import { useMemo, useState } from "react";
import Calendar from "./Calendar";

const FLEX_CHIPS = [
  { label: "Datas exatas", value: 0 },
  { label: "± 1 dia", value: 1 },
  { label: "± 2 dias", value: 2 },
  { label: "± 3 dias", value: 3 },
  { label: "± 7 dias", value: 7 },
  { label: "± 14 dias", value: 14 },
];

const DURATIONS = [
  { id: "weekend", label: "Um fim de semana", nights: 2 },
  { id: "week", label: "Uma semana", nights: 7 },
  { id: "month", label: "Um mês", nights: 30 },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function computeFlexibleDates(year, month, durationId) {
  const duration = DURATIONS.find((d) => d.id === durationId);
  if (!duration) return { check_in: "", check_out: "" };

  let start;
  if (durationId === "weekend") {
    start = new Date(year, month, 1);
    while (start.getDay() !== 5 && start.getMonth() === month) {
      start.setDate(start.getDate() + 1);
    }
    if (start.getMonth() !== month) {
      start = new Date(year, month, 1);
      while (start.getDay() !== 6 && start.getMonth() === month) {
        start.setDate(start.getDate() + 1);
      }
    }
  } else if (durationId === "week") {
    start = new Date(year, month, 10);
  } else {
    start = new Date(year, month, 1);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + duration.nights);
  return { check_in: toISO(start), check_out: toISO(end) };
}

export function formatWhenLabel(filters) {
  const { check_in, check_out, date_mode, flex_duration, flex_month } = filters;

  if (date_mode === "flexible") {
    if (!flex_duration || !flex_month) return "Qualquer dia";
    const [y, m] = flex_month.split("-").map(Number);
    const monthName = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short" });
    const dur = DURATIONS.find((d) => d.id === flex_duration);
    return `${monthName} · ${dur?.label.toLowerCase() || ""}`;
  }

  if (!check_in && !check_out) return "Insira as datas";
  const fmt = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  };
  if (check_in && check_out) return `${fmt(check_in)} – ${fmt(check_out)}`;
  if (check_in) return fmt(check_in);
  return "Insira as datas";
}

export function resolveSearchDates(filters) {
  let { check_in, check_out, date_mode, flex_days, flex_duration, flex_month } = filters;

  if (date_mode === "flexible" && flex_duration && flex_month) {
    const [y, m] = flex_month.split("-").map(Number);
    ({ check_in, check_out } = computeFlexibleDates(y, m - 1, flex_duration));
  }

  const flex = Number(flex_days || 0);
  if (flex > 0 && check_in && check_out) {
    check_in = addDays(check_in, -flex);
    check_out = addDays(check_out, flex);
  }

  return { ...filters, check_in, check_out };
}

export default function SearchWhenPopover({
  filters,
  onChange,
}) {
  const [monthScroll, setMonthScroll] = useState(0);

  const visibleMonths = useMemo(() => {
    const base = new Date();
    base.setDate(1);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth() + monthScroll + i, 1);
      return {
        key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleDateString("pt-BR", { month: "long" }),
      };
    });
  }, [monthScroll]);

  const onCalendarSelect = ({ checkIn, checkOut }) => {
    onChange({
      check_in: checkIn || "",
      check_out: checkOut || "",
      date_mode: "dates",
    });
  };

  const selectFlexMonth = (year, month) => {
    onChange({
      flex_month: `${year}-${pad(month + 1)}`,
      date_mode: "flexible",
      check_in: "",
      check_out: "",
    });
  };

  return (
    <div className="search-when">
      <div className="search-when-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={filters.date_mode !== "flexible"}
          className={`search-when-toggle-btn${filters.date_mode !== "flexible" ? " active" : ""}`}
          onClick={() => onChange({ date_mode: "dates" })}
        >
          Datas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filters.date_mode === "flexible"}
          className={`search-when-toggle-btn${filters.date_mode === "flexible" ? " active" : ""}`}
          onClick={() => onChange({ date_mode: "flexible", check_in: "", check_out: "" })}
        >
          Flexível
        </button>
      </div>

      {filters.date_mode === "flexible" ? (
        <div className="search-when-flex">
          <p className="search-when-heading">Por quanto tempo você gostaria de ficar?</p>
          <div className="search-when-chips">
            {DURATIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`search-when-chip${filters.flex_duration === d.id ? " active" : ""}`}
                onClick={() => onChange({ flex_duration: d.id, date_mode: "flexible" })}
              >
                {d.label}
              </button>
            ))}
          </div>

          <p className="search-when-heading">Quando você quer ir?</p>
          <div className="search-when-months-wrap">
            <div className="search-when-months">
              {visibleMonths.slice(0, 5).map((m) => {
                const key = `${m.year}-${pad(m.month + 1)}`;
                const selected = filters.flex_month === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`search-when-month-card${selected ? " active" : ""}`}
                    onClick={() => selectFlexMonth(m.year, m.month)}
                  >
                    <span className="search-when-month-icon" aria-hidden>
                      <svg viewBox="0 0 32 32" width="28" height="28">
                        <rect x="4" y="6" width="24" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                        <line x1="4" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="2" />
                        <line x1="10" y1="4" x2="10" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="22" y1="4" x2="22" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="search-when-month-name">{m.label}</span>
                    <span className="search-when-month-year">{m.year}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="search-when-months-next"
              aria-label="Próximos meses"
              onClick={() => setMonthScroll((s) => s + 1)}
            >
              ›
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="search-popover-calendar">
            <Calendar
              months={2}
              hideFooter
              selection={{
                checkIn: filters.check_in || null,
                checkOut: filters.check_out || null,
              }}
              onSelect={onCalendarSelect}
            />
          </div>
          <div className="search-when-flex-chips">
            {FLEX_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                className={`search-when-chip search-when-chip--sm${Number(filters.flex_days || 0) === chip.value ? " active" : ""}`}
                onClick={() => onChange({ flex_days: chip.value, date_mode: "dates" })}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
