import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { checkFavorite, toggleFavorite } from "../api/endpoints";

export default function CardFavoriteButton({ propertyId, user }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "guest") {
      setSaved(false);
      return;
    }
    checkFavorite(propertyId)
      .then((data) => setSaved(data.is_favorited))
      .catch(() => setSaved(false));
  }, [propertyId, user]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user?.role !== "guest") return;
    if (loading) return;
    setLoading(true);
    try {
      const data = await toggleFavorite(propertyId);
      setSaved(data.is_favorited);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === "host") return null;

  if (!user) {
    return (
      <Link
        to="/login"
        className="pc-save-btn"
        onClick={(e) => e.stopPropagation()}
        title="Entre para salvar"
        aria-label="Entre para salvar"
      >
        <HeartIcon filled={false} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`pc-save-btn${saved ? " pc-save-btn--saved" : ""}`}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={saved}
      aria-label={saved ? "Remover dos favoritos" : "Salvar nos favoritos"}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 28c-.2 0-.4-.1-.5-.2C14.7 27.1 2 17.5 2 9.5 2 5.9 4.9 3 8.5 3c2.1 0 4.1 1 5.3 2.7C15 4 17 3 19.1 3 22.7 3 25.6 5.9 25.6 9.5c0 8-12.7 17.6-13.5 18.3-.1.1-.3.2-.5.2z" />
    </svg>
  );
}
