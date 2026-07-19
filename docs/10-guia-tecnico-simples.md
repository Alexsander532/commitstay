# Guia Técnico Simples — Como o Código Funciona

> 📌 **Para quê serve este documento?**
> Explica o código do CommitStay de forma que um **dev júnior** entenda —
> e que você consiga **apresentar a parte técnica** sem se perder em
> detalhes. Cada seção responde a uma pergunta que alguém pode te fazer:
> *"como faz login?", "como sabe que duas reservas conflitam?", "como o
> mapa aparece?"*.
>
> Convenção: 🧩 = conceito importante · 🔍 = trecho real do código ·
> 🗣️ = como explicar em uma frase.

---

## 1. Visão geral da arquitetura (em 30 segundos)

```
┌──────────────────┐     HTTP + JSON (JWT)     ┌──────────────────────┐
│   Frontend       │  ───────────────────────▶ │   Backend            │
│   React + Vite   │  ◀─────────────────────── │   Django REST        │
│   porta 5173     │                           │   porta 8000         │
└──────────────────┘                           └──────────┬───────────┘
                                                          │
                                                          ▼
                                                    SQLite (arquivo)
```

- **Backend** = um servidor Django que expõe uma **API REST** (uma "lista
  de URLs" que devolvem/esperam JSON).
- **Frontend** = um site React (SPA — uma única página) que **só conversa
  com a API**. Não acessa o banco diretamente.
- **Banco** = SQLite, um banco guardado num **arquivo** (`db.sqlite3`).
  Zero configuração — ideal para MVP.
- **Autenticação** = **JWT**: ao logar, o backend devolve um "crachá"
  (token) que o frontend mostra em toda requisição.

🗣️ *Na apresentação:* "É um frontend e um backend separados, conversando
por JSON. O frontend nunca toca no banco; ele pede tudo pro backend."

---

## 2. A estrutura de pastas (mapa mental)

```
MVP_AluguelImoveis_Commit_TraineeSistemas/
├── docs/               # esta documentação
├── backend/            # servidor Django (Python)
│   ├── config/         #   ajustes do projeto (settings, urls globais)
│   ├── accounts/       #   APP: usuários + login (JWT)
│   ├── properties/     #   APP: imóveis, fotos, comodidades, reviews, favoritos
│   ├── bookings/       #   APP: reservas + aprovação/recusa
│   └── manage.py       #   "comando" do Django (rodar, migrar, testes)
└── frontend/           # site React (JavaScript)
    └── src/
        ├── api/        #   cliente HTTP + lista de endpoints
        ├── context/    #   AuthContext (quem está logado)
        ├── components/ #   peças reutilizáveis (Card, Mapa, Calendário...)
        ├── pages/      #   telas (Home, Detalhe, Login, Dashboards)
        └── styles/     #   CSS global
```

🧩 **Conceito "App" do Django:** o projeto é dividido em **3 apps**
("pedaços" independentes): `accounts`, `properties`, `bookings`. Cada um
cuida do seu domínio. Isso é o padrão do Django — ajuda a organizar.

---

## 3. Backend — os 4 arquivos que você precisa conhecer

Em cada app Django, a "magia" acontece em 4 arquivos:

| Arquivo | O que faz | Analogia |
|---------|-----------|----------|
| `models.py` | Define as **tabelas** do banco (classes Python) | A **planta** da casa |
| `serializers.py` | Converte objetos Python ↔ JSON e **valida** dados | O **tradutor** + **porteiro** |
| `views.py` | Recebe a requisição HTTP e decide o que fazer | O **garçom** que atende a mesa |
| `urls.py` | Liga uma URL a uma view (roteamento) | O **cardápio** de rotas |
| `permissions.py` | Decide **quem** pode fazer **o quê** | O **segurança** da porta |

Vamos passar por cada app com esse molde.

---

## 4. App `accounts` — Usuário e Login

### 🧩 O modelo: `User` (`accounts/models.py`)
O Django já traz um usuário pronto, mas o projeto usa um **customizado**
porque o login é por **e-mail** (não por username).

```python
class User(AbstractUser):
    username = None              # não usamos username
    name = models.CharField(...)  # nome da pessoa
    email = models.EmailField(unique=True)  # e-mail único
    role = models.CharField(choices=Role.choices)  # guest | host

    USERNAME_FIELD = "email"     # ← login por e-mail
```

`role` é o **papel**: `guest` (hóspede) ou `host` (anfitrião). Tem um
atalho bonito: `user.is_host` retorna `True`/`False`.

### 🧩 Login com JWT (`accounts/serializers.py` + `views.py`)
Quando o usuário faz login, o SimpleJWT devolve **dois tokens**:

- **access** — dura 60 min. É o "crachá" usado em cada pedido.
- **refresh** — dura 1 dia. Serve para **pegar um access novo** quando o
  access expira, sem o usuário precisar logar de novo.

```python
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)            # gera access + refresh
        data["user"] = UserSerializer(self.user).data  # + dados do usuário
        return data
```

🗣️ *"O login devolve um token de 60 min e outro de 1 dia. O de 1 dia serve
para renovar o de 60 min automaticamente, sem ficar pedindo senha."*

### 🗺️ Rotas (`accounts/urls.py`)
```
POST /api/auth/register/   → criar conta (hóspede ou anfitrião)
POST /api/auth/login/      → login → {access, refresh, user}
POST /api/auth/refresh/    → renovar access
GET  /api/auth/me/         → "quem sou eu?" (precisa do token)
```

---

## 5. App `properties` — Imóveis, Fotos, Comodidades, Reviews, Favoritos

### 🧩 Modelos (`properties/models.py`)
Cinco tabelas:

```
User ──< Property ──< Photo
            │  │
            │  └──< Review
            │
            └──<> Amenity      (muitos-para-muitos)
            └──< Favorite
```

- **Property**: o imóvel. Tem `host` (dono), preço, capacidade, lat/lng...
- **Photo**: fotos do imóvel (por **URL**, não upload). Tem `order` para
  escolher a ordem.
- **Amenity**: catálogo de comodidades (Wi-Fi, piscina...). Relação
  **muitos-para-muitos** com Property (um imóvel tem várias; uma
  comodidade aparece em vários imóveis).
- **Review**: avaliação. Ligada a uma reserva (`OneToOne` — uma por
  reserva) e ao imóvel. Nota 1–5.
- **Favorite**: imóvel salvo por um hóspede. Par **único**
  (`unique_together = [("user", "property")]`) — não dá pra favoritar 2x.

### 🧩 A view que faz a listagem com filtros (`properties/views.py`)
```python
class PropertyViewSet(viewsets.ModelViewSet):
    filterset_class = PropertyFilter       # filtros declarativos
    ordering = ["-avg_rating", "-review_count", "-created_at"]  # destaque

    def get_queryset(self):
        qs = (Property.objects
              .select_related("host")           # otimiza JOIN do dono
              .prefetch_related("photos", "amenities")
              .annotate(                         # calcula nota média
                  avg_rating=Avg("reviews__rating"),
                  review_count=Count("reviews"),
              ))
        if self.action == "list":
            qs = qs.filter(is_active=True)       # listagem só ativos
        return qs
```

🔍 **Detalhes importantes para explicar:**

- `annotate` → calcula `avg_rating` (nota média) e `review_count` **no
  banco**, com uma única query. Isso alimenta a ordenação por destaque.
- `select_related` / `prefetch_related` → evita o problema "N+1 queries"
  (um SELECT por imóvel pra buscar as fotos). Junta tudo em poucas queries.
- `ModelViewSet` → já cria **todas** as rotas REST
  (list/create/retrieve/update/destroy) de uma vez.

### 🧩 Os filtros de busca (`properties/filters.py`)
```python
class PropertyFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(lookup_expr="icontains")  # parcial
    guests = django_filters.NumberFilter(field_name="max_guests", lookup_expr="gte")
    min_price = django_filters.NumberFilter(field_name="price_per_night", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price_per_night", lookup_expr="lte")

    def filter_dates(self, queryset, name, value):
        # Exclui imóveis com reserva APROVADA conflitante
        conflicting = Booking.objects.filter(
            status=Booking.Status.APPROVED,
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).values_list("property_id", flat=True)
        return queryset.exclude(id__in=conflicting)
```

🗣️ *"O filtro de datas não procura imóveis 'disponíveis'; ele **tira** os
que teriam conflito com uma reserva já aprovada. Mais simples e correto."*

### 🧩 Permissões (`properties/permissions.py`)
Duas classes pequenas e poderosas:

```python
class IsHostOrReadOnly:    # escrita só para anfitriões
class IsOwnerOrReadOnly:   # escrita só para o DONO do imóvel
```

A primeira bloqueia **no nível da rota** (só host pode criar). A segunda
bloqueia **no nível do objeto** (o anfitrião A não edita o imóvel do B).
Juntas = RN04.

### 🧩 Serializer de imóvel com fotos por URL (`properties/serializers.py`)
```python
photo_urls = serializers.ListField(child=serializers.URLField(), write_only=True)
amenity_ids = serializers.PrimaryKeyRelatedField(many=True, source="amenities")

def create(self, validated_data):
    photo_urls = validated_data.pop("photo_urls", [])
    amenities = validated_data.pop("amenities", [])
    prop = Property.objects.create(host=self.context["request"].user, **validated_data)
    prop.amenities.set(amenities)
    self._save_photos(prop, photo_urls)   # cria as fotos com ordem
    return prop
```

🗣️ *"O frontend manda uma **lista de URLs de fotos**; o backend cria os
registros de foto já na ordem certa. Em vez de upload de arquivo, usamos
URL — mais simples para o MVP."*

### 🗺️ Rotas extras (actions customizadas)
```
GET  /api/properties/                 → listar (com filtros)
POST /api/properties/                 → criar (host)
GET  /api/properties/{id}/            → detalhe
PATCH/DELETE /api/properties/{id}/    → editar/desativar (dono)
GET  /api/properties/{id}/booked-dates/ → datas ocupadas (p/ calendário)
GET  /api/properties/{id}/reviews/    → avaliações
GET  /api/properties/mine/            → meus imóveis (host)
GET  /api/amenities/                  → catálogo de comodidades
POST /api/favorites/toggle/           → salvar/remover favorito
GET  /api/favorites/check/{id}/       → "está favoritado?"
GET  /api/favorites/                  → meus favoritos (como imóveis)
```

---

## 6. App `bookings` — Reservas (a parte com mais regras)

### 🧩 O modelo `Booking` (`bookings/models.py`)
```python
class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING, APPROVED, REJECTED, CANCELLED  # estados possíveis

    property, guest      # FKs
    check_in, check_out  # datas
    guests, total_price  # total calculado no backend
    status               # começa PENDING
    card_holder, card_last4, card_brand   # só o que é seguro guardar

    def conflicts_with_approved(self):   # RN02/RN03
        return Booking.objects.filter(
            property_id=self.property_id,
            status=self.Status.APPROVED,
            check_in__lt=self.check_out,
            check_out__gt=self.check_in,
        ).exclude(pk=self.pk).exists()
```

🧩 **`@builtins.property def nights`** → um campo "calculado"
(`check_out - check_in`). O `builtins.property` evita conflito de nome com
o campo `property` (a FK do imóvel).

### 🧩 Onde as regras de negócio moram: o serializer (`bookings/serializers.py`)
Aqui estão RN01–RN06. O método `validate()` roda **antes** de salvar:

```python
def validate(self, attrs):
    if check_in >= check_out:        ... # RN01: saída > entrada
    if check_in < date.today():      ... # RN01: nada no passado
    if not prop.is_active:           ... # imóvel disponível
    if prop.host_id == request.user.id: ... # RN05: não reserva o próprio
    if attrs["guests"] > prop.max_guests: ... # capacidade
    # RN02/RN03: conflito com APROVADA
    if Booking.objects.filter(property=prop, status=APPROVED,
        check_in__lt=check_out, check_out__gt=check_in).exists():
        raise ...
```

E o `create()` calcula o preço (RN06) e guarda só os 4 últimos dígitos:

```python
def create(self, validated_data):
    card_number = validated_data.pop("card_number")     # não será salvo
    validated_data.pop("card_expiry"); validated_data.pop("card_cvv")
    nights = (check_out - check_in).days
    return Booking.objects.create(
        total_price=nights * prop.price_per_night,      # RN06: backend calcula
        card_last4=card_number[-4:],                    # só 4 dígitos
        card_brand=detect_brand(card_number),
        ...
    )
```

🧩 **Validação de cartão (Luhn):**
```python
def luhn_valid(number):
    # algoritmo que valida número de cartão (mesmo dos bancos)
```
Valida formato + bandeira, mas **descarta** o número após guardar `last4`.

🗣️ *"As regras de negócio ficam no **serializer**, que é o porteiro do
DRF. Antes de salvar, ele checa datas, conflito, capacidade, cartão. Se
algo errar, devolve 400 com a mensagem certa — sem nunca tocar o banco."*

### 🧩 Aprovação + auto-recusa (`bookings/views.py`) — RF05.3
```python
def approve(self, request, pk=None):
    booking = self._get_host_booking(request, pk)   # só do meu imóvel
    if booking.status != PENDING: ...                 # só pendente
    if booking.conflicts_with_approved(): ...         # checa conflito
    booking.status = APPROVED
    booking.save(update_fields=["status"])
    # AUTO-RECUSA dos pendentes conflitantes:
    Booking.objects.filter(
        property=booking.property, status=PENDING,
        check_in__lt=booking.check_out, check_out__gt=booking.check_in,
    ).update(status=REJECTED)
```

🗣️ *"Quando o anfitrião aprova, o sistema sozinho recusa todos os outros
pedidos pendentes no mesmo período. É uma query de `update` só — rápido e
consistente."*

### 🧩 Avaliação (`bookings/views.py`) — RN07
```python
def review(self, request, pk=None):
    if booking.status != APPROVED: ...                 # precisa estar aprovada
    if booking.check_out > date.today(): ...           # e a estadia acabou
    if Review.objects.filter(booking=booking).exists(): ...  # uma por reserva
    serializer.save(booking=booking, property=booking.property, author=request.user)
```

### 🗺️ Rotas de reserva
```
POST /api/bookings/                 → solicitar (hóspede + cartão)
GET  /api/bookings/                 → minhas reservas
GET  /api/bookings/received/        → pedidos nos meus imóveis (host)
POST /api/bookings/{id}/approve/    → aprovar (host dono)
POST /api/bookings/{id}/reject/     → recusar (host dono)
POST /api/bookings/{id}/cancel/     → cancelar pendente (hóspede)
POST /api/bookings/{id}/review/     → avaliar (hóspede, pós-estadia)
```

---

## 7. Configuração (`config/settings.py`) — o que vale destacar

- **`REST_FRAMEWORK`**: define JWT como autenticação, paginação (12 por
  página), filtros, ordenação, **throttling** (limite: anônimo 100/min,
  logado 300/min) e o schema do Swagger.
- **`SIMPLE_JWT`**: access 60 min, refresh 1 dia, header `Bearer`.
- **`CORS_ALLOWED_ORIGINS`**: só `localhost:5173` pode chamar a API.
  Em produção, troca pela URL do frontend real.
- **`AUTH_USER_MODEL = "accounts.User"`**: avisa o Django que o usuário é
  o customizado.
- **`DATABASES`**: SQLite. Trocar por Postgres em produção é mudar 1 bloco.

🗣️ *"Tudo que é padrão do projeto — limite de requisições, paginação,
JWT, CORS — fica centralizado num único arquivo, o `settings.py`."*

---

## 8. Documentação automática da API (Swagger)

O `drf-spectacular` **lê as views** e gera uma especificação OpenAPI 3.
Nada é escrito à mão — é tudo a partir do código.

As "decorações" `@extend_schema` nas views adicionam **títulos, tags e
descrições** bonitas no Swagger:

```python
@extend_schema(tags=["Reservas"], summary="Aprovar reserva (anfitrião dono)")
```

URLs (com o backend rodando):
- Swagger UI: `http://localhost:8000/api/docs/`
- Redoc: `http://localhost:8000/api/redoc/`
- Schema: `http://localhost:8000/api/schema/`

🗣️ *"A documentação da API sai do próprio código. Mudou a view, mudou o
Swagger — nunca desatualiza."*

---

## 9. Frontend — como o React está organizado

### 🧩 Ponto de entrada e rotas (`App.jsx`)
```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/imovel/:id" element={<PropertyDetail />} />
  <Route path="/login" element={<Login />} />
  <Route path="/minhas-reservas" element={<RequireRole role="guest">...} />
  <Route path="/painel-anfitriao" element={<RequireRole role="host">...} />
</Routes>
```

`RequireRole` é um **guarda de rota**: se o usuário não está logado ou não
tem o papel certo, **redireciona**. Assim o painel do anfitrião nunca abre
para um hóspede.

### 🧩 Cliente HTTP com cache + refresh automático (`api/client.js`)
É o arquivo mais "esperto" do frontend. Faz 4 coisas:

1. **Monta a requisição** com o header `Authorization: Bearer <token>`.
2. **Se receber 401** (token expirou), **renova sozinho** usando o
   `refresh` e **repete** a requisição. O usuário nem percebe.
3. **Deduplica** requisições idênticas simultâneas (cache de 30s): se 3
   componentes pedem a mesma lista, vai só 1 request pra API.
4. Lança `ApiError` com o status e o corpo do erro, para as telas
   mostrarem a mensagem certa.

```javascript
if (resp.status === 401 && auth && getTokens()?.refresh) {
    token = await refreshAccess();   // pega access novo
    if (token) resp = await doFetch(token);  // refaz
}
```

🗣️ *"O cliente HTTP cuida da renovação do token sozinho. Quando o access
expira, ele usa o refresh pra pegar um novo e refaz o pedido — tudo
automático."*

### 🧩 AuthContext (`context/AuthContext.jsx`)
Guarda **quem está logado** (`user`) e fornece `login()`/`logout()` para
toda a app. No início, se há tokens no `localStorage`, pergunta `/auth/me/`
pra saber se ainda são válidos.

### 🧩 As telas principais
| Tela | Arquivo | O que faz |
|------|---------|-----------|
| Home | `pages/Home.jsx` | Busca com filtros, toggle lista/mapa, carrosséis por cidade, "Preferidos dos hóspedes" |
| Detalhe | `pages/PropertyDetail.jsx` | Galeria, comodidades, calendário, widget de reserva, avaliações, mapa, perfil do anfitrião |
| Login/Cadastro | `pages/Login.jsx`, `Register.jsx` | Autenticação com escolha de papel |
| Painel hóspede | `pages/GuestDashboard.jsx` | Lista reservas por status + cancelar + avaliar |
| Painel anfitrião | `pages/HostDashboard.jsx` | CRUD de imóveis + aprovar/recusar pedidos |
| Favoritos | `pages/FavoritesPage.jsx` | Imóveis salvos pelo hóspede |

### 🧩 Componentes de destaque
- **`Calendar.jsx`** — mostra 2 meses, bloqueia dias já reservados e deixa
  selecionar um intervalo (check-in → check-out).
- **`MapView.jsx`** — mapa Leaflet com **marcadores de preço** e popup com
  link pro detalhe. Sem chave de API (usa OpenStreetMap).
- **`SearchBar.jsx` + `SearchWhenPopover.jsx`** — filtros avançados,
  incluindo modo "datas flexíveis" (ex.: "1 semana em julho").
- **`BookingWidget.jsx`** — a sidebar fixa de reserva: datas, hóspedes,
  cartão, total. Envia o `POST /bookings/`.

---

## 10. Fluxo completo de uma reserva (ponta a ponta)

O roteiro ideal para apresentar **ao vivo**:

1. Hóspede abre o imóvel → `PropertyDetail` chama 3 endpoints em paralelo:
   `getProperty(id)`, `getBookedDates(id)`, `getReviews(id)`.
2. O `Calendar` **bloqueia** os dias vindos de `booked-dates`.
3. Hóspede seleciona datas → o widget calcula `nights × preço` **só para
   mostrar** (o valor real é confirmado pelo backend).
4. Preenche o cartão → `createBooking(...)` faz `POST /api/bookings/`.
5. Backend valida **tudo** (RN01–RN06, Luhn) → cria `PENDING`.
6. Frontend redireciona pro **painel do hóspede** (`/minhas-reservas`).
7. (Muda de conta) Anfitrião vê o pedido em `/painel-anfitriao` → clica
   **Aprovar** → `POST /bookings/{id}/approve/`.
8. Backend aprova + **auto-recusa** dos pendentes conflitantes.
9. Depois da data do check-out, o hóspede pode **avaliar**.

---

## 11. Testes automatizados (garantia das regras)

```bash
cd backend && .venv/bin/python manage.py test   # 19 testes
```

Os 19 testes (`bookings/tests.py`) cobrem exatamente as regras de negócio:

- **Auth:** cadastro, login, e-mail duplicado.
- **Permissões:** anônimo lista/filtra; hóspede não cria imóvel; anfitrião
  não edita imóvel alheio; anfitrião não reserva.
- **Regras de reserva:** total calculado, cartão inválido, data passada,
  check-out antes do check-in, acima da capacidade, conflito com aprovada,
  **aprovação auto-recusa conflitantes**, só o dono aprova, hóspede
  cancela pendente.
- **Busca:** filtro de preço, hóspedes, datas excluindo reservados,
  endpoint `booked-dates`.

🗣️ *"Cada regra de negócio tem um teste. Se alguém quebrar a regra de
conflito de datas, o teste vermelho avisa na hora."*

---

## 12. Como rodar (cola rápida para a演示)

```bash
# Terminal 1 — backend
cd backend
source .venv/bin/activate
python manage.py migrate
python manage.py seed          # dados de demonstração
python manage.py runserver     # :8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev                    # :5173
```

Contas demo (senha `senha@123`):
- Anfitrião: `anfitriao@demo.com` · `anfitriao2@demo.com`
- Hóspede: `hospede@demo.com` · `hospede2@demo.com`
- Cartão de teste: `4111 1111 1111 1111` · `12/27` · `123`

Swagger: `http://localhost:8000/api/docs/`

---

## 13. Glossário rápido (para o júnior não travar)

| Termo | Explicação simples |
|-------|--------------------|
| **API REST** | Um servidor que responde em JSON por URLs padrão (GET/POST/...) |
| **JWT** | Um "crachá" criptografado que prova quem você é, enviado no header |
| **Serializer** | Tradutor objeto ↔ JSON + validador de dados no DRF |
| **ViewSet** | Uma view que já cria várias rotas (list, create, update...) |
| **ORM** | Escrever queries SQL usando classes/objetos Python (o `models.py`) |
| **`annotate`** | Adicionar um campo calculado (ex.: média) direto na query SQL |
| **`select_related`/`prefetch_related`** | Otimização para não fazer N queries (evita "N+1") |
| **Soft delete** | Em vez de apagar o registro, marcar `is_active=False` |
| **SPA** | Single Page Application — o React recarrega só partes da página |
| **Throttling** | Limite de quantas requisições por minuto cada usuário pode fazer |
| **CORS** | Política que diz quais sites podem chamar sua API |
| **Luhn** | Algoritmo que valida número de cartão de crédito |

> 🎯 **Dica final:** se travar numa pergunta técnica, lembre que **as regras
> de negócio moram no serializer/backend** (`09-regras-de-negocio.md`) e o
> **frontend é só a interface** que chama a API. Essa separação é a base
> de tudo.
