import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "guest",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      const user = await login(form.email, form.password);
      navigate(user.role === "host" ? "/painel-anfitriao" : "/");
    } catch (err) {
      const data = err.data;
      setError(
        data ? Object.values(data).flat().join(" ") : "Erro ao criar a conta."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <h1>Criar conta</h1>
      <form className="form-stack" onSubmit={submit}>
        <div className="role-picker">
          <div
            className={`role-option${form.role === "guest" ? " selected" : ""}`}
            onClick={() => setForm((f) => ({ ...f, role: "guest" }))}
          >
            <div className="role-title">🧳 Hóspede</div>
            <div className="role-desc">Quero reservar imóveis</div>
          </div>
          <div
            className={`role-option${form.role === "host" ? " selected" : ""}`}
            onClick={() => setForm((f) => ({ ...f, role: "host" }))}
          >
            <div className="role-title">🏠 Anfitrião</div>
            <div className="role-desc">Quero anunciar imóveis</div>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="name">Nome completo</label>
          <input id="name" type="text" value={form.name} onChange={set("name")} required />
        </div>
        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={form.email} onChange={set("email")} required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={set("password")}
            minLength={8}
            required
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Criando conta…" : "Cadastrar"}
        </button>
      </form>
      <p className="auth-alt">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </main>
  );
}
