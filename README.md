# 🏠 CommitStay — MVP de Aluguel de Imóveis

Plataforma estilo Airbnb da **Commit**: anfitriões anunciam imóveis e hóspedes pesquisam, filtram, visualizam no mapa e solicitam reservas, que o anfitrião aprova ou recusa.

| Camada | Stack |
|--------|-------|
| Backend | Django 5 + Django REST Framework + SimpleJWT + drf-spectacular (Swagger) |
| Frontend | React 18 (Vite) + HTML/CSS puro + React Router + Leaflet (mapa) |
| Banco | SQLite (dev) |

## 📁 Estrutura

```
├── docs/        # SDD — especificação, plano técnico, modelo de dados, contrato da API e tarefas
├── backend/     # API Django REST
└── frontend/    # SPA React
```

## 🚀 Como rodar

### 1. Backend (porta 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed        # dados de demonstração
python manage.py runserver
```

### 2. Frontend (porta 5173)

```bash
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

## 📖 Documentação da API (Swagger)

Com o backend rodando:

- **Swagger UI:** http://localhost:8000/api/docs/
- **Redoc:** http://localhost:8000/api/redoc/
- **Schema OpenAPI 3:** http://localhost:8000/api/schema/

**Como usar a API autenticada no Swagger:**
1. Faça `POST /api/auth/login/` com e-mail e senha → copie o campo `access`.
2. Clique em **Authorize** e informe: `Bearer <access>`.
3. Pronto — todos os endpoints autenticados ficam liberados.

O contrato completo (rotas, parâmetros, exemplos) também está em [`docs/04-api-contract.md`](docs/04-api-contract.md).

## 👤 Contas de demonstração (senha: `senha@123`)

| Papel | E-mail |
|-------|--------|
| Anfitrião | `anfitriao@demo.com` |
| Anfitrião | `anfitriao2@demo.com` |
| Hóspede | `hospede@demo.com` |
| Hóspede | `hospede2@demo.com` |

💳 Cartão de teste para reservas: `4111 1111 1111 1111` · validade `12/27` · CVV `123`.

## ✨ Funcionalidades

- **Visitantes (sem login):** busca com filtros avançados (cidade, intervalo de datas, hóspedes, faixa de preço), listagem ordenada por destaque (nota média) e **mapa interativo** com marcadores de preço.
- **Hóspede:** calendário com dias já reservados, seleção de intervalo, pedido de reserva com dados de pagamento (simulado — só os 4 últimos dígitos são salvos), painel com status (Pendente / Aprovada / Recusada), cancelamento e avaliação pós-estadia.
- **Anfitrião:** CRUD dos próprios imóveis (fotos, preço, comodidades), painel de pedidos recebidos com **Aprovar / Recusar** (aprovação recusa automaticamente pendentes conflitantes).
- **Segurança:** JWT, permissões por papel e por dono, validações de negócio no backend, throttling e CORS restrito.

## 🧪 Testes

```bash
cd backend
.venv/bin/python manage.py test   # 19 testes: auth, permissões, regras de reserva e filtros
```

## 📚 SDD (Spec-Driven Development)

O desenvolvimento seguiu os documentos da pasta [`docs/`](docs/):

1. [`01-spec.md`](docs/01-spec.md) — requisitos funcionais, atores e regras de negócio
2. [`02-plan.md`](docs/02-plan.md) — arquitetura, stack e decisões técnicas
3. [`03-data-model.md`](docs/03-data-model.md) — modelo de dados (ER + máquina de estados)
4. [`04-api-contract.md`](docs/04-api-contract.md) — contrato REST da API
5. [`05-tasks.md`](docs/05-tasks.md) — quebra de tarefas rastreadas à spec
