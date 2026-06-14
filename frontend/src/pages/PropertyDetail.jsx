import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBooking,
  getBookedDates,
  getProperty,
  getReviews,
} from "../api/endpoints";
import BookingWidget from "../components/BookingWidget";
import Calendar from "../components/Calendar";
import PhotoGallery from "../components/PhotoGallery";
import PropertyLocationMap from "../components/PropertyLocationMap";
import { formatPrice } from "../components/PropertyCard";
import ReviewsCarousel from "../components/ReviewsCarousel";
import SaveFavoriteButton from "../components/SaveFavoriteButton";
import { useAuth } from "../context/AuthContext";

const SECTIONS = [
  { id: "fotos", label: "Fotos" },
  { id: "comodidades", label: "Comodidades" },
  { id: "avaliacoes", label: "Avaliações" },
  { id: "localizacao", label: "Localização" },
];

const AMENITIES_PREVIEW = 10;
const DESC_PREVIEW = 300;

function nightsBetween(checkIn, checkOut) {
  return Math.round(
    (new Date(checkOut + "T00:00:00") - new Date(checkIn + "T00:00:00")) / 86400000
  );
}

function hostInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const fmt = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "numeric", month: "short", year: "numeric",
  });
  return `${fmt(checkIn)} – ${fmt(checkOut)}`;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selection, setSelection] = useState({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState(1);
  const [card, setCard] = useState({ card_holder: "", card_number: "", card_expiry: "", card_cvv: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [showDescModal, setShowDescModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [stickyNav, setStickyNav] = useState(false);
  const [activeSection, setActiveSection] = useState("fotos");

  const galleryRef = useRef(null);
  const calendarRef = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([getProperty(id), getBookedDates(id), getReviews(id)])
      .then(([prop, booked, revs]) => {
        setProperty(prop);
        setBookedRanges(booked);
        setReviews(revs);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      if (galleryRef.current) {
        const rect = galleryRef.current.getBoundingClientRect();
        setStickyNav(rect.bottom < 80);
      }

      for (const sec of SECTIONS) {
        const el = sectionRefs.current[sec.id];
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 120 && r.bottom > 120) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loading]);

  const nights = useMemo(
    () => selection.checkIn && selection.checkOut
      ? nightsBetween(selection.checkIn, selection.checkOut) : 0,
    [selection]
  );

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollTo = (sectionId) => {
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <div className="loading">Carregando imóvel…</div>;
  if (notFound) return (
    <div className="container empty-state">
      <p>Imóvel não encontrado.</p>
    </div>
  );

  const total = nights * Number(property.price_per_night);
  const isGuestFavorite = property.avg_rating >= 4.8 && property.review_count >= 5;
  const descLong = property.description.length > DESC_PREVIEW;
  const descPreview = descLong
    ? `${property.description.slice(0, DESC_PREVIEW)}…`
    : property.description;
  const amenitiesPreview = property.amenities.slice(0, AMENITIES_PREVIEW);
  const hasMoreAmenities = property.amenities.length > AMENITIES_PREVIEW;

  const submitBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createBooking({
        property: property.id,
        check_in: selection.checkIn,
        check_out: selection.checkOut,
        guests: Number(guests),
        ...card,
      });
      setSuccess(true);
      setTimeout(() => navigate("/minhas-reservas"), 1800);
    } catch (err) {
      const data = err.data;
      setError(data ? Object.values(data).flat().join(" ") : "Erro ao enviar o pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="detail-page">
      {/* Barra de navegação fixa ao rolar */}
      <nav className={`detail-sticky-nav${stickyNav ? " detail-sticky-nav--visible" : ""}`}>
        <div className="detail-sticky-nav-inner container">
          <div className="detail-sticky-links">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`detail-sticky-link${activeSection === s.id ? " active" : ""}`}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="detail-sticky-book">
            {nights > 0 ? (
              <span className="detail-sticky-price">
                Total: <strong>{formatPrice(total)}</strong>
              </span>
            ) : (
              <span className="detail-sticky-price">
                <strong>{formatPrice(property.price_per_night)}</strong> / noite
              </span>
            )}
            {property.avg_rating > 0 && (
              <span className="detail-sticky-rating">
                ★ {property.avg_rating.toFixed(1)} · {property.review_count} avaliações
              </span>
            )}
            <button
              type="button"
              className="btn btn-reserve btn-sm"
              onClick={() => scrollTo("fotos")}
            >
              Reservar
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Cabeçalho */}
        <div className="detail-header">
          <h1>{property.title}</h1>
          <div className="detail-header-actions">
            <SaveFavoriteButton propertyId={property.id} user={user} />
          </div>
        </div>

        {/* Galeria */}
        <div ref={galleryRef} id="fotos">
          <PhotoGallery photos={property.photos} title={property.title} />
        </div>

        {/* Layout principal */}
        <div className="detail-layout">
          <div className="detail-main">
            {/* Visão geral */}
            <section className="detail-section detail-overview">
              <div className="detail-type-line">
                <h2>Imóvel em {property.city}, {property.state}</h2>
                <p className="detail-specs">
                  Até {property.max_guests} hóspede{property.max_guests > 1 ? "s" : ""}
                  {" · "}{property.address}
                </p>
              </div>

              {isGuestFavorite && (
                <div className="guest-favorite-badge">
                  <div className="guest-favorite-left">
                    <span className="guest-favorite-icon">🏅</span>
                    <div>
                      <strong>Preferido dos hóspedes</strong>
                      <p>Uma das acomodações que fazem mais sucesso com os hóspedes</p>
                    </div>
                  </div>
                  <div className="guest-favorite-right">
                    <span className="guest-favorite-score">{property.avg_rating.toFixed(1)}</span>
                    <StarsFilled n={Math.round(property.avg_rating)} />
                    <span className="guest-favorite-count">{property.review_count} avaliações</span>
                  </div>
                </div>
              )}

              {/* Anfitrião inline */}
              <div className="detail-host-row">
                <div className="detail-host-avatar">{hostInitials(property.host_name)}</div>
                <div>
                  <div className="detail-host-name">Anfitrião: <strong>{property.host_name}</strong></div>
                  {property.review_count >= 10 && (
                    <div className="detail-host-badge">Anfitrião experiente · {property.review_count} avaliações</div>
                  )}
                </div>
              </div>

              {/* Destaques */}
              <div className="detail-features">
                {isGuestFavorite && (
                  <div className="detail-feature">
                    <span className="detail-feature-icon">🏆</span>
                    <div>
                      <strong>Entre as melhores avaliações</strong>
                      <p>Nota média de {property.avg_rating.toFixed(1)} com {property.review_count} avaliações.</p>
                    </div>
                  </div>
                )}
                <div className="detail-feature">
                  <span className="detail-feature-icon">🔑</span>
                  <div>
                    <strong>Experiência de check-in facilitada</strong>
                    <p>Processo de reserva simples e aprovação pelo anfitrião.</p>
                  </div>
                </div>
                <div className="detail-feature">
                  <span className="detail-feature-icon">🏠</span>
                  <div>
                    <strong>Imóvel completo em {property.city}</strong>
                    <p>Espaço privado para até {property.max_guests} hóspede{property.max_guests > 1 ? "s" : ""}.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Descrição */}
            <section className="detail-section">
              <p className="detail-description">{descPreview}</p>
              {descLong && (
                <button
                  type="button"
                  className="btn-show-all"
                  onClick={() => setShowDescModal(true)}
                >
                  Mostrar mais
                </button>
              )}
            </section>

            {/* Comodidades */}
            <section
              className="detail-section"
              id="comodidades"
              ref={(el) => { sectionRefs.current.comodidades = el; }}
            >
              <h2>O que esse lugar oferece</h2>
              {property.amenities.length === 0 ? (
                <p>Nenhuma comodidade informada.</p>
              ) : (
                <>
                  <div className="amenities-grid-airbnb">
                    {amenitiesPreview.map((a) => (
                      <div key={a.id} className="amenity-item-airbnb">
                        <span className="amenity-icon">{a.icon || "✓"}</span>
                        <span>{a.name}</span>
                      </div>
                    ))}
                  </div>
                  {hasMoreAmenities && (
                    <button
                      type="button"
                      className="btn-show-all"
                      onClick={() => setShowAmenitiesModal(true)}
                    >
                      Mostrar todas as {property.amenities.length} comodidades
                    </button>
                  )}
                </>
              )}
            </section>

            {/* Calendário */}
            <section className="detail-section" ref={calendarRef}>
              <h2>
                {nights > 0
                  ? `${nights} noite${nights > 1 ? "s" : ""} em ${property.city}`
                  : `Selecione as datas em ${property.city}`}
              </h2>
              {nights > 0 && (
                <p className="detail-date-range">{formatDateRange(selection.checkIn, selection.checkOut)}</p>
              )}
              <Calendar
                bookedRanges={bookedRanges}
                selection={selection}
                onSelect={setSelection}
                months={2}
              />
            </section>

            {/* Avaliações */}
            <section
              className="detail-section"
              id="avaliacoes"
              ref={(el) => { sectionRefs.current.avaliacoes = el; }}
            >
              <h2>
                {property.review_count > 0
                  ? `★ ${property.avg_rating.toFixed(1)} · ${property.review_count} avaliações`
                  : "Avaliações"}
              </h2>
              <ReviewsCarousel
                reviews={reviews}
                avgRating={property.avg_rating}
                reviewCount={property.review_count}
              />
            </section>

            {/* Localização */}
            <section
              className="detail-section"
              id="localizacao"
              ref={(el) => { sectionRefs.current.localizacao = el; }}
            >
              <h2>Onde você estará</h2>
              <p className="detail-location-sub">{property.city}, {property.state}</p>
              <PropertyLocationMap
                latitude={property.latitude}
                longitude={property.longitude}
                city={property.city}
                state={property.state}
              />
              <p className="detail-address-text">{property.address}</p>
            </section>

            {/* Conheça o anfitrião */}
            <section className="detail-section detail-host-section">
              <h2>Conheça seu anfitrião</h2>
              <div className="host-card-layout">
                <div className="host-profile-card">
                  <div className="host-profile-left">
                    <div className="host-profile-avatar">{hostInitials(property.host_name)}</div>
                    <div className="host-profile-name">{property.host_name}</div>
                    {property.review_count >= 10 && (
                      <div className="host-profile-badge">🏅 Anfitrião experiente</div>
                    )}
                  </div>
                  <div className="host-profile-stats">
                    <div className="host-stat">
                      <strong>{property.review_count}</strong>
                      <span>avaliações</span>
                    </div>
                    <div className="host-stat">
                      <strong>{property.avg_rating ? property.avg_rating.toFixed(2) : "–"} ★</strong>
                      <span>estrelas</span>
                    </div>
                    <div className="host-stat">
                      <strong>{Math.max(1, Math.floor((Date.now() - new Date(property.created_at)) / (365.25 * 86400000)))}</strong>
                      <span>anos hospedando</span>
                    </div>
                  </div>
                </div>
                <div className="host-info-panel">
                  <h3>{property.host_name} é seu anfitrião</h3>
                  <p>
                    Anfitriões da CommitStay se empenham em oferecer estadias
                    incríveis para os hóspedes.
                  </p>
                  <div className="host-info-details">
                    <h4>Informações do anfitrião</h4>
                    <p>Taxa de resposta: 100%</p>
                    <p>Responde em até 24 horas</p>
                  </div>
                  <p className="host-safety">
                    <span>🛡️</span> Para sua segurança, sempre use a CommitStay para
                    pagamentos e comunicação com anfitriões.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar de reserva */}
          <BookingWidget
            property={property}
            selection={selection}
            onSelect={setSelection}
            bookedRanges={bookedRanges}
            guests={guests}
            onGuestsChange={setGuests}
            nights={nights}
            total={total}
            user={user}
            card={card}
            onCardChange={setCard}
            onSubmit={submitBooking}
            submitting={submitting}
            success={success}
            error={error}
            onScrollToCalendar={scrollToCalendar}
          />
        </div>
      </div>

      {/* Modal descrição */}
      {showDescModal && (
        <div className="modal-backdrop" onClick={() => setShowDescModal(false)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowDescModal(false)}
              aria-label="Fechar"
            >
              ✕
            </button>
            <h2>Sobre este espaço</h2>
            <div className="modal-body-text">{property.description}</div>
          </div>
        </div>
      )}

      {/* Modal comodidades */}
      {showAmenitiesModal && (
        <div className="modal-backdrop" onClick={() => setShowAmenitiesModal(false)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowAmenitiesModal(false)}
              aria-label="Fechar"
            >
              ✕
            </button>
            <h2>O que esse lugar oferece</h2>
            <div className="amenities-grid-airbnb amenities-grid-airbnb--modal">
              {property.amenities.map((a) => (
                <div key={a.id} className="amenity-item-airbnb">
                  <span className="amenity-icon">{a.icon || "✓"}</span>
                  <span>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StarsFilled({ n }) {
  return (
    <span className="stars" aria-label={`${n} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= n ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}
