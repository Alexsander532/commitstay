# 🏠 CommitStay — MVP de Aluguel de Imóveis

Plataforma estilo Airbnb da **Commit**: anfitriões anunciam imóveis e hóspedes
pesquisam, filtram, visualizam no mapa e solicitam reservas, que o anfitrião
aprova ou recusa.

| Camada | Stack |
|--------|-------|
| Backend | Django 5 · Django REST Framework · SimpleJWT (JWT) · drf-spectacular (Swagger) · django-filter |
| Frontend | React 18 (Vite) · HTML + CSS puro · React Router · Leaflet (mapa) · set-cookie-parser |
| Banco | SQLite (dev) — trocável por Postgres em produção |

---

## 📁 Estrutura

```
MVP_AluguelImoveis_Commit_TraineeSistemas/
├── docs/                 # documentação completa (10 arquivos) — comece pelo 00-overview
├── backend/
│   ├── config/           # settings.py, urls.py globais
│   ├── accounts/         # User customizado + auth JWT
│   ├── properties/       # Imóveis, fotos, comodidades, reviews, favoritos
│   ├── bookings/         # Reservas + aprovação/recusa/auto-recusa
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/          # cliente HTTP (refresh automático) + endpoints
        ├── context/      # AuthContext (usuário logado)
        ├── components/   # SearchBar, Calendar, MapView, BookingWidget...
        ├── pages/        # Home, PropertyDetail, Login, dashboards
        └── styles/       # CSS global (variáveis CSS)
```

---

## 🚀 Como rodar

### 1. Backend (porta 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed        # dados de demonstração (45+ imóveis, 16 cidades)
python manage.py runserver
```

### 2. Frontend (porta 5173)

```bash
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

---

## 👤 Contas de demonstração (senha: `senha@123`)

| Papel | E-mail |
|-------|--------|
| Anfitrião | `anfitriao@demo.com` |
| Anfitrião 2 | `anfitriao2@demo.com` |
| Hóspede | `hospede@demo.com` |
| Hóspede 2 | `hospede2@demo.com` |

💳 **Cartão de teste:** `4111 1111 1111 1111` · validade `12/27` · CVV `123`
(validado pelo algoritmo de Luhn; nunca persistido — só os 4 últimos dígitos são salvos.)

---

## ✨ Funcionalidades

| Quem | O que pode fazer |
|------|------------------|
| **Visitante** (sem login) | Busca com filtros (cidade, datas, hóspedes, preço), listagem por destaque, mapa interativo com marcadores de preço, detalhes do imóvel |
| **Hóspede** | Tudo do visitante + **reserva** (calendário, dados de pagamento), painel de status (Pendente/Aprovada/Recusada), cancelar pendentes, avaliar após estadia, **favoritos** (toggle com coração) |
| **Anfitrião** | Tudo do visitante + CRUD dos próprios imóveis, painel de pedidos recebidos, **aprovar/recusar** (aprovação recusa automaticamente pendentes conflitantes — anti-overbooking) |

### Fluxo principal de reserva

```
Hóspede filtra → abre imóvel → calendário (dias livres) → preenche cartão
    → envia (PENDING) → Anfitrião aprova/recusa → se aprovado:
        recusa automática dos pendentes conflitantes
    → após check-out: hóspede avalia (nota 1–5 + comentário)
```

### Regras de negócio em 30 segundos

| # | Regra | Por quê |
|---|-------|---------|
| RN01 | `check_out > check_in`; nada no passado | respeita a linha do tempo |
| RN02/03 | Conflito de datas: sobreposição só proíbe se houver reserva **aprovada**; pendentes **não** bloqueiam | anfitrião pode escolher entre múltiplos pedidos |
| RN04 | Cada um só mexe no que é seu (dono) | segurança e privacidade |
| RN05 | Não pode reservar o próprio imóvel | evita auto-reserva |
| RN06 | Preço total calculado no backend (`nº diárias × diária`) | frontend não é confiável |
| RN07 | Avaliar só após check-out de reserva aprovada; 1 por reserva | evita notas falsas |

