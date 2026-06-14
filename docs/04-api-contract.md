# Contrato da API — MVP Aluguel de Imóveis

> Contrato REST (SDD). A documentação interativa/oficial é gerada pelo Swagger UI em `/api/docs/`.

Base URL (dev): `http://localhost:8000/api/`
Autenticação: `Authorization: Bearer <access_token>` (JWT).

## Autenticação — `/api/auth/`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `auth/register/` | — | Cadastro. Body: `{name, email, password, role}` (`role`: `guest`\|`host`) |
| POST | `auth/login/` | — | Login. Body: `{email, password}` → `{access, refresh, user}` |
| POST | `auth/refresh/` | — | Body: `{refresh}` → `{access}` |
| GET | `auth/me/` | ✅ | Dados do usuário logado |

## Imóveis — `/api/properties/`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `properties/` | — | Lista paginada com filtros (abaixo). Ordenação padrão: destaque (nota média desc, nº reviews desc) |
| POST | `properties/` | host | Cria imóvel (com `photo_urls` e `amenity_ids`) |
| GET | `properties/{id}/` | — | Detalhe completo (fotos, comodidades, nota, reviews) |
| PUT/PATCH | `properties/{id}/` | dono | Atualiza (inclusive fotos/preço/comodidades) |
| DELETE | `properties/{id}/` | dono | Desativa (soft delete) |
| GET | `properties/{id}/booked-dates/` | — | Lista de datas ocupadas (reservas aprovadas): `[{check_in, check_out}]` |
| GET | `properties/{id}/reviews/` | — | Avaliações do imóvel |
| GET | `properties/mine/` | host | Imóveis do anfitrião logado (inclui inativos) |
| GET | `amenities/` | — | Catálogo de comodidades |

### Query params de `GET properties/`
| Param | Tipo | Efeito |
|-------|------|--------|
| `city` | string | `icontains` em cidade |
| `check_in`, `check_out` | date (juntos) | Exclui imóveis com reserva APPROVED conflitante |
| `guests` | int | `max_guests >= guests` |
| `min_price`, `max_price` | decimal | Faixa de `price_per_night` |
| `ordering` | string | `-avg_rating` (default), `price_per_night`, `-price_per_night`, `-created_at` |
| `page` | int | Paginação (12/página) |

## Reservas — `/api/bookings/`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `bookings/` | guest | Solicita reserva. Body: `{property, check_in, check_out, guests, card_holder, card_number, card_expiry, card_cvv}` |
| GET | `bookings/` | guest | Minhas reservas (painel do hóspede) |
| GET | `bookings/received/` | host | Pedidos recebidos nos meus imóveis (filtro `?status=`) |
| POST | `bookings/{id}/approve/` | host dono | Aprova (auto-recusa pendentes conflitantes) |
| POST | `bookings/{id}/reject/` | host dono | Recusa |
| POST | `bookings/{id}/cancel/` | guest autor | Cancela se `PENDING` |
| POST | `bookings/{id}/review/` | guest autor | Avalia (`{rating, comment}`) se aprovada e concluída |

## Erros

Formato DRF padrão:

```json
{ "detail": "mensagem" }
```
ou por campo:
```json
{ "check_in": ["Há conflito com uma reserva já aprovada."] }
```

| Código | Quando |
|--------|--------|
| 400 | Validação (datas, capacidade, cartão, conflito) |
| 401 | Sem token / token inválido |
| 403 | Sem permissão (papel/dono) |
| 404 | Recurso inexistente |
| 429 | Throttling |

## Exemplos

### Solicitar reserva
```http
POST /api/bookings/
Authorization: Bearer <token-de-hospede>
Content-Type: application/json

{
  "property": 3,
  "check_in": "2026-07-10",
  "check_out": "2026-07-15",
  "guests": 2,
  "card_holder": "MARIA SILVA",
  "card_number": "4111111111111111",
  "card_expiry": "12/27",
  "card_cvv": "123"
}
```

Resposta `201`:
```json
{
  "id": 14,
  "property": 3,
  "property_title": "Casa na praia",
  "check_in": "2026-07-10",
  "check_out": "2026-07-15",
  "guests": 2,
  "nights": 5,
  "total_price": "1750.00",
  "status": "PENDING",
  "card_last4": "1111",
  "card_brand": "Visa"
}
```
