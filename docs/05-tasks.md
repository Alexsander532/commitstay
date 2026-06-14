# Tarefas de Implementação — MVP Aluguel de Imóveis

> Quebra de trabalho (SDD). Cada tarefa referencia os requisitos da spec (`01-spec.md`).

## Fase 1 — Backend

- [x] **T01** Setup Django + DRF + SimpleJWT + drf-spectacular + django-filter + CORS (RNF01, RNF04, RNF06)
- [x] **T02** App `accounts`: User customizado (e-mail como login, `role`), endpoints register/login/refresh/me (RF03)
- [x] **T03** App `properties`: modelos Property, Photo, Amenity, Review (RF02, RF06)
- [x] **T04** CRUD de imóveis com permissões de dono + `mine/` (RF05.1, RN04)
- [x] **T05** Filtros de busca: cidade, datas, hóspedes, faixa de preço + ordenação por destaque (RF01.1, RF01.2)
- [x] **T06** App `bookings`: modelo, validações de conflito/capacidade/datas (RF04, RN01–RN06)
- [x] **T07** Ações approve/reject/cancel + auto-recusa de conflitantes (RF05.2, RF05.3)
- [x] **T08** Endpoint `booked-dates` para o calendário (RF04.1)
- [x] **T09** Avaliações pós-estadia + média na listagem (RF06)
- [x] **T10** Swagger UI / Redoc / schema (RF07)
- [x] **T11** Seed: amenities, usuários demo, imóveis com fotos e reservas (avaliação)
- [x] **T12** Testes automatizados (auth, conflitos, permissões, filtros)

## Fase 2 — Frontend

- [x] **T13** Setup Vite + React + Router + AuthContext + cliente HTTP com refresh de token
- [x] **T14** Layout base (header com login/painéis) + CSS global (RNF02)
- [x] **T15** Home: SearchBar com filtros avançados + grid de cards ordenado por destaque (RF01.1, RF01.2)
- [x] **T16** Mapa interativo (Leaflet) com toggle lista/mapa (RF01.3)
- [x] **T17** Página de detalhe: galeria, comodidades, reviews, calendário com dias reservados (RF02, RF04.1)
- [x] **T18** Fluxo de reserva com formulário de pagamento (RF04.2, RF04.3)
- [x] **T19** Painel do hóspede: status das reservas + cancelar + avaliar (RF04.4, RF06)
- [x] **T20** Painel do anfitrião: CRUD de imóveis + aprovar/recusar pedidos (RF05)
- [x] **T21** Páginas de login/cadastro com escolha de papel (RF03)

## Fase 3 — Finalização

- [x] **T22** README com instruções de execução e credenciais demo
- [x] **T23** Verificação ponta a ponta (backend + frontend rodando)
