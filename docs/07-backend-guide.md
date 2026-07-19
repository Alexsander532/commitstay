# 🐍 Backend do CommitStay — Guia Completo para Iniciantes

> **Estilo:** Professor sênior explicando para dev júnior  
> **Pré-requisito:** Nenhum. Você não precisa saber Django.  
> **Ao final deste documento:** Você vai entender cada arquivo, cada conceito, e vai conseguir modificar o backend com confiança.

---

## Sumário

1. [O que é Django e como ele pensa](#1-o-que-é-django-e-como-ele-pensa)
2. [A estrutura de pastas explicada arquivo por arquivo](#2-a-estrutura-de-pastas-explicada-arquivo-por-arquivo)
3. [O fluxo de uma requisição — do navegador ao banco e de volta](#3-o-fluxo-de-uma-requisição--do-navegador-ao-banco-e-de-volta)
4. [Models: como os dados são organizados](#4-models-como-os-dados-são-organizados)
5. [Serializers: o tradutor Python ↔ JSON](#5-serializers-o-tradutor-python--json)
6. [Views: onde a mágica acontece](#6-views-onde-a-mágica-acontece)
7. [URLs: o mapa das rotas da API](#7-urls-o-mapa-das-rotas-da-api)
8. [Autenticação JWT: como o login funciona](#8-autenticação-jwt-como-o-login-funciona)
9. [Permissões: quem pode fazer o quê](#9-permissões-quem-pode-fazer-o-quê)
10. [Regras de negócio implementadas](#10-regras-de-negócio-implementadas)
11. [Como testar sem escrever código](#11-como-testar-sem-escrever-código)
12. [Glossário Django para iniciantes](#12-glossário-django-para-iniciantes)

---

## 1. O que é Django e como ele pensa

### A analogia do restaurante

Imagine um restaurante completo:

| Papel no restaurante | Equivalente no Django |
|---------------------|----------------------|
| **Cardápio** | `urls.py` — lista do que está disponível |
| **Garçom** | `views.py` — recebe o pedido e entrega o prato |
| **Chef** | `serializers.py` — transforma ingredientes crus em prato pronto |
| **Despensa** | `models.py` — onde os ingredientes são guardados |
| **Segurança** | `permissions.py` — decide quem pode entrar e o que pode pedir |

### Django ≠ apenas backend

Django é um **framework web full-stack** que inclui ORM (banco de dados), templates (HTML), admin (painel administrativo), autenticação e muito mais. Neste projeto, usamos Django **apenas como API** — ou seja, ele não gera HTML. Ele só responde JSON.

Para isso, adicionamos o **Django REST Framework (DRF)**, que transforma Django numa máquina de APIs REST.

### O que é REST?

REST é um estilo de API onde:
- Cada **recurso** (usuário, imóvel, reserva) tem uma URL
- As operações usam verbos HTTP: `GET` (ler), `POST` (criar), `PATCH` (atualizar parte), `DELETE` (remover)
- Os dados trafegam em JSON

Exemplo:
```
GET    /api/properties/        → "Me dê a lista de imóveis"
POST   /api/properties/        → "Crie um novo imóvel"
GET    /api/properties/5/      → "Me dê o imóvel #5"
PATCH  /api/properties/5/      → "Atualize o preço do imóvel #5"
DELETE /api/properties/5/      → "Desative o imóvel #5"
```

---

## 2. A estrutura de pastas explicada arquivo por arquivo

```
backend/
│
├── manage.py                    ← O comando central. Tudo passa por aqui.
│
├── config/                      ← Configuração GLOBAL do projeto
│   ├── __init__.py              ← (vazio) Diz ao Python que isso é um pacote
│   ├── settings.py              ← ⭐ ONDE TUDO É CONFIGURADO
│   ├── urls.py                  ← O "roteador central" — distribui para os apps
│   ├── wsgi.py                  ← Servidor de produção (WSGI)
│   └── asgi.py                  ← Servidor de produção (ASGI, tempo real)
│
├── accounts/                    ← App #1: Usuários & Autenticação
│   ├── models.py                ← Modelo do usuário (email, nome, papel)
│   ├── serializers.py           ← Traduz User ↔ JSON
│   ├── views.py                 ← Lógica de registro e login
│   ├── urls.py                  ← Rotas: /register, /login, /me
│   ├── tests.py                 ← Testes automatizados
│   ├── admin.py                 ← Config do painel admin do Django
│   └── migrations/              ← Histórico de alterações no banco (como git)
│
├── properties/                  ← App #2: Imóveis
│   ├── models.py                ← Property, Photo, Review, Amenity, Favorite
│   ├── serializers.py           ← Traduz Property ↔ JSON
│   ├── views.py                 ← CRUD completo + filtros + ações extras
│   ├── urls.py                  ← Rotas: /properties, /amenities, /favorites
│   ├── filters.py               ← Lógica de filtro (cidade, preço, datas...)
│   ├── permissions.py           ← Quem pode criar/editar/excluir
│   ├── tests.py                 ← Testes
│   └── management/commands/seed.py  ← Popula o banco com dados de demo
│
└── bookings/                    ← App #3: Reservas
    ├── models.py                ← Booking (reserva)
    ├── serializers.py           ← Traduz Booking ↔ JSON
    ├── views.py                 ← Criar, aprovar, recusar, cancelar, avaliar
    ├── urls.py                  ← Rotas: /bookings + ações customizadas
    └── tests.py                 ← Testes
```

### O que significa cada arquivo obrigatório do Django

| Arquivo | É obrigatório? | O que faz |
|---------|:---:|-----------|
| `__init__.py` | ✅ | Sinaliza para o Python: "esta pasta é um pacote, pode importar coisas dela" |
| `apps.py` | ✅ | Registra o app no Django (contém a classe `AppConfig`) |
| `models.py` | ❌ | Define as tabelas do banco de dados |
| `views.py` | ❌ | Contém a lógica que responde às requisições HTTP |
| `urls.py` | ❌ | Mapeia URLs para views |
| `admin.py` | ❌ | Configura o que aparece no painel admin |
| `tests.py` | ❌ | Testes automatizados |
| `migrations/` | ❌ | Histórico de mudanças no banco |

---

## 3. O fluxo de uma requisição — do navegador ao banco e de volta

Vamos acompanhar o que acontece quando o frontend faz:

```
GET http://localhost:8000/api/properties/?city=São Paulo&min_price=100
```

### Passo a passo

```
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 1: O navegador envia o pedido                               │
│   GET /api/properties/?city=São Paulo&min_price=100              │
│   Host: localhost:8000                                            │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 2: urls.py — O roteador                                    │
│                                                                   │
│   config/urls.py:                                                 │
│     path("api/", include("properties.urls"))                      │
│                                                                   │
│   properties/urls.py:                                             │
│     router.register(r"properties", PropertyViewSet)               │
│                                                                   │
│   O router traduz:                                                │
│     GET /properties/  →  PropertyViewSet.list()                   │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 3: views.py — A lógica                                     │
│                                                                   │
│   PropertyViewSet.list():                                         │
│     1. Pega os parâmetros (city, min_price...)                   │
│     2. Passa pelo PropertyFilter (filters.py)                    │
│     3. Chama get_queryset() que busca no banco                   │
│     4. Pagina o resultado (12 por página)                        │
│     5. Passa cada objeto pelo serializer                         │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 4: filters.py — Os filtros                                 │
│                                                                   │
│   PropertyFilter:                                                 │
│     city__icontains = "São Paulo"  → busca parcial, case-insensit│
│     price_per_night__gte = 100      → maior ou igual a 100       │
│     check_in/check_out             → exclui imóveis já reservados│
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 5: models.py — O banco de dados                            │
│                                                                   │
│   Property.objects.filter(is_active=True, ...)                   │
│     .annotate(avg_rating=Avg("reviews__rating"))                 │
│                                                                   │
│   SQL gerado (aproximadamente):                                   │
│   SELECT *, AVG(review.rating) FROM property                      │
│   WHERE is_active = 1 AND city LIKE '%São Paulo%'                │
│   AND price_per_night >= 100                                      │
│   AND id NOT IN (imóveis já reservados nas datas)                │
│   ORDER BY avg_rating DESC                                        │
│   LIMIT 12 OFFSET 0                                               │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 6: serializers.py — Tradução para JSON                     │
│                                                                   │
│   Cada objeto Property vira:                                      │
│   {                                                               │
│     "id": 17,                                                     │
│     "title": "Suíte aconchegante na Vila Mariana",               │
│     "city": "São Paulo",                                          │
│     "price_per_night": "195.00",                                  │
│     "avg_rating": 5.0,                                            │
│     "cover_photo": "https://images.unsplash.com/...",            │
│     ...                                                           │
│   }                                                               │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 7: settings.py — O middleware de resposta                  │
│                                                                   │
│   Adiciona headers CORS, formato JSON, paginação...              │
│                                                                   │
│   RESPOSTA FINAL:                                                 │
│   HTTP 200 OK                                                     │
│   Content-Type: application/json                                  │
│   {                                                               │
│     "count": 77,                                                  │
│     "next": "http://.../api/properties/?page=2",                 │
│     "results": [ ...12 imóveis... ]                               │
│   }                                                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Models: como os dados são organizados

### O que é um Model?

Um **Model** é uma classe Python que o Django traduz automaticamente para uma **tabela SQL**. Você nunca escreve SQL — o Django faz isso por você.

### Exemplo: o model User

```python
# accounts/models.py
class User(AbstractUser):
    class Role(models.TextChoices):      # ← enum: valores permitidos
        GUEST = "guest", "Hóspede"
        HOST = "host", "Anfitrião"

    name = models.CharField("nome", max_length=150)    # texto de até 150 caracteres
    email = models.EmailField("e-mail", unique=True)    # email com validação
    role = models.CharField("papel", max_length=10, choices=Role.choices)

    USERNAME_FIELD = "email"    # ← login por email, não username!
```

O que isso gera no SQLite:
```sql
CREATE TABLE accounts_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password VARCHAR(128),
    name VARCHAR(150),
    email VARCHAR(254) UNIQUE,
    role VARCHAR(10),
    is_active BOOL,
    date_joined DATETIME
);
```

### Tipos de campo mais comuns

| Tipo | O que é | Exemplo |
|------|---------|---------|
| `CharField(max_length=N)` | Texto curto | nome, cidade, estado |
| `TextField()` | Texto longo | descrição de imóvel |
| `IntegerField()` | Número inteiro | capacidade, ordem |
| `DecimalField(max_digits, decimal_places)` | Dinheiro | preço por diária |
| `BooleanField()` | Sim/Não | is_active |
| `DateField()` | Data | check_in, check_out |
| `DateTimeField()` | Data e hora | created_at |
| `EmailField()` | Email com validação | email do usuário |
| `URLField()` | URL | foto do imóvel |
| `ForeignKey(OutroModel)` | Relacionamento N:1 | imóvel pertence a um host |
| `ManyToManyField(OutroModel)` | Relacionamento N:N | imóvel tem várias comodidades |
| `OneToOneField(OutroModel)` | Relacionamento 1:1 | reserva tem uma avaliação |

### Auto-campos mágicos do Django

Quando você cria um ModelField com certas opções, o Django faz mágica:

```python
created_at = models.DateTimeField(auto_now_add=True)
# ↑ Preenchido automaticamente com a data/hora de criação. Você nunca seta manualmente.

db_index = True
# ↑ Cria um índice no banco. Toda busca por cidade fica instantânea.

unique = True
# ↑ Garante que não pode ter 2 usuários com o mesmo email.

on_delete = models.CASCADE
# ↑ Se o dono do imóvel for deletado, seus imóveis também são.
```

### As tabelas deste projeto

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   User            │     │   Property        │     │   Booking         │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id               │     │ id               │     │ id               │
│ name             │     │ host_id ─────────┼────→│ property_id ─────┐
│ email (único)    │     │ title            │     │ guest_id ────────│─┐
│ role (guest/host)│     │ description      │     │ check_in         │ │
│ password (hash)  │     │ address          │     │ check_out        │ │
│ is_active        │     │ city (índice)    │     │ guests           │ │
│ date_joined      │     │ state            │     │ total_price      │ │
└──────────────────┘     │ latitude         │     │ status (P/A/R/C) │ │
                          │ longitude        │     │ card_last4       │ │
┌──────────────────┐     │ price_per_night  │     │ card_brand       │ │
│   Photo           │     │ max_guests       │     │ created_at       │ │
├──────────────────┤     │ is_active        │     └──────────────────┘ │
│ id               │     │ created_at       │                          │
│ property_id ─────┼────→│                  │     ┌──────────────────┐ │
│ url              │     └──────────────────┘     │   Review          │ │
│ caption          │              │               ├──────────────────┤ │
│ order            │              │ M:N           │ id               │ │
└──────────────────┘     ┌───────┴───────┐       │ booking_id ──────┘ │
                          │   Amenity      │       │ property_id ───────┘
┌──────────────────┐     ├────────────────┤       │ author_id ─────────┘
│   Favorite        │     │ id             │       │ rating (1-5)       │
├──────────────────┤     │ name           │       │ comment            │
│ id               │     │ icon           │       │ created_at         │
│ user_id ─────────┤     └────────────────┘       └────────────────────┘
│ property_id ─────┤
│ created_at       │
└──────────────────┘
```

### O ORM do Django (Object-Relational Mapper)

O ORM é o que te permite escrever Python em vez de SQL:

```python
# Em vez de:
# SELECT * FROM property WHERE city LIKE '%São Paulo%' AND is_active = 1

# Você escreve:
Property.objects.filter(city__icontains="São Paulo", is_active=True)

# O __icontains é um "lookup" do Django. Significa:
# "contains" = contém
# "i" = ignorar maiúsculas/minúsculas
# → busca case-insensitive por substring
```

**Lookups mais usados:**

| Lookup | Significado | Exemplo |
|--------|-------------|---------|
| `__exact` | Igual (padrão) | `city="SP"` |
| `__icontains` | Contém (case-insensitive) | `city__icontains="paulo"` |
| `__gte` | Maior ou igual | `price__gte=100` |
| `__lte` | Menor ou igual | `price__lte=500` |
| `__lt` | Menor que | `check_in__lt=check_out` |
| `__gt` | Maior que | `check_out__gt=check_in` |
| `__in` | Está na lista | `id__in=[1,2,3]` |
| `__range` | Entre | `price__range=(100,500)` |

---

## 5. Serializers: o tradutor Python ↔ JSON

### O que é um Serializer?

O **Serializer** é o componente que converte objetos Python (do banco) em JSON (para o frontend) e vice-versa. É como um **tradutor simultâneo**: recebe Python de um lado e devolve JSON do outro.

### O Serializer mais simples

```python
# accounts/serializers.py
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role"]
```

Isso faz com que um objeto `User` do banco:
```python
User(id=1, name="Hugo", email="hospede@demo.com", role="guest")
```

Seja convertido para:
```json
{
    "id": 1,
    "name": "Hugo",
    "email": "hospede@demo.com",
    "role": "guest"
}
```

### O que é `ModelSerializer`

`ModelSerializer` é um atalho. Em vez de definir cada campo manualmente, você diz "use os campos do Model X" e o DRF infere o resto sozinho. Ele automaticamente:
- Mapeia os tipos (CharField → string JSON, DecimalField → string numérica...)
- Aplica os validadores do Model (min_length, unique...)
- Gera os métodos `create()` e `update()` automaticamente

### Campos customizados

Às vezes você quer incluir campos que **não existem no banco** — eles são calculados:

```python
class PropertyListSerializer(serializers.ModelSerializer):
    avg_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    cover_photo = serializers.SerializerMethodField()
    host_name = serializers.CharField(source="host.name", read_only=True)

    def get_cover_photo(self, obj):
        first_photo = obj.photos.first()    # pega a primeira foto
        return first_photo.url if first_photo else None

    class Meta:
        model = Property
        fields = ["id", "title", "city", "state", "price_per_night",
                  "max_guests", "avg_rating", "review_count",
                  "cover_photo", "host_name", ...]
```

**Explicação dos campos customizados:**
- `avg_rating` e `review_count` — vêm da annotation no `get_queryset()`, não são colunas reais
- `cover_photo` — calculado via método `get_cover_photo()` (a primeira foto do imóvel)
- `host_name` — puxa o nome do anfitrião via relacionamento (`host.name`)

### Por que existem dois serializers?

```python
class PropertyListSerializer(...):    # ← usado na listagem (GET /properties/)
    # Campos resumidos: não inclui description, photos, amenities completas

class PropertyDetailSerializer(...):  # ← usado no detalhe (GET /properties/:id/)
    # Campos completos: inclui tudo
```

Isso é uma **otimização**: a listagem não precisa carregar todos os detalhes de cada imóvel. Reduz tráfego e consultas ao banco.

### Como serializers validam dados

Quando o frontend envia um `POST` ou `PATCH`, o serializer **também** valida os dados recebidos:

```python
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirme a senha")

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("As senhas não conferem.")
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        return User.objects.create_user(**validated_data)
```

Se a validação falhar, o DRF retorna automaticamente `HTTP 400` com os erros:
```json
{
    "password": ["Certifique-se de que o campo tenha no mínimo 8 caracteres."],
    "email": ["Usuário com este e-mail já existe."]
}
```

---

## 6. Views: onde a mágica acontece

### O que é uma View?

**View** é o código que roda quando alguém acessa uma URL. É o "chef" que recebe o pedido, busca os ingredientes no banco, monta o prato e entrega.

### ViewSet: o canivete suíço do DRF

Neste projeto usamos `ModelViewSet` e `GenericViewSet`. Eles empacotam todas as operações CRUD numa classe só:

```python
class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()      # de onde os dados vêm
    serializer_class = PropertyDetailSerializer  # como são traduzidos
    permission_classes = [IsHostOrReadOnly, IsOwnerOrReadOnly]  # segurança

    # Métodos herdados AUTOMATICAMENTE:
    # .list()      → GET  /properties/
    # .create()    → POST /properties/
    # .retrieve()  → GET  /properties/:id/
    # .update()    → PUT  /properties/:id/
    # .partial_update() → PATCH /properties/:id/
    # .destroy()   → DELETE /properties/:id/
```

**Você não escreveu esses métodos.** O `ModelViewSet` já vem com todos eles. Você só precisa configurar `queryset` e `serializer_class`.

### @action: endpoints customizados

Às vezes você precisa de endpoints que não são o CRUD padrão. Use o decorador `@action`:

```python
@action(detail=True, methods=["post"])
def approve(self, request, pk=None):
    """Aprovar uma reserva (anfitrião)"""
    booking = Booking.objects.get(pk=pk, property__host=request.user)
    if booking.status != Booking.Status.PENDING:
        return Response({"detail": "Apenas pendentes podem ser aprovadas"}, status=400)
    booking.status = Booking.Status.APPROVED
    booking.save()
    return Response(BookingSerializer(booking).data)
```

Isso cria automaticamente a rota:
```
POST /api/bookings/5/approve/
```

**Parâmetros do `@action`:**
- `detail=True` → age sobre UM objeto (URL tem `/:id/`)
- `detail=False` → age sobre a coleção (URL sem `/:id/`)
- `methods=["post"]` → só aceita POST
- `url_path="nome"` → customiza o nome na URL
- `permission_classes=[...]` → permissões específicas desta action

### A ordem de execução numa view

```python
class PropertyViewSet(ModelViewSet):
    # 1. PRIMEIRO: PermissionClasses verificam se o usuário pode acessar
    permission_classes = [IsHostOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        # 2. DEPOIS: Prepara a query com dados relacionados
        return Property.objects.filter(is_active=True).annotate(
            avg_rating=Avg("reviews__rating"),
            review_count=Count("reviews"),
        )

    def get_serializer_class(self):
        # 3. ESCOLHE o serializer certo conforme a ação
        if self.action == "list":
            return PropertyListSerializer   # resumido para listas
        return PropertyDetailSerializer      # completo para detalhe

    # 4. DEPOIS: O ModelViewSet chama .list(), .create(), etc automaticamente
```

### O que `select_related` e `prefetch_related` fazem

Esse é um conceito importante de performance:

```python
# SEM otimização — 101 consultas SQL:
Property.objects.all()  # 1 consulta pra propriedades
# pra cada propriedade: +1 consulta pro host, +1 pras fotos, +1 pras amenities
# Resultado: 1 + 77*3 = 232 consultas! (problema N+1)

# COM otimização — 4 consultas SQL:
Property.objects.select_related("host") \     # JOIN com User (1 consulta extra)
                .prefetch_related("photos", "amenities")  # 2 consultas extras
# Resultado: 4 consultas total
```

**Regra prática:**
- `select_related()` → para ForeignKey (relacionamentos "para um")
- `prefetch_related()` → para ManyToManyField e reverse ForeignKey (relacionamentos "para muitos")

### O padrão de cada app

Cada app segue 3 padrões principais de view:

**Padrão 1: ViewSet completo (CRUD)** → `PropertyViewSet`
- `ModelViewSet` = `list` + `create` + `retrieve` + `update` + `destroy`
- Usado para recursos que precisam de todas as operações

**Padrão 2: ViewSet parcial** → `BookingViewSet`
- `GenericViewSet` + `mixins.CreateModelMixin` + `mixins.ListModelMixin` + `mixins.RetrieveModelMixin`
- Só tem `create`, `list`, `retrieve` — sem `update` ou `destroy`
- Reservas não podem ser editadas, só canceladas

**Padrão 3: View genérica** → `RegisterView`, `MeView`
- `generics.CreateAPIView` → só POST (registro)
- `generics.RetrieveAPIView` → só GET (meus dados)

---

## 7. URLs: o mapa das rotas da API

### O roteador central

```python
# config/urls.py
urlpatterns = [
    path("admin/", admin.site.urls),                          # painel admin
    path("api/auth/", include("accounts.urls")),              # delega para accounts
    path("api/", include("properties.urls")),                 # delega para properties
    path("api/", include("bookings.urls")),                   # delega para bookings
    path("api/schema/", SpectacularAPIView.as_view()),        # OpenAPI schema
    path("api/docs/", SpectacularSwaggerView.as_view()),      # Swagger UI
    path("api/redoc/", SpectacularRedocView.as_view()),       # Redoc
]
```

### Router vs path()

```python
# properties/urls.py — usando Router (automático)
router = DefaultRouter()
router.register(r"properties", PropertyViewSet)
router.register(r"amenities", AmenityViewSet)
router.register(r"favorites", FavoriteViewSet)
urlpatterns = router.urls

# accounts/urls.py — usando path() (manual)
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
]
```

**Router** gera TODAS as rotas automaticamente:

| Registro | Rotas geradas |
|----------|-------------|
| `router.register("properties", PropertyViewSet)` | `GET/POST /properties/`, `GET/PUT/PATCH/DELETE /properties/{id}/`, `GET /properties/{id}/booked-dates/`, `GET /properties/{id}/reviews/`, `GET /properties/mine/` |

**path()** gera UMA rota por vez:
```python
path("register/", RegisterView.as_view())
# → POST /api/auth/register/
```

### Como as URLs finais ficam

```
/api/auth/register/              POST    → RegisterView
/api/auth/login/                 POST    → LoginView (TokenObtainPairView)
/api/auth/refresh/               POST    → TokenRefreshView
/api/auth/me/                    GET     → MeView

/api/properties/                 GET     → PropertyViewSet.list()
/api/properties/                 POST    → PropertyViewSet.create()
/api/properties/:id/             GET     → PropertyViewSet.retrieve()
/api/properties/:id/             PATCH   → PropertyViewSet.partial_update()
/api/properties/:id/             DELETE  → PropertyViewSet.destroy()
/api/properties/mine/            GET     → PropertyViewSet.mine()
/api/properties/:id/booked-dates/ GET    → PropertyViewSet.booked_dates()
/api/properties/:id/reviews/     GET     → PropertyViewSet.reviews()

/api/amenities/                  GET     → AmenityViewSet.list()

/api/favorites/                  GET     → FavoriteViewSet.list()
/api/favorites/                  POST    → FavoriteViewSet.create()
/api/favorites/:id/              DELETE  → FavoriteViewSet.destroy()
/api/favorites/check/:id/        GET     → FavoriteViewSet.check()
/api/favorites/toggle/           POST    → FavoriteViewSet.toggle()

/api/bookings/                   GET     → BookingViewSet.list()
/api/bookings/                   POST    → BookingViewSet.create()
/api/bookings/:id/               GET     → BookingViewSet.retrieve()
/api/bookings/received/          GET     → BookingViewSet.received()
/api/bookings/:id/approve/       POST    → BookingViewSet.approve()
/api/bookings/:id/reject/        POST    → BookingViewSet.reject()
/api/bookings/:id/cancel/        POST    → BookingViewSet.cancel()
/api/bookings/:id/review/        POST    → BookingViewSet.review()
```

---

## 8. Autenticação JWT: como o login funciona

### O que é JWT?

JWT (JSON Web Token) é como um **crachá de identificação**:

1. Você faz login com email + senha
2. O servidor verifica e te devolve dois tokens:
   - **Access token** (1 hora) — você usa em toda requisição
   - **Refresh token** (24 horas) — você usa só quando o access vencer
3. Em toda requisição autenticada, você envia o access token no header:
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOi...
   ```

### O ciclo de vida de um token

```
┌──────────┐     1. POST /login/      ┌──────────┐
│ Frontend │ ─────────────────────────→│ Backend  │
│          │     {email, password}     │          │
│          │←───────────────────────── │          │
│          │  2. {access, refresh}     │          │
│          │                           │          │
│          │  3. GET /properties/      │          │
│          │  Authorization: Bearer    │          │
│          │  <access_token>           │          │
│          │←───────────────────────── │          │
│          │  4. 200 OK + dados        │          │
│          │                           │          │
│          │  [1 hora depois...]       │          │
│          │                           │          │
│          │  5. GET /bookings/        │          │
│          │  Authorization: Bearer    │          │
│          │  <access_token vencido>   │          │
│          │←───────────────────────── │          │
│          │  6. 401 Unauthorized      │          │
│          │                           │          │
│          │  7. POST /refresh/        │          │
│          │  {refresh: <refresh>}     │          │
│          │←───────────────────────── │          │
│          │  8. {access: <novo>}      │          │
│          │                           │          │
│          │  9. GET /bookings/        │          │
│          │  Authorization: Bearer    │          │
│          │  <novo access token>      │          │
│          │←───────────────────────── │          │
│          │  10. 200 OK               │          │
└──────────┘                           └──────────┘
```

### A configuração no projeto

```python
# config/settings.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # ↑ Toda view que tem IsAuthenticated usa JWT
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),   # access dura 1h
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),       # refresh dura 1 dia
    "AUTH_HEADER_TYPES": ("Bearer",),                  # prefixo "Bearer"
}
```

### Login por email (não username)

Django por padrão usa `username` para login. Este projeto customizou para usar `email`:

```python
# accounts/models.py
class User(AbstractUser):
    username = None              # Remove o campo username!
    USERNAME_FIELD = "email"     # Login passa a ser por email
    REQUIRED_FIELDS = ["name"]   # Campos obrigatórios além do email
```

E o serializer de login precisa saber disso:

```python
# accounts/serializers.py
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login por email em vez de username"""
    # TokenObtainPairSerializer do SimpleJWT já lida com USERNAME_FIELD automaticamente
```

---

## 9. Permissões: quem pode fazer o quê

### A hierarquia de permissões

```
AllowAny                         ← Aberto pra todo mundo
    ↓
IsAuthenticatedOrReadOnly        ← Leitura liberada, escrita só logado
    ↓
IsAuthenticated                  ← Tudo requer login
    ↓
IsHostOrReadOnly                 ← GET qualquer um, POST/PATCH/DELETE só host
    ↓
IsOwnerOrReadOnly                ← Só o DONO edita/exclui
    ↓
IsGuest                         ← Só hóspede (guest)
```

### As permissões customizadas do projeto

```python
# properties/permissions.py

class IsHostOrReadOnly(BasePermission):
    """Leitura: qualquer um. Escrita: só anfitrião (role=host)."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True                              # leitura liberada
        return request.user.is_authenticated and request.user.role == "host"

class IsOwnerOrReadOnly(BasePermission):
    """Só o dono do imóvel pode editar/excluir."""
    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True                              # leitura liberada
        return obj.host == request.user              # só o dono!
```

### has_permission vs has_object_permission

- **has_permission** → verifica ACESSO GERAL (posso ver a lista de imóveis?)
- **has_object_permission** → verifica um OBJETO ESPECÍFICO (posso editar ESTE imóvel?)

```
GET /api/properties/        → has_permission()       (lista — qualquer um pode)
POST /api/properties/       → has_permission()       (criar — só host)
PATCH /api/properties/5/    → has_permission() +      (editar — só host E dono)
                              has_object_permission(obj)
```

### Permissões por ação

Cada @action pode ter suas próprias permissões:

```python
class BookingViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]  # padrão: precisa login

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        # Só anfitrião dono do imóvel (verificado manualmente no código)
        booking = Booking.objects.get(pk=pk, property__host=request.user)
        ...
```

### A verificação no settings.py

```python
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
        # ↑ Padrão GLOBAL: leitura liberada, escrita requer login
    ),
}
```

Esse é o **padrão** para TODAS as views que não especificarem o contrário. Depois, cada ViewSet pode sobrescrever.

---

## 10. Regras de negócio implementadas

Essas são as "regras de ouro" que fazem o sistema funcionar corretamente:

### RN01 — Preço total da reserva
```python
# Calculado no serializer de Booking:
total_price = noites × property.price_per_night
```

### RN02 — Conflito de datas
```python
# bookings/models.py
def conflicts_with_approved(self):
    """Verifica se já existe reserva aprovada no mesmo imóvel no mesmo período."""
    return Booking.objects.filter(
        property_id=self.property_id,
        status=Booking.Status.APPROVED,
        check_in__lt=self.check_out,    # data de entrada da existente < minha saída
        check_out__gt=self.check_in,    # data de saída da existente > minha entrada
    ).exclude(pk=self.pk).exists()
```

A lógica de overlap de datas:
```
Reserva existente:  [10/01 ─────── 15/01]
Minha reserva:           [12/01 ─────── 18/01]  ← CONFLITO!
Minha reserva:  [05/01 ─── 10/01]                ← OK (adjacente)
Minha reserva:                         [16/01 ── 20/01] ← OK (após)
```

### RN03 — Auto-recusa de conflitos
```python
# bookings/views.py — dentro do approve()
Booking.objects.filter(
    property=booking.property,
    status=Booking.Status.PENDING,
    check_in__lt=booking.check_out,
    check_out__gt=booking.check_in,
).update(status=Booking.Status.REJECTED)
```

Quando um anfitrião aprova uma reserva, o sistema **automaticamente recusa** todas as outras pendentes que conflitam com ela.

### RN04 — Estados da reserva

```
                  ┌─────────┐
                  │ PENDING │  ← Estado inicial
                  └────┬────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ APPROVED │ │ REJECTED │ │CANCELLED │
    └────┬─────┘ └──────────┘ └──────────┘
         │
         ▼
    ┌──────────┐
    │ Avaliado │  ← Review criada (só após check-out)
    └──────────┘
```

Transições permitidas:
- `PENDING → APPROVED` (anfitrião aprova)
- `PENDING → REJECTED` (anfitrião recusa)
- `PENDING → CANCELLED` (hóspede cancela)
- `PENDING → REJECTED` automático (conflito com aprovada)

NÃO permitidas:
- `APPROVED → PENDING` ❌
- `REJECTED → APPROVED` ❌
- `CANCELLED → qualquer coisa` ❌

### RN05 — Cartão de crédito
```python
# Apenas os 4 últimos dígitos são salvos
card_last4 = models.CharField(max_length=4)

# O número completo NUNCA é persistido. CVV NUNCA é persistido.
# O frontend envia o número completo, o backend extrai os últimos 4 dígitos
# e DESCARTA o resto.
```

### RN06 — Soft delete
```python
def perform_destroy(self, instance):
    instance.is_active = False
    instance.save()
```

Imóveis NUNCA são deletados do banco. Apenas marcados como `is_active=False`. Isso preserva o histórico de reservas passadas.

### RN07 — Filtro de disponibilidade
Quando o usuário busca com `check_in` e `check_out`, o backend filtra os imóveis que já estão reservados (aprovados) no período:
```python
# properties/filters.py — PropertyFilter
if check_in and check_out:
    # Exclui imóveis com reservas aprovadas que conflitam
    conflicting = Booking.objects.filter(
        status=Booking.Status.APPROVED,
        check_in__lt=check_out,
        check_out__gt=check_in,
    ).values("property_id")
    queryset = queryset.exclude(id__in=conflicting)
```

### RN08 — Paginação
```python
REST_FRAMEWORK = {
    "PAGE_SIZE": 12,  # 12 imóveis por página
}
```

### RN09 — Throttling (rate limiting)
```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/min",   # 100 requisições por minuto (anônimo)
        "user": "300/min",   # 300 requisições por minuto (logado)
    },
}
```

---

## 11. Como testar sem escrever código

### Swagger UI — Teste visual

Com o backend rodando (`python manage.py runserver`), acesse:

**http://localhost:8000/api/docs/**

É uma página interativa onde você pode:

1. Clicar em `POST /api/auth/login/` → "Try it out"
2. Preencher:
   ```json
   { "email": "hospede@demo.com", "password": "senha@123" }
   ```
3. Clicar "Execute" → copiar o `access` token
4. Clicar no botão **Authorize** (cadeado verde no topo)
5. Colar `Bearer <seu_token>`
6. Agora todos os endpoints autenticados funcionam!

### Testes automatizados

```bash
cd backend
source .venv/bin/activate
python manage.py test   # Roda 19 testes
```

### Comandos úteis do manage.py

```bash
python manage.py runserver          # Sobe o servidor (porta 8000)
python manage.py migrate            # Aplica migrações no banco
python manage.py makemigrations     # Cria nova migração (após mudar models.py)
python manage.py seed               # Popula o banco com dados de demo
python manage.py shell              # Abre um terminal Python com Django carregado
python manage.py createsuperuser    # Cria um admin (email + senha)
python manage.py test               # Roda os testes
python manage.py showmigrations     # Lista migrações e status
```

---

## 12. Glossário Django para iniciantes

| Termo | Significado |
|-------|------------|
| **App** | Um módulo independente (accounts, properties, bookings). Cada app tem seus próprios models, views, urls. |
| **Model** | Uma classe Python que vira tabela SQL. Define a estrutura dos dados. |
| **Migration** | Um arquivo que registra mudanças no banco. É como um "commit" do git para o schema SQL. |
| **ORM** | Object-Relational Mapper. Traduz Python → SQL automaticamente. |
| **QuerySet** | Uma "promessa" de consulta SQL. Só executa quando você itera ou chama `.first()`, `.all()`, etc. |
| **Serializer** | Traduz objetos Python ↔ JSON. Valida dados de entrada. |
| **View** | Código que responde a uma requisição HTTP. |
| **ViewSet** | Agrupa várias views relacionadas numa classe só (list, create, retrieve, update, destroy). |
| **Router** | Gera URLs automaticamente para um ViewSet. |
| **Middleware** | Código que roda ANTES e DEPOIS de cada requisição. Como um filtro na tubulação. |
| **JWT** | JSON Web Token. Método de autenticação stateless via tokens assinados. |
| **Decorator** | Um `@` que modifica uma função/classe. Ex: `@action`, `@extend_schema`. |
| **Admin** | Painel administrativo automático do Django em `/admin/`. |
| **Static files** | Arquivos CSS, JS, imagens. |
| **WSGI / ASGI** | Protocolos para servir a aplicação em produção. |

---

> **Dica do professor:** Django é enorme, mas você não precisa saber tudo. Para manter este projeto, foque em entender: models (os dados), serializers (a tradução) e views (a lógica). O resto você aprende conforme a necessidade. E lembre-se: `python manage.py shell` é seu melhor amigo para testar queries sem precisar do frontend.