> 📖 **Leia a versão completa em [`docs/09-regras-de-negocio.md`](docs/09-regras-de-negocio.md)**
> com o "por quê" de cada regra e cenários de exemplo.

### Destaque: anti-overbooking automático

Quando o anfitrião **aprova** uma reserva, o sistema sozinho **recusa** todos
os pedidos pendentes que conflitam no mesmo imóvel e período — sem o anfitrião
precisar fazer nada. Garante que nunca haja duas reservas aprovadas no mesmo
lugar ao mesmo tempo.

### Segurança do cartão (mesmo no MVP)

| Dado | Tratamento |
|------|------------|
| Número completo | Validado por Luhn + detecta bandeira. **Nunca salvo.** |
| Últimos 4 dígitos | Persistidos (`card_last4`) para o anfitrião identificar |
| CVV | Validado em formato. **Nunca salvo.** |
| Validade | Validada (não expirada). **Não salva.** |

> 🔐 Princípio de produção aplicado desde o MVP: **nunca persistir dados
> sensíveis de pagamento.**

---

## 🧪 Testes

```bash
cd backend
.venv/bin/python manage.py test   # 19 testes
```

Os 19 testes (`bookings/tests.py`) cobrem auth, permissões, todas as regras de
reserva (RN01–RN07), auto-recusa, cancelamento, filtros de busca e o endpoint
de datas ocupadas.

---

## 📖 Documentação da API (Swagger)

Gerada automaticamente a partir do código — nunca desatualiza.

Com o backend rodando:
- **Swagger UI:** http://localhost:8000/api/docs/
- **Redoc:** http://localhost:8000/api/redoc/
- **Schema OpenAPI 3:** http://localhost:8000/api/schema/

**Como testar autenticado:**
1. Faça `POST /api/auth/login/` com e-mail e senha → copie `access`.
2. Clique em **Authorize** e informe: `Bearer <access>`.

Contrato completo também em [`docs/04-api-contract.md`](docs/04-api-contract.md).

---

## 📚 Documentação do projeto

> 🎤 **Vai apresentar hoje?** Comece por [`docs/00-overview.md`](docs/00-overview.md)
> — roteiro de 15–20 min, checklist e mapa de todos os docs.

### Apresentação (didáticos, júnior-friendly)

| Arquivo | Para quê |
|---------|----------|
| [`00-overview.md`](docs/00-overview.md) | Mapa dos docs + roteiro de apresentação + checklist |
| [`09-regras-de-negocio.md`](docs/09-regras-de-negocio.md) | Regras de negócio em linguagem simples com "por quê" |
| [`10-guia-tecnico-simples.md`](docs/10-guia-tecnico-simples.md) | Código explicado (trechos reais + analogias + glossário) |

### Técnico (SDD — Spec-Driven Development)

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 01 | [`01-spec.md`](docs/01-spec.md) | Requisitos funcionais, atores, regras de negócio |
| 02 | [`02-plan.md`](docs/02-plan.md) | Arquitetura, stack, decisões técnicas (ADRs) |
| 03 | [`03-data-model.md`](docs/03-data-model.md) | Modelo de dados (ER + máquina de estados) |
| 04 | [`04-api-contract.md`](docs/04-api-contract.md) | Contrato REST completo (com favoritos) |
| 05 | [`05-tasks.md`](docs/05-tasks.md) | Quebra de tarefas rastreadas à spec |
| 06 | [`06-audit-report.md`](docs/06-audit-report.md) | Relatório de auditoria |
| 07 | [`07-backend-guide.md`](docs/07-backend-guide.md) | Guia detalhado do backend Django |
| 08 | [`08-frontend-guide.md`](docs/08-frontend-guide.md) | Guia detalhado do frontend React |
