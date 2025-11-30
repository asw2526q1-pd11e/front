# DailyDev - Frontend

Plataforma social per a desenvolupadors construïda amb React + TypeScript + Vite. Interfície estil Twitter/Reddit amb gestió de posts, comunitats i perfils d'usuari.

---

## Instal·lació i Execució

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Backend Django corrent a `http://127.0.0.1:8000`

### Instal·lació

```bash
# Clonar el repositori
git clone <repository-url>
cd front-asw-pd11e-dj

# Instal·lar dependències
npm install
```

### Executar en desenvolupament

```bash
# Iniciar servidor de desenvolupament
npm run dev

# L'aplicació s'obrirà a http://localhost:5173
```

### Build per a producció

```bash
# Generar build optimitzat
npm run build

# Preview del build
npm run preview
```

---

## Comandes d'Interès

```bash
# Lint del codi
npm run lint

# Compilar TypeScript
npx tsc -b

# Netejar caché de Vite
rm -rf node_modules/.vite

# Reinstal·lar dependències
rm -rf node_modules package-lock.json
npm install
```

---

## Estructura del Projecte

```
front-asw-pd11e-dj/
├── public/                          # Assets estàtics
│   └── vite.svg                     # Logo de Vite
│
├── src/
│   ├── assets/                      # Imatges i recursos
│   │   └── react.svg
│   │
│   ├── components/                  # Components React reutilitzables
│   │   ├── AuthProvider.tsx        # Provider del context d'autenticació
│   │   ├── CommunityCard.tsx       # Targeta de comunitat (estil programming.dev)
│   │   ├── Layout.tsx              # Layout principal amb Navbar
│   │   ├── Navbar.tsx              # Barra de navegació persistent
│   │   └── PostCard.tsx            # Targeta de post (estil Twitter)
│   │
│   ├── context/                     # React Context per a estat global
│   │   └── AuthContext.tsx         # Context d'autenticació (només definició)
│   │
│   ├── data/                        # Dades hardcodejades i constants
│   │   └── users.ts                # Usuaris amb API keys predefinides
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   └── useAuth.tsx             # Hook per accedir al context d'autenticació
│   │
│   ├── pages/                       # Pàgines de l'aplicació (rutes)
│   │   ├── ComunitatsPage.tsx      # Llistat de comunitats amb cerca
│   │   ├── LoginPage.tsx           # Pàgina de login amb selecció d'usuari
│   │   ├── PerfilPage.tsx          # Perfil d'usuari amb info del backend
│   │   └── PostsPage.tsx           # Feed principal de posts (timeline)
│   │
│   ├── services/                    # Capa de serveis (API calls)
│   │   └── api.ts                  # Funcions per comunicar-se amb el backend
│   │
│   ├── App.tsx                      # Component principal (legacy, no s'utilitza)
│   ├── main.tsx                     # Entry point de l'aplicació
│   ├── index.css                    # Estils globals + configuració Tailwind
│   └── App.css                      # Estils del component App (legacy)
│
├── eslint.config.js                 # Configuració d'ESLint
├── index.html                       # HTML base
├── package.json                     # Dependències i scripts
├── postcss.config.js                # Configuració de PostCSS per Tailwind
├── tailwind.config.js               # Configuració del tema Tailwind (colors rosa)
├── tsconfig.json                    # Configuració de TypeScript (base)
├── tsconfig.app.json                # Configuració de TypeScript per l'app
├── tsconfig.node.json               # Configuració de TypeScript per Vite
└── vite.config.ts                   # Configuració de Vite + proxies API

```

---

## Detall dels Arxius Principals

### `src/main.tsx`
Entry point de l'aplicació. Configura el router amb React Router v6, envolta l'app amb AuthProvider i defineix les rutes protegides.

### `src/services/api.ts`
Centralitza totes les crides al backend Django:
- `fetchPosts()` - Obté tots els posts
- `fetchCommunities()` - Obté totes les comunitats
- `fetchUserProfile()` - Obté el perfil de l'usuari autenticat
- `fetchPostComments()` - Obté comentaris d'un post
- Utilitza header `X-API-Key` per autenticació

### `src/components/AuthProvider.tsx`
Component Provider que gestiona l'estat d'autenticació:
- Guarda l'usuari actual a localStorage
- Carrega l'usuari al iniciar l'aplicació
- Proporciona funcions `login()` i `logout()`
- Verifica l'API key contra el backend

### `src/hooks/useAuth.tsx`
Hook personalitzat per accedir al context d'autenticació:
```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```

### `src/data/users.ts`
Defineix els usuaris disponibles amb les seves API keys del backend Django. Cada usuari té:
- `id`, `name`, `email`, `apiKey`, `avatar`

### `vite.config.ts`
Configuració del servidor de desenvolupament amb proxies per evitar problemes de CORS:
- `/api/accounts` → `http://127.0.0.1:8000/api/accounts`
- `/api/communities` → `http://127.0.0.1:8000/api/communities`
- `/api` → `http://127.0.0.1:8000/api/blog/api`

### `tailwind.config.js`
Defineix el tema de colors personalitzat (paleta rosa):
```javascript
roseTheme: {
  light: "#ffe4f1",
  DEFAULT: "#ff9acb",
  dark: "#e75480",
  accent: "#ffb7d5",
  soft: "#ffd6e9"
}
```

---

## Components i Pàgines

### Components (`src/components/`)

**AuthProvider.tsx**
- Gestiona l'estat global d'autenticació
- Sincronitza amb localStorage
- Verifica API keys contra el backend

**Navbar.tsx**
- Barra de navegació persistent (sticky)
- Logo clicable que porta a posts
- Links: Posts, Comunitats, Perfil
- Dropdown amb info d'usuari i logout

**Layout.tsx**
- Wrapper que inclou Navbar + Outlet per rutes filles
- Proporciona estructura consistent a totes les pàgines


## Dependències Principals

**Producció:**
- `react` (19.2.0) - Llibreria UI
- `react-dom` (19.2.0) - Renderitzat al DOM
- `react-router-dom` (6.30.2) - Routing
- `axios` (1.13.2) - HTTP client (no utilitzat actualment)
- `@tanstack/react-query` (5.90.11) - Cache de dades (no utilitzat actualment)

**Desenvolupament:**
- `vite` (7.2.4) - Bundler i dev server
- `typescript` (5.9.3) - Tipat estàtic
- `tailwindcss` (3.4.0) - Framework CSS
- `eslint` (9.39.1) - Linter de codi
- `@vitejs/plugin-react` (5.1.1) - Plugin de React per Vite
