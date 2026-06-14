# Especificação Funcional — MVP Aluguel de Imóveis (estilo Airbnb)

> Documento de especificação (Spec-Driven Development) — fonte da verdade sobre **o que** o sistema faz.

## 1. Visão Geral

Plataforma web de aluguel de imóveis por temporada. Anfitriões cadastram imóveis; hóspedes pesquisam, filtram, visualizam no mapa e solicitam reservas. O anfitrião aprova ou recusa cada solicitação.

## 2. Atores

| Ator | Descrição |
|------|-----------|
| **Visitante** (não logado) | Pode pesquisar imóveis, aplicar filtros, ver detalhes e visualizar o mapa interativo. Não pode reservar. |
| **Hóspede** | Conta criada por qualquer pessoa. Solicita reservas informando dados de pagamento e acompanha o status no seu painel. |
| **Anfitrião** | Conta criada por qualquer pessoa. Cadastra/gerencia seus imóveis e aprova/recusa pedidos de reserva recebidos. |

## 3. Requisitos Funcionais

### RF01 — Página inicial
- **RF01.1** Exibe imóveis disponíveis ordenados por **destaque**: nota média de avaliação (desc) e, em empate, quantidade de avaliações.
- **RF01.2** Barra de pesquisa no topo com filtros avançados:
  - Cidade (busca textual);
  - Intervalo de datas (check-in / check-out) — exclui imóveis com reserva aprovada em conflito;
  - Quantidade de hóspedes (filtra por capacidade máxima);
  - Faixa de preço (mínimo e máximo da diária).
- **RF01.3** Alternância entre visualização em **lista** e em **mapa interativo** (marcadores com preço; popup com resumo e link para o detalhe).

### RF02 — Imóvel
Cada imóvel possui: título, descrição, endereço/localização (cidade, estado, endereço, latitude/longitude), fotos (1+), lista de comodidades (Wi-Fi, piscina, ar-condicionado etc.), capacidade máxima de hóspedes, preço por diária e calendário com dias já reservados.

### RF03 — Autenticação
- **RF03.1** Cadastro com nome, e-mail, senha e papel (hóspede ou anfitrião).
- **RF03.2** Login com e-mail e senha (JWT).
- **RF03.3** Visitantes têm acesso de leitura à busca, filtros, mapa e detalhes.

### RF04 — Reservas (Hóspede)
- **RF04.1** No detalhe do imóvel, o calendário mostra dias já reservados (aprovados) como indisponíveis.
- **RF04.2** O hóspede seleciona um intervalo de dias disponíveis e informa nº de hóspedes (≤ capacidade).
- **RF04.3** Para enviar o pedido é obrigatório informar dados de pagamento (nome no cartão, número, validade, CVV). **MVP**: dados validados em formato; apenas os 4 últimos dígitos são persistidos. Nenhuma cobrança real é efetuada.
- **RF04.4** Painel do hóspede lista suas reservas com status: **Pendente**, **Aprovada** ou **Recusada**, podendo cancelar pendentes.
- **RF04.5** O sistema rejeita pedidos que conflitem com reservas já aprovadas.

### RF05 — Gestão de imóveis (Anfitrião)
- **RF05.1** CRUD completo dos próprios imóveis (título, descrição, endereço, lat/lng, preço, capacidade, comodidades, fotos por URL).
- **RF05.2** Painel com os pedidos de reserva recebidos e ações **Aprovar** / **Recusar**.
- **RF05.3** Ao aprovar uma reserva, pedidos pendentes conflitantes no mesmo período são recusados automaticamente.

### RF06 — Avaliações
- **RF06.1** Hóspedes com reserva aprovada e concluída podem avaliar (nota 1–5 + comentário).
- **RF06.2** A nota média alimenta a ordenação por destaque da página inicial.

### RF07 — Documentação da API
- Documentação OpenAPI 3 disponível via **Swagger UI** (`/api/docs/`) e Redoc (`/api/redoc/`), com schema em `/api/schema/`.

## 4. Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| RNF01 | Backend: Django + Django REST Framework; autenticação JWT (SimpleJWT). |
| RNF02 | Frontend: React (Vite) com HTML/CSS puro (sem framework CSS). |
| RNF03 | Mapa interativo com Leaflet + OpenStreetMap (sem chave de API). |
| RNF04 | Segurança: senhas com hash (PBKDF2), permissões por papel e por dono do recurso, CORS restrito ao frontend, validação de entrada nos serializers, dados de cartão nunca armazenados em claro (só últimos 4 dígitos). |
| RNF05 | Banco: SQLite (MVP), trocável via `DATABASES` do Django. |
| RNF06 | Documentação Swagger gerada automaticamente com drf-spectacular. |

## 5. Regras de Negócio

| ID | Regra |
|----|-------|
| RN01 | `check_out` deve ser posterior a `check_in`; reservas no passado são rejeitadas. |
| RN02 | Conflito de datas: intervalos se sobrepõem quando `check_in < other.check_out` **e** `check_out > other.check_in` (check-out libera o dia). |
| RN03 | Apenas reservas **aprovadas** bloqueiam o calendário. |
| RN04 | O anfitrião só gerencia os próprios imóveis e só responde reservas dos próprios imóveis. |
| RN05 | O hóspede não pode reservar o próprio imóvel. |
| RN06 | Preço total = nº de diárias × preço por diária (calculado no backend). |
| RN07 | Só é possível avaliar imóvel com reserva aprovada e check-out passado; uma avaliação por reserva. |

## 6. Fora de Escopo (MVP)

- Gateway de pagamento real, chat, notificações por e-mail, upload binário de imagens (usa URLs), múltiplas moedas, i18n.
