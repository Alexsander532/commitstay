# Plano Técnico — MVP Aluguel de Imóveis

> Documento de plano (SDD) — define **como** a especificação será implementada.

## 1. Arquitetura

```
┌─────────────────┐         HTTP/JSON          ┌──────────────────────┐
│  Frontend React │  ───────────────────────▶  │  Backend Django REST │
│  (Vite, :5173)  │  ◀───────────────────────  │  (:8000)             │
└─────────────────┘                            └──────────┬───────────┘
        │                                                 │
        ▼                                                 ▼
  Leaflet / OSM                                   SQLite (dev)
```

- **SPA React** consome exclusivamente a API REST.
- **JWT** (access + refresh) no header `Authorization: Bearer`.
- **Swagger UI** servido pelo próprio backend.

## 2. Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Backend | Django 5 + DRF | Exigência da capacitação; produtividade e ecossistema maduro |
| Auth | djangorestframework-simplejwt | Padrão de mercado para JWT em DRF |
| Docs API | drf-spectacular | OpenAPI 3 automático + Swagger UI + Redoc |
| Filtros | django-filter | Filtros declarativos integrados ao DRF |
| CORS | django-cors-headers | Permitir o frontend em dev |
| Frontend | React 18 + Vite | Exigência (React + HTML/CSS); Vite p/ DX |
| Rotas | react-router-dom | SPA com rotas |
| Mapa | react-leaflet + Leaflet | Mapa interativo gratuito (OSM), sem API key |
| Estilo | CSS puro (variáveis CSS) | Exigência de HTML/CSS sem framework |

## 3. Estrutura de pastas

```
MVP_AluguelImoveis_Commit_TraineeSistemas/
├── docs/                 # SDD (este diretório)
├── backend/
│   ├── config/           # settings, urls, wsgi
│   ├── accounts/         # User customizado + auth endpoints
│   ├── properties/       # Property, Photo, Amenity, Review
│   ├── bookings/         # Booking + aprovação/recusa
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/          # cliente HTTP + endpoints
    │   ├── context/      # AuthContext
    │   ├── components/   # SearchBar, PropertyCard, MapView, Calendar...
    │   ├── pages/        # Home, PropertyDetail, Login, Register, dashboards
    │   └── styles/       # CSS global
    └── package.json
```

## 4. Decisões técnicas (ADRs resumidos)

| # | Decisão | Alternativas | Motivo |
|---|---------|--------------|--------|
| 1 | Papel único por conta (`guest`/`host`) escolhido no cadastro | conta híbrida | Simplifica painéis e permissões no MVP; espelha o enunciado |
| 2 | Fotos por URL | upload multipart | Evita storage/medias no MVP; seed fica simples (Unsplash) |
| 3 | Leaflet + OSM | Google Maps | Sem chave de API nem custo |
| 4 | Pagamento simulado (valida formato, salva só `last4` + bandeira) | gateway real | Fora de escopo; segurança: nunca persistir PAN/CVV |
| 5 | Ordenação da home por nota média + nº de avaliações | mais recentes | Critério "mais avaliados/destaque" do enunciado |
| 6 | SQLite | Postgres | Zero configuração p/ avaliação do MVP |
| 7 | Aprovar reserva auto-recusa pendentes conflitantes | exigir ação manual | Evita overbooking e estados inconsistentes |

## 5. Segurança

1. Senhas com hash PBKDF2 (default Django).
2. JWT com expiração curta (60 min) + refresh (1 dia).
3. Permissões: `IsHost` para CRUD de imóvel; `IsOwner` em objeto; hóspede só vê as próprias reservas; anfitrião só vê reservas dos seus imóveis.
4. Validações de negócio no serializer/model (conflito de datas, capacidade, datas passadas).
5. Cartão: número validado (Luhn + comprimento), persistidos apenas últimos 4 dígitos e bandeira.
6. CORS restrito a `localhost:5173`; `DEBUG` e `SECRET_KEY` via variável de ambiente em produção.
7. Throttling de API (anon/user) configurado no DRF.

## 6. Fluxos principais

### Reserva
1. Hóspede abre o imóvel → frontend busca `GET /api/properties/{id}/booked-dates/` e bloqueia dias no calendário.
2. Seleciona intervalo + hóspedes + dados de pagamento → `POST /api/bookings/`.
3. Backend valida (RN01–RN06) → cria reserva `PENDING`.
4. Anfitrião vê em `GET /api/bookings/received/` → `POST /api/bookings/{id}/approve/` ou `/reject/`.
5. Aprovação recusa automaticamente pendentes conflitantes.

### Busca
`GET /api/properties/?city=&check_in=&check_out=&guests=&min_price=&max_price=&ordering=-rating`
— a exclusão por datas é feita com `EXISTS` de reservas aprovadas conflitantes.

## 7. Testes

- Testes automatizados do backend (Django `TestCase`/DRF `APITestCase`) cobrindo: auth, regras de conflito de reserva, permissões por papel e filtros de busca.
- Teste manual da API via Swagger UI / Insomnia.
