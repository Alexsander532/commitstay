# ⚛️ Frontend do CommitStay — Guia Completo para Iniciantes

> **Estilo:** Professor sênior explicando para dev júnior  
> **Pré-requisito:** Saber o básico de HTML e JavaScript. Não precisa saber React.  
> **Ao final deste documento:** Você vai entender cada arquivo, cada conceito React, e vai conseguir modificar o frontend com confiança.

---

## Sumário

1. [O que é React? A analogia da fábrica de móveis](#1-o-que-é-react-a-analogia-da-fábrica-de-móveis)
2. [O ecossistema: Vite, React Router, Leaflet](#2-o-ecossistema-vite-react-router-leaflet)
3. [A estrutura de pastas explicada](#3-a-estrutura-de-pastas-explicada)
4. [Como o React renderiza: o motor por trás](#4-como-o-react-renderiza-o-motor-por-trás)
5. [Componentes: os blocos de LEGO](#5-componentes-os-blocos-de-lego)
6. [Estados e Efeitos: a memória do componente](#6-estados-e-efeitos-a-memória-do-componente)
7. [Contexto de Autenticação: o cérebro global](#7-contexto-de-autenticação-o-cérebro-global)
8. [Roteamento: o mapa da aplicação](#8-roteamento-o-mapa-da-aplicação)
9. [O cliente HTTP: como o front fala com o back](#9-o-cliente-http-como-o-front-fala-com-o-back)
10. [Páginas: uma por uma](#10-páginas-uma-por-uma)
11. [Componentes reutilizáveis: o catálogo](#11-componentes-reutilizáveis-o-catálogo)
12. [CSS: as classes que dão vida](#12-css-as-classes-que-dão-vida)
13. [Glossário React para iniciantes](#13-glossário-react-para-iniciantes)

---

## 1. O que é React? A analogia da fábrica de móveis

### O jeito antigo (jQuery, HTML puro)

Antigamente, você construía a página inteira em HTML e depois usava JavaScript para "cutucar" elementos:

```javascript
// jQuery: "vai no DOM, acha o elemento, muda ele"
$("#nome-usuario").text("Hugo");
$("#botao-salvar").hide();
```

O problema: conforme a aplicação cresce, você perde o controle de QUEM mudou O QUÊ e QUANDO. Vira uma bagunça de callbacks.

### O jeito React

React inverte a lógica. Em vez de "vou lá e mudo a página", você diz:

> "Dado este estado atual, a página deve ser assim."

React se encarrega de atualizar o DOM automaticamente quando o estado muda. É como um **operário**: você dá as instruções (componentes + estado), e ele constrói/mantém a página.

### A analogia da fábrica de móveis

Imagine uma fábrica que monta mesas:

| Conceito na fábrica | Equivalente no React |
|---------------------|---------------------|
| **Planta/Projeto** | Componente (`.jsx`) — define como a peça deve ser |
| **Linha de montagem** | `render()` — o processo de construir a peça |
| **Pedido do cliente** | `state` — o que mudou (ex: "quero azul, não vermelha") |
| **Operário** | React — pega o projeto + pedido e entrega a peça pronta |
| **Catálogo de peças** | `props` — peças prontas que você pode combinar |
| **Peça final** | DOM — o que o usuário vê na tela |

---

## 2. O ecossistema: Vite, React Router, Leaflet

### Vite (pronuncia-se "veet")

**Vite** é o **empacotador** (bundler). Ele pega todos os seus arquivos `.jsx`, `.css`, `.png` e os transforma em algo que o navegador entende.

```bash
npx vite           # modo dev: servidor com hot reload (muda código → atualiza sozinho)
npx vite build     # modo produção: gera a pasta dist/
```

**Por que Vite e não Webpack?** Vite é MUITO mais rápido. Ele usa módulos ES nativos do navegador durante o desenvolvimento (não precisa empacotar tudo antes). O build de produção leva <1 segundo neste projeto.

### React Router

Gerencia a navegação entre páginas sem recarregar o navegador (SPA — Single Page Application).

```
/                        → Home.jsx
/login                   → Login.jsx
/cadastro                → Register.jsx
/imovel/:id              → PropertyDetail.jsx   (:id é um parâmetro dinâmico)
/minhas-reservas         → GuestDashboard.jsx
/meus-favoritos          → FavoritesPage.jsx
/painel-anfitriao        → HostDashboard.jsx
```

### Leaflet

Biblioteca de mapas interativos (a mesma usada pelo OpenStreetMap). Renderiza o mapa na página e coloca marcadores nos imóveis.

---

## 3. A estrutura de pastas explicada

```
frontend/
├── index.html              ← O HTML raiz (quase vazio — React preenche tudo)
├── package.json            ← Dependências npm + scripts
├── vite.config.js          ← Configuração do Vite (mínima: só o plugin React)
├── eslint.config.js        ← Regras de linting (padronização de código)
│
├── public/
│   ├── favicon.svg         ← Ícone da aba do navegador
│   └── icons.svg           ← Sprites de ícones SVG
│
└── src/                    ← ⭐ TODO o código está aqui
    ├── main.jsx            ← Ponto de entrada: "liga" React + Router + Auth
    ├── App.jsx             ← Componente raiz: define as rotas
    │
    ├── api/                ← Camada de comunicação com o backend
    │   ├── client.js       ← ⭐ Função api() central + cache + tokens JWT
    │   └── endpoints.js    ← Funções por endpoint: login(), listProperties()...
    │
    ├── context/
    │   └── AuthContext.jsx ← ⭐ Estado global de autenticação (login/logout/user)
    │
    ├── config/
    │   └── brand.js        ← Cores, nome e metadados da marca CommitStay
    │
    ├── pages/              ← Páginas completas (1 rota = 1 página)
    │   ├── Home.jsx                   ← Página inicial com busca + carrosséis
    │   ├── Login.jsx                  ← Formulário de login
    │   ├── Register.jsx               ← Formulário de cadastro
    │   ├── PropertyDetail.jsx         ← Detalhes de um imóvel + booking
    │   ├── GuestDashboard.jsx         ← Painel do hóspede (minhas reservas)
    │   ├── FavoritesPage.jsx          ← Imóveis favoritados
    │   └── HostDashboard.jsx         ← Painel do anfitrião (imóveis + pedidos)
    │
    ├── components/          ← Peças reutilizáveis (usadas por múltiplas páginas)
    │   ├── Header.jsx                ← Barra de navegação no topo
    │   ├── SearchBar.jsx             ← Barra de busca com popovers
    │   ├── PropertyCard.jsx          ← Card de imóvel (lista + carrossel)
    │   ├── PropertyCarousel.jsx      ← Carrossel horizontal de cards
    │   ├── PropertyForm.jsx          ← Formulário CRUD de imóvel (anfitrião)
    │   ├── PhotoGallery.jsx          ← Grid de fotos do imóvel
    │   ├── BookingWidget.jsx         ← Sidebar de reserva (datas + hóspedes + pagamento)
    │   ├── Calendar.jsx              ← Calendário interativo com dias bloqueados
    │   ├── CardFavoriteButton.jsx    ← Botão ♥ no card do imóvel
    │   ├── SaveFavoriteButton.jsx    ← Botão ♥ na página de detalhe
    │   ├── MapView.jsx               ← Mapa Leaflet com marcadores
    │   ├── PropertyLocationMap.jsx   ← Mapa estático na página de detalhe
    │   ├── ReviewsCarousel.jsx       ← Carrossel de avaliações
    │   ├── StatusBadge.jsx           ← Badge colorido (Pendente/Aprovada/Recusada)
    │   └── SearchWhenPopover.jsx     ← Popover de seleção de datas
    │
    ├── assets/              ← Imagens estáticas
    │   ├── hero.png         ← Imagem de fundo/hero
    │   └── vite.svg         ← Logo do Vite (não usado)
    │
    └── styles/
        └── global.css       ← ⭐ TODOS os estilos da aplicação
```

---

## 4. Como o React renderiza: o motor por trás

### O arquivo main.jsx — onde tudo começa

```jsx
// main.jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

Isso diz:
1. Pega o `<div id="root">` do `index.html`
2. Cria a "raiz" do React ali dentro
3. Renderiza a árvore de componentes:
   ```
   StrictMode (ajuda a achar bugs em dev)
     └── BrowserRouter (habilita navegação por URL)
           └── AuthProvider (fornece login/logout/user pra toda a app)
                 └── App (rotas + header)
   ```

### O que é JSX?

JSX parece HTML mas é JavaScript:

```jsx
// JSX:
<h1 className="title">Olá, {user.name}</h1>

// Compila para JavaScript puro:
React.createElement("h1", { className: "title" }, "Olá, ", user.name);
```

**Regras do JSX:**
- `className` em vez de `class` (porque `class` é palavra reservada do JS)
- `{}` para inserir JavaScript: `{user.name}`, `{price > 100 ? "Caro" : "Barato"}`
- Todo componente deve retornar **UM único elemento raiz** (ou fragmento `<>...</>`)
- Tags precisam ser fechadas: `<img ... />`, `<br />`

### O fluxo de renderização (simplificado)

```
Estado muda (setState)
      │
      ▼
React compara Virtual DOM antigo com novo (reconciliação)
      │
      ├── Mudou algo? → Atualiza só aquela parte no DOM real
      └── Não mudou?  → Não faz nada
```

**Por que isso é eficiente:** em vez de reconstruir a página inteira a cada mudança, o React calcula a diferença (diff) e só atualiza o que realmente mudou.

---

## 5. Componentes: os blocos de LEGO

### O que é um componente?

Um **componente** é uma função JavaScript que retorna JSX. Ele recebe **props** (parâmetros) e retorna **elementos visuais**.

### Exemplo mínimo

```jsx
// components/Greeting.jsx
export default function Greeting({ name, role }) {
  const emoji = role === "host" ? "🏠" : "🧳";

  return (
    <div className="greeting">
      {emoji} Olá, <strong>{name}</strong>!
    </div>
  );
}

// Uso em outro componente:
<Greeting name="Hugo" role="guest" />
// Renderiza: <div class="greeting">🧳 Olá, <strong>Hugo</strong>!</div>
```

### Props: os parâmetros do componente

Props são **somente leitura**. Um componente nunca modifica suas próprias props:

```jsx
function PropertyCard({ property, user, compact = false }) {
  // property: objeto com dados do imóvel
  // user: objeto do usuário logado (ou null)
  // compact: opcional, padrão false (modo card do carrossel)
  return (...);
}
```

### Children: componentes dentro de componentes

```jsx
// App.jsx
<RequireRole role="guest">
  <GuestDashboard />   {/* ← isso é o "children" */}
</RequireRole>

// RequireRole renderiza children só se o usuário tiver o papel certo:
function RequireRole({ role, children }) {
  if (user.role !== role) return <Navigate to="/login" />;
  return children;  // ← renderiza o que foi passado entre as tags
}
```

### Os 3 tipos de componente neste projeto

| Tipo | Exemplo | Característica |
|------|---------|---------------|
| **Página** | `Home.jsx`, `Login.jsx` | Tem estado, faz fetch, ocupa a tela toda |
| **Componente de UI** | `Header.jsx`, `PropertyCard.jsx` | Reutilizável, focado em aparência |
| **Lógica/Guarda** | `RequireRole` | Não tem aparência, só decide se renderiza ou redireciona |

---

## 6. Estados e Efeitos: a memória do componente

### useState: a memória de curto prazo

```jsx
const [email, setEmail] = useState("");
//     ↑        ↑            ↑
//   valor    setter    valor inicial

// Ler:   email          → string atual
// Mudar: setEmail("hugo@demo.com")  → atualiza e RE-RENDERIZA o componente
```

**Regra de ouro:** NUNCA modifique o estado diretamente (`email = "novo"`). Sempre use o setter (`setEmail("novo")`). O React precisa saber que o estado mudou para re-renderizar.

### useEffect: "faça algo quando X mudar"

```jsx
useEffect(() => {
  // Código aqui roda DEPOIS do render
  getProperty(id)
    .then(setProperty)
    .catch(setError);

  // Cleanup opcional (roda antes do próximo efeito ou ao desmontar):
  return () => { /* cancela fetch, remove listener, etc. */ };
}, [id]);  // ← array de dependências: efeito re-executa quando "id" muda
```

**Array de dependências:**
- `[]` → executa UMA vez (ao montar)
- `[id]` → executa quando `id` mudar
- Sem array → executa em TODO render (cuidado! loop infinito!)

### useRef: uma caixa que sobrevive a re-renders

```jsx
const inputRef = useRef(null);
// inputRef.current → valor atual (sobrevive a re-renders, não causa re-render ao mudar)

// Uso típico: referência a elemento DOM
<input ref={inputRef} />
inputRef.current.focus();  // foca o input

// Uso típico: guard contra re-execução
const initialFetchDone = useRef(false);
if (!initialFetchDone.current) {
  initialFetchDone.current = true;
  fetchData();
}
```

### useMemo: "calcule só quando necessário"

```jsx
// SEMPRE recalcula (cada render):
const bookedSet = buildBookedSet(bookedRanges);

// SÓ recalcula quando bookedRanges mudar:
const bookedSet = useMemo(() => buildBookedSet(bookedRanges), [bookedRanges]);
```

Use quando o cálculo for caro (ex: construir um Set com milhares de datas).

### Resumo visual

```
┌─────────────────────────────────────────────────────────┐
│  CICLO DE VIDA DE UM COMPONENTE                         │
│                                                         │
│  1. MONTA (mount)                                       │
│     ├── useState inicializa                             │
│     ├── useRef inicializa                               │
│     ├── Render: JSX → DOM                               │
│     └── useEffect (deps=[]) roda                        │
│                                                         │
│  2. ATUALIZA (update) — quando state/props mudam        │
│     ├── Render: JSX → DOM (só o que mudou)              │
│     └── useEffect roda SE dependências mudaram           │
│                                                         │
│  3. DESMONTA (unmount)                                  │
│     └── Cleanup dos useEffect roda                      │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Contexto de Autenticação: o cérebro global

### O problema que o Context resolve

Sem Context, você precisaria passar `user` e `login/logout` como props através de TODOS os níveis:

```
App → Home → SearchBar → ... → SaveFavoriteButton
         (user passado por 5 níveis — "prop drilling")
```

Com Context, qualquer componente acessa diretamente:

```jsx
function SaveFavoriteButton({ propertyId }) {
  const { user } = useAuth();  // ← acesso direto ao estado global
  // ...
}
```

### Como funciona neste projeto

```jsx
// context/AuthContext.jsx

// 1. CRIA o contexto (um "espaço reservado")
const AuthContext = createContext(null);

// 2. PROVIDER: componente que envolve toda a app e fornece os valores
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // usuário logado (ou null)
  const [loading, setLoading] = useState(true);

  // Ao montar: verifica se já existe token salvo
  useEffect(() => {
    const tokens = localStorage.getItem("tokens");
    if (!tokens) { setLoading(false); return; }
    getMe()                           // GET /api/auth/me/
      .then(setUser)                  // se ok, define o usuário
      .catch(() => clearTokens())     // se falhar, limpa tokens
      .finally(() => setLoading(false));
  }, []);

  // Função de login
  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    saveTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
  };

  // Função de logout
  const logout = () => { clearTokens(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. HOOK: atalho para acessar o contexto
export function useAuth() {
  return useContext(AuthContext);
}
```

**Fluxo de autenticação:**
```
1. localStorage tem token?
   ├── SIM → GET /auth/me/ → define user
   └── NÃO → loading=false, user=null

2. Login: POST /auth/login/ → salva tokens no localStorage → define user
3. Logout: limpa localStorage → user=null
4. API client: toda requisição autenticada anexa Authorization: Bearer <token>
```

---

## 8. Roteamento: o mapa da aplicação

### Como as rotas funcionam

```jsx
// App.jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/imovel/:id" element={<PropertyDetail />} />
  <Route path="/login" element={<Login />} />
  <Route path="/cadastro" element={<Register />} />

  {/* Rotas protegidas — só renderizam se o usuário tiver o papel certo */}
  <Route path="/minhas-reservas" element={
    <RequireRole role="guest"><GuestDashboard /></RequireRole>
  } />

  <Route path="/painel-anfitriao" element={
    <RequireRole role="host"><HostDashboard /></RequireRole>
  } />

  {/* Rota coringa: qualquer URL não mapeada redireciona pra home */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### O guarda RequireRole

```jsx
function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;     // não logado
  if (user.role !== role) return <Navigate to="/" replace />;  // papel errado
  return children;  // tudo ok, renderiza a página
}
```

### Navegação entre páginas

```jsx
// Link: navegação declarativa (renderiza uma <a>)
<Link to="/imovel/5">Ver imóvel</Link>

// useNavigate: navegação imperativa (via código)
const navigate = useNavigate();
navigate("/minhas-reservas");
navigate(-1);  // volta

// useParams: pega parâmetros da URL
// Se a URL é /imovel/5:
const { id } = useParams();  // id = "5"
```

---

## 9. O cliente HTTP: como o front fala com o back

### A função api() central

```jsx
// api/client.js
const BASE_URL = "http://localhost:8000/api";

export async function api(path, { method = "GET", body, auth = true } = {}) {
  // 1. Constrói headers com token JWT (se autenticado)
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getTokens()?.access;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // 2. Faz a requisição
  const resp = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 3. Se 401, tenta refresh do token automaticamente
  if (resp.status === 401 && auth) {
    const newToken = await refreshAccess();
    if (newToken) return api(path, { method, body, auth }); // retry
  }

  // 4. Processa resposta
  if (resp.status === 204) return null;
  const data = await resp.json();
  if (!resp.ok) throw new ApiError(resp.status, data);
  return data;
}
```

### Cache de deduplicação (implementado na correção do Issue #1)

```jsx
const _pending = new Map();
const _ttl = 30_000;  // 30 segundos

function _withCache(key, factory) {
  const cached = _pending.get(key);
  if (cached && cached.expires > Date.now()) return cached.promise;

  const promise = factory()
    .then(result => { /* cache por _ttl */ return result; })
    .catch(err => { _pending.delete(key); throw err; });

  _pending.set(key, { promise, expires: Infinity });
  return promise;
}
```

**O que isso faz:** se duas chamadas idênticas acontecerem simultaneamente (ex: StrictMode), a segunda reutiliza a Promise da primeira. A API só é chamada uma vez.

### A camada de endpoints

```jsx
// api/endpoints.js — Uma função por endpoint. Legível e tipada.

export const listProperties = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api(`/properties/${query ? `?${query}` : ""}`);
};

export const login = (data) =>
  api("/auth/login/", { method: "POST", body: data, auth: false });

export const createBooking = (data) =>
  api("/bookings/", { method: "POST", body: data });

export const toggleFavorite = (propertyId) =>
  api("/favorites/toggle/", { method: "POST", body: { property: propertyId } });
```

---

## 10. Páginas: uma por uma

### Home.jsx — A página principal

**O que faz:** Busca + listagem de imóveis com múltiplos carrosséis.

**Estratégia de carregamento:**
1. Ao montar: busca TODOS os imóveis (loop paginado: `fetchAllProperties()`)
2. Agrupa por cidade (`groupByCity`): cada cidade vira um carrossel
3. Separa os top-rated: `avg_rating ≥ 4.5` → carrossel "Preferidos dos hóspedes"
4. Com busca ativa: busca paginada com filtros, grid em vez de carrosséis

**Estados de UI tratados:**
- `loading` → "Carregando imóveis…"
- `error` → "Não foi possível carregar os imóveis. O backend está rodando?"
- `empty` (busca sem resultados) → "Nenhum imóvel encontrado"
- `normal` → carrosséis ou grid

**Filtros implementados:**
- Cidade (busca textual)
- Check-in / Check-out (filtra disponibilidade)
- Hóspedes (capacidade)
- Preço mínimo / máximo
- Ordenação (por nota, preço, data)

### PropertyDetail.jsx — Detalhes do imóvel

**O que faz:** Exibe TUDO sobre um imóvel específico.

**Seções:**
1. **Galeria de fotos** — grid responsivo com a primeira foto em destaque
2. **Visão geral** — título, cidade, specs, badge "Preferido dos hóspedes"
3. **Anfitrião** — avatar com iniciais, nome, experiência
4. **Descrição** — truncada em 300 caracteres + modal "Mostrar mais"
5. **Comodidades** — grid de ícones, truncado em 10 itens + modal
6. **Calendário** — 2 meses visíveis, datas bloqueadas em cinza
7. **Avaliações** — carrossel com nota e comentários
8. **Mapa** — Leaflet estático com marcador
9. **Booking Widget (sidebar)** — datas, hóspedes, preço, pagamento

**Features avançadas:**
- **Sticky nav:** ao rolar, uma barra fixa aparece com links para as seções + preço + botão Reservar
- **Scroll spy:** detecta qual seção está visível e destaca o link correspondente
- **Modais:** descrição completa e comodidades em modais com overlay

### Login.jsx / Register.jsx — Autenticação

Formulários simples com:
- Estados: `email`, `password`, `error`, `submitting`
- Redirecionamento pós-login: host → `/painel-anfitriao`, guest → `/`
- Tratamento de erros da API

### GuestDashboard.jsx — Painel do hóspede

- Lista reservas do usuário (`GET /api/bookings/`)
- Filtros: Todas / Pendentes / Aprovadas / Recusadas
- Badge colorido de status
- Botão Cancelar (apenas pendentes)
- Link para o imóvel

### HostDashboard.jsx — Painel do anfitrião

Duas abas:

**Aba 1: Pedidos de reserva**
- Lista pedidos recebidos nos imóveis do anfitrião
- Filtros: Pendentes / Aprovadas / Recusadas / Todas
- Botões Aprovar ✓ e Recusar ✕
- Mostra: hóspede, datas, valor, cartão mascarado

**Aba 2: Meus imóveis**
- Lista imóveis do anfitrião
- Botão "+ Cadastrar imóvel"
- Editar (abre form inline)
- Desativar (soft delete — confirm antes)

### FavoritesPage.jsx — Favoritos

- Lista imóveis salvos como favoritos
- Usa o mesmo card de PropertyCard
- Botão de remover dos favoritos

---

## 11. Componentes reutilizáveis: o catálogo

### Header.jsx
- Logo "CommitStay" com link pra home
- Nav com links condicionais baseados no `user.role`
- Menu hamburguer em mobile
- Backdrop para fechar menu ao clicar fora
- Cleanup de estilos ao desmontar

### SearchBar.jsx
- 3 segmentos expansíveis: Onde, Quando, Quem
- Sugestões de cidades pré-definidas (12 cidades)
- Date picker com modo flexível (dias ou mês)
- Stepper de hóspedes (adultos, crianças, bebês, pets)
- Filtros avançados de preço
- Botão Limpar
- Lógica complexa de estado gerenciada com `useState` + `patch()`

### PropertyCard.jsx
- Card clicável (Link para `/imovel/:id`)
- Foto de capa com fallback para placeholder
- Badge "Preferido dos hóspedes" se rating ≥ 4.8
- Botão de favorito (condicional: logado/não logado)
- Preço formatado em R$ (pt-BR)
- Modo compacto (usado nos carrosséis)

### PropertyCarousel.jsx
- Scroll horizontal com botões ‹ ›
- `scrollBy` suave com 85% da largura visível
- Recebe array de properties e renderiza PropertyCard para cada uma

### BookingWidget.jsx
- Sidebar de reserva (sticky)
- Inputs de data com validação (não permite datas bloqueadas)
- Stepper de hóspedes (popover)
- Cálculo automático: noites × preço
- Formulário de pagamento (simulado)
- Tratamento de 3 estados de usuário: não logado, host, guest
- Mensagem de sucesso com redirecionamento

### Calendar.jsx
- Renderiza 2 meses lado a lado
- Dias bloqueados (reservados) aparecem cinzas e não clicáveis
- Seleção de intervalo (check-in → check-out)
- Navegação entre meses (‹ ›)

### MapView.jsx
- Leaflet MapContainer com tiles do OpenStreetMap
- Marcadores com preço (divIcon customizado)
- Popup com mini-card do imóvel
- FitBounds automático nos marcadores visíveis
- Contador de imóveis no mapa / sem coordenadas

### CardFavoriteButton.jsx / SaveFavoriteButton.jsx
- Verifica status do favorito ao montar (GET /favorites/check/:id)
- Toggle com POST /favorites/toggle/
- Animação de pulse ao favoritar
- Versão não logada: `<span>` com navigate para /login

### PropertyForm.jsx
- Formulário completo de CRUD de imóvel
- Campos: título, descrição, endereço, cidade, estado, preço, capacidade, fotos, comodidades
- Modo criação e edição (detecta pelo prop `propertyId`)

### StatusBadge.jsx
- Badge colorido baseado no status da reserva
- PENDING → amarelo, APPROVED → verde, REJECTED → vermelho, CANCELLED → cinza

---

## 12. CSS: as classes que dão vida

### Como o CSS está organizado

Todo o CSS está em um único arquivo: **`src/styles/global.css`**

**Convenções:**
- Classes com prefixo do componente: `.pc-` (PropertyCard), `.booking-` (BookingWidget)
- Utilitários globais: `.btn`, `.container`, `.loading`, `.form-error`
- CSS Modules não foi usado — classes são globais com prefixos para evitar conflitos

### Classes utilitárias principais

```css
.container          /* centraliza conteúdo, max-width 1200px */
.btn                /* botão base */
.btn-primary        /* botão azul (ação principal) */
.btn-outline        /* botão com borda */
.btn-reserve        /* botão de reserva (destaque) */
.btn-sm             /* botão pequeno */
.form-stack         /* formulário vertical */
.form-field         /* campo com label + input */
.form-error         /* mensagem de erro vermelha */
.loading            /* spinner de carregamento */
.empty-state        /* estado vazio centralizado */
```

### Responsividade

O Header tem menu hamburguer em telas < 768px. Os carrosséis usam scroll horizontal nativo. O grid de propriedades é responsivo via flexbox.

---

## 13. Glossário React para iniciantes

| Termo | Significado |
|-------|------------|
| **Componente** | Função que retorna JSX. Bloco de construção da UI. |
| **JSX** | Sintaxe que parece HTML dentro do JavaScript. |
| **Prop** | Parâmetro passado para um componente. Imutável. |
| **State** | Dados que mudam ao longo do tempo. Usa `useState`. |
| **Hook** | Função especial que "conecta" recursos do React. Ex: `useState`, `useEffect`. |
| **useState** | Hook que cria uma variável de estado + setter. |
| **useEffect** | Hook que executa código após o render. Para fetches, listeners, timers. |
| **useRef** | Hook que cria uma referência mutável que sobrevive a re-renders. |
| **useContext** | Hook que acessa um Context (estado global). |
| **useMemo** | Hook que memoriza um valor calculado. |
| **Context** | Mecanismo para compartilhar estado entre componentes sem props. |
| **Virtual DOM** | Representação em memória do DOM. React compara versões para otimizar. |
| **Reconciliação** | Processo de comparar Virtual DOM antigo com novo. |
| **SPA** | Single Page Application. Navegação sem recarregar a página. |
| **HMR** | Hot Module Replacement. Atualiza código sem perder o estado. |
| **StrictMode** | Modo de desenvolvimento que detecta bugs (executa effects 2x). |
| **Bundle** | Arquivo final empacotado (o que vai pra produção). |
| **Tree shaking** | Eliminação de código não usado no bundle final. |

---

> **Dica do professor:** React tem uma curva de aprendizado íngreme nos primeiros dias, mas depois que você entende o ciclo "state → render → effects", tudo faz sentido. Comece modificando componentes simples como `StatusBadge` ou `PropertyCard`. Depois vá para páginas como `Login`. Por último, mexa no `AuthContext` e no `App.jsx`. E lembre-se: o React DevTools (extensão do Chrome) é seu melhor amigo — ele mostra a árvore de componentes, props e state em tempo real.
