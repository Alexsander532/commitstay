# Visão Geral da Documentação — CommitStay

> 📌 **Este arquivo é o mapa da documentação.** Comece aqui.
> Ele diz **qual documento ler para cada objetivo** — especialmente útil
> para se preparar para a apresentação do projeto.

---

## O que é o CommitStay?

Plataforma web de **aluguel de imóveis por temporada** (estilo Airbnb),
desenvolvida como MVP da capacitação **Commit**. Anfitriões anunciam
imóveis; hóspedes pesquisam, filtram, veem no mapa e solicitam reservas,
que o anfitrião aprova ou recusa.

**Stack resumida:** Django 5 + DRF (backend) · React 18 + Vite (frontend) ·
SQLite (banco) · JWT (auth) · Leaflet (mapa) · drf-spectacular (Swagger).

---

## 🗺️ Qual documento ler?

### 🎤 Para apresentar o projeto (HOJE)

| Se você quer... | Leia |
|-----------------|------|
| Um **roteiro** de apresentação e o mapa dos docs | Este arquivo (`00-overview.md`) |
| Explicar **as regras de negócio** de forma simples (não-técnica) | [`09-regras-de-negocio.md`](09-regras-de-negocio.md) |
| Explicar **o código** de forma técnica, porém júnior-friendly | [`10-guia-tecnico-simples.md`](10-guia-tecnico-simples.md) |
| Saber **como rodar** e as contas demo | [`../README.md`](../README.md) |

> 💡 **Roteiro sugerido para a apresentação (≈ 15–20 min):**
> 1. **O problema e a solução** (1 min) — Seção 1 de `09`.
> 2. **Os 3 tipos de usuário** (1 min) — Seção 2 de `09`.
> 3. **Demo ao vivo** (5–7 min) — jornada do hóspede + painel do anfitrião
>    (Seções 3 e 4 de `09`; use as contas demo do `README.md`).
> 4. **A regra anti-overbooking** (2 min) — Seção 7 de `09` (o momento "uau").
> 5. **Segurança do cartão** (1 min) — Seção 8 de `09`.
> 6. **Como o código é organizado** (3–5 min) — Seções 1–6 de `10`.
> 7. **Testes e garantia das regras** (1 min) — Seção 11 de `10`.
> 8. **Q&A** — use o glossário (Seção 13 de `10`).

### 📐 Documentação técnica (SDD — Spec-Driven Development)

Estes documentos são a **fonte da verdade** técnica, usados durante o
desenvolvimento:

| # | Documento | Para quê |
|---|-----------|----------|
| 01 | [`01-spec.md`](01-spec.md) | **Especificação funcional** — requisitos, atores, regras de negócio |
| 02 | [`02-plan.md`](02-plan.md) | **Plano técnico** — arquitetura, stack, decisões (ADRs) |
| 03 | [`03-data-model.md`](03-data-model.md) | **Modelo de dados** — diagrama ER + máquina de estados da reserva |
| 04 | [`04-api-contract.md`](04-api-contract.md) | **Contrato da API** — rotas, parâmetros, exemplos |
| 05 | [`05-tasks.md`](05-tasks.md) | **Tarefas** — quebra de trabalho rastreada à spec |
| 06 | [`06-audit-report.md`](06-audit-report.md) | **Auditoria** — revisão de qualidade/segurança |
| 07 | [`07-backend-guide.md`](07-backend-guide.md) | **Guia do backend** — detalhe profundo do código Django |
| 08 | [`08-frontend-guide.md`](08-frontend-guide.md) | **Guia do frontend** — detalhe profundo do React |

> Para uma **apresentação**, prefira `09` e `10` (mais didáticos). Os
> guias `07` e `08` são mais densos — úteis para aprofundar em perguntas.

### 🩺 Documentação viva da API

Com o backend rodando, a API também é documentada **automaticamente** pelo
Swagger (gerado a partir do código, nunca desatualiza):

- **Swagger UI:** http://localhost:8000/api/docs/
- **Redoc:** http://localhost:8000/api/redoc/
- **Schema OpenAPI 3:** http://localhost:8000/api/schema/

---

## 🧭 Mapa rápido do produto (uma tela por item)

| Quem | Funcionalidade | Onde no código |
|------|----------------|----------------|
| Visitante | Busca + filtros + mapa | `frontend/src/pages/Home.jsx` |
| Visitante | Detalhe do imóvel | `frontend/src/pages/PropertyDetail.jsx` |
| Hóspede | Login / Cadastro | `frontend/src/pages/Login.jsx`, `Register.jsx` |
| Hóspede | Reserva (datas + cartão) | `frontend/src/components/BookingWidget.jsx` |
| Hóspede | Painel de reservas + avaliar | `frontend/src/pages/GuestDashboard.jsx` |
| Hóspede | Favoritos | `frontend/src/pages/FavoritesPage.jsx` |
| Anfitrião | Painel + CRUD de imóveis | `frontend/src/pages/HostDashboard.jsx` |
| Anfitrião | Aprovar / Recusar pedidos | `frontend/src/pages/HostDashboard.jsx` |
| Backend | Imóveis, fotos, reviews, favoritos | `backend/properties/` |
| Backend | Reservas, aprovação, avaliação | `backend/bookings/` |
| Backend | Usuários e login JWT | `backend/accounts/` |

---

## ✅ Checklist pré-apresentação

- [ ] Backend rodando (`python manage.py runserver`) + seed aplicado.
- [ ] Frontend rodando (`npm run dev`).
- [ ] Swagger aberto (`/api/docs/`) para mostrar a doc automática.
- [ ] Contas demo em mãos (anfitrião + hóspede) e cartão de teste.
- [ ] Ler `09-regras-de-negocio.md` (Seções 5, 7 e 8 — os destaques).
- [ ] Ler `10-guia-tecnico-simples.md` (Seções 1–6 — a arquitetura).
- [ ] Ter um cenário de overbooking pronto: 2 hóspedes pedem as mesmas
           datas; aprovar um e mostrar o outro sendo recusado sozinho.

Boa apresentação! 🚀
