import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <NavLink to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-mark" aria-hidden="true">🏠</span>
          <span className="logo-text">
            <span className="logo-commit">Commit</span>
            <span className="logo-accent">Stay</span>
          </span>
        </NavLink>

        <button
          type="button"
          className={`header-menu-btn${menuOpen ? " open" : ""}`}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        {menuOpen && (
          <div
            className="header-backdrop"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <nav className={`header-nav${menuOpen ? " open" : ""}`}>
          <NavLink to="/" className="nav-link" end>
            Explorar
          </NavLink>
          {user?.role === "guest" && (
            <>
              <NavLink to="/meus-favoritos" className="nav-link">
                Favoritos
              </NavLink>
              <NavLink to="/minhas-reservas" className="nav-link">
                Minhas reservas
              </NavLink>
            </>
          )}
          {user?.role === "host" && (
            <NavLink to="/painel-anfitriao" className="nav-link">
              Painel do anfitrião
            </NavLink>
          )}
          {user ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
              Sair ({user.name.split(" ")[0]})
            </button>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Entrar
              </NavLink>
              <NavLink to="/cadastro" className="btn btn-primary btn-sm nav-cta">
                Cadastrar
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
