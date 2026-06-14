import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import { useAuth } from "./context/AuthContext";
import GuestDashboard from "./pages/GuestDashboard";
import FavoritesPage from "./pages/FavoritesPage";
import Home from "./pages/Home";
import HostDashboard from "./pages/HostDashboard";
import Login from "./pages/Login";
import PropertyDetail from "./pages/PropertyDetail";
import Register from "./pages/Register";

function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/imovel/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route
          path="/meus-favoritos"
          element={
            <RequireRole role="guest">
              <FavoritesPage />
            </RequireRole>
          }
        />
        <Route
          path="/minhas-reservas"
          element={
            <RequireRole role="guest">
              <GuestDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/painel-anfitriao"
          element={
            <RequireRole role="host">
              <HostDashboard />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
