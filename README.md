### RENDER: https://front-hqro.onrender.com/
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
│   │   ├── CreatePostModal.tsx     # Modal per crear nous posts
│   │   ├── EditPostModal.tsx       # Modal per editar posts existents
│   │   ├── EditPerfilPage.tsx      # Componente per editar perfil d'usuari
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
│   │   ├── PostDetailPage.tsx      # Pàgina de detall d'un post amb comentaris
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
