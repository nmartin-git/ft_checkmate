_This project has been created as part of the 42 curriculum by nmartin, yamartin, joudafke, braugust, maissat_

# Team organisation

## Roles

**Product Owner (PO):** _nmartin_
As a product owner, I decided with my teammates the project subject (checkers game).
I discuss with my team and decided which modules and features were pertinent to do according to the project and our preferences.
With the Project Manager, we established roles and work repartitions between each members, priority order of modules and features and tracked their progression.
Also I regularly discuss with each members of the group to see their work, its compatibility with the global code and to merge it with github.

**Project Manager (PM) / Scrum Master:** _joudafke_

**Technical Lead / Architect:** _maissat_
As technical lead, I was responsible for the overall front-end architecture and technical choices of the project.
I chose the front-end stack (Next.js, TypeScript, React, Tailwind CSS, shadcn/ui) and set up the App Router structure, deciding how pages, layouts, and locales would be organized across the codebase.
I defined the visual direction (DA) of the site and made sure it stayed consistent across every page, so teammates building new features had clear styling conventions to follow.
I built the core shared components (Topbar, Footer, modals) that the rest of the app depends on.

**Developers:** all team members

## Work repartition

## Technologies

## Modules

---

# Ft_checkmate

## Database _by nmartin_

For the database, we decided to use PostgreSQL for its pertinence to learn how to use it on the market, for its efficiency and for its usage of SQL language.
To establish a communication between the database and the backend, we decided to use a Object-Relational Mapping (ORM).
Using an ORM makes this task easier and more instinctive, it's also a minor module.
The most pertinent ORM to learn on the market according to us is Prisma.
Prisma is synchronized with the database, it converts its code automatically into SQL commands which are sent to the database.

### Schematization

A well organized database is an important pillar to build a project like ours.
Before any code, visualizing the needs of our project is important to get a global vision and getting a strong database structure.
I found a platform which makes schema realization easier: draw.io.

![MCD schema](documents/MCD.drawio.png)

This schema is a Conceptual Data Model (CDM).
Its goal is to establish the different tables of our database, the different elements composing each and the relation between those tables.

![MLD schema](documents/MLD.drawio.png)

This schema is a Logical Data Model (LDM).
Its goal is to get a global vision closer to prisma's models.
It is similar to the CDM, adding different constraints (unique, check, not null...) and foreign keys.

Those schemas make the implementation of Prisma (and globally the entire code) easier and more intuitive.

### Interaction

As we said, Prisma permits an interaction between database and backend.
We need to start with a `schema.prisma` file which is a translation of our precedent schemas in code.

```bash
npx prisma init --datasource-provider postgresql
```

Next, Prisma generates a `migration.sql` file which is a translation of our code in SQL.

```bash
npx prisma migrate dev --name add_constraints --create-only
```

We add our constraints in SQL language and we send this `.sql` file to our database.

```bash
npx prisma migrate dev
```

Our backend is now in communication with our database with functions like `find`, `update`, `delete`.

---

## Infrastructure & Deployment _by braugust_

### Overview

The infrastructure ensures the entire application can be launched with a single command, runs securely over HTTPS, and connects all services together reliably.

### Docker Setup

The application is fully containerized using Docker Compose with three services communicating over an internal network:

- **db** — PostgreSQL 16 database with health checks to ensure readiness before dependent services start
- **frontend** — Next.js application with automatic Prisma migration on startup
- **nginx** — Reverse proxy handling HTTPS termination

```bash
docker compose up --build
```

This single command builds all images, applies database migrations, and starts the full stack.

**Key implementation details:**
- Prisma `migrate deploy` runs automatically at container startup via the `CMD` instruction in the Dockerfile
- The generated Prisma client is copied from `packages/node_modules/.prisma` to `/app/node_modules/.prisma` to ensure Next.js can locate it at runtime
- Health checks on the `db` service prevent the frontend from starting before PostgreSQL is ready
- A `prisma.config.ts` placed at `packages/` level provides the `datasource.url` required by Prisma v7 for migrations

### HTTPS with Nginx

A self-signed SSL certificate is generated locally for `localhost`:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/localhost.key \
  -out nginx/certs/localhost.crt \
  -subj "/CN=localhost"
```

Nginx listens on ports 80 and 443:
- HTTP (port 80) redirects automatically to HTTPS
- HTTPS (port 443) proxies requests to the Next.js frontend on port 3000 (internal Docker network only)

This satisfies the project requirement that HTTPS must be used everywhere on the backend.

### Environment Configuration

Credentials are stored in a local `.env` file (never committed) following the `.env.example` template:

```env
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
DATABASE_URL=postgresql://USER:PASSWORD@db:5432/ft_checkmate
RESEND_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://localhost
```

### Module claimed

| Module | Type | Points |
|--------|------|--------|
| Deployment with containerization (Docker) | Mandatory | — |

---

## Internationalization (i18n) _by braugust_

### Overview

The application supports three languages: French (default), English, and Arabic, satisfying the **Minor: Support for multiple languages** module requirement.

### Implementation

The i18n system is built with **next-intl**, integrated directly into the Next.js App Router.

**Architecture:**
```
messages/
├── fr.json    ← French translations
├── en.json    ← English translations
└── ar.json    ← Arabic translations
i18n.ts        ← next-intl configuration
middleware.ts  ← locale detection and URL routing
```

All routes are prefixed with the locale:
```
/fr/profile    ← French
/en/profile    ← English
/ar/profile    ← Arabic
```

The middleware handles two responsibilities simultaneously:
1. **Auth protection** — redirects unauthenticated users away from protected routes
2. **Locale routing** — detects the locale from the URL and serves the correct translations

**Language switcher** — three buttons (FR / EN / AR) in the navbar allow instant language switching by replacing the locale prefix in the current URL.

**Translated components:**
- Topbar (navigation labels, game title, PLAY button)
- Login and Register modals (all fields, labels, Google OAuth button)
- Notification modal
- Profile page (match history, ELO, friends sections)
- Parameters page (birthdate picker, checkboxes, save button)
- Home page (game card)

### Module claimed

| Module | Type | Points |
|--------|------|--------|
| Support for multiple languages (at least 3 languages) | Minor | 1 pt |

---

## Game _by yamartin & braugust_

### Overview

Ft_checkmate implements a fully functional online checkers game (jeu de dames) playable in real-time between two players through a web browser.

### Game Features

The checkers game was built from scratch using React and Next.js on the client side, with a custom Node.js server handling the WebSocket connections and game logic.

**Board & Pieces**
- 8×8 checkerboard with alternating dark and light squares
- Black pieces (player 1) start on the first 3 rows, white pieces (player 2) on the last 3 rows
- Visual distinction between regular pieces and kings (gold border)

**Game Rules (French checkers)**
- Diagonal movement only, on dark squares
- Black pieces move downward, white pieces move upward
- Mandatory capture (prise forcée): if a capture is available, the player must take it
- Multi-capture chains: after a capture, if another capture is possible, the player must continue
- King promotion: a piece reaching the last row becomes a king (dame)
- Kings can move and capture in all 4 diagonal directions
- Long-distance king movement: kings can move multiple squares in one direction
- Long-distance king capture: kings can jump over an enemy piece anywhere on the diagonal

**Multiplayer & Real-time**
- Two players connect to the same game room via WebSocket (socket.io)
- Each player is assigned a color (black or white) from the database
- Real-time board synchronization: every move is instantly reflected on both screens
- Server-side move validation: the server verifies every move using `checkers.js` before applying it
- Turn enforcement: a player cannot move if it is not their turn
- 30-second timer per turn: if the timer runs out, the player loses by forfeit
- Graceful disconnection handling

**Win / End conditions**
- A player wins when the opponent has no more legal moves
- Draw by material (king vs king with no progress)
- Draw by inactivity (10 turns without a capture)
- Timeout forfeit

**UI & UX**
- Click to select a piece, click destination to move
- Selected piece highlighted with a yellow outline
- Turn indicator and countdown timer displayed
- Piece capture counters for both players
- Game over screen with winner announcement

### Technical Implementation

**Client side** (`src/app/[locale]/game/[gameId]/page.tsx`, `src/components/OnlineGameClient.tsx`) — _by yamartin_
- Built with React (Next.js App Router), TypeScript, Tailwind CSS
- `useState` for board state, selected piece, turn, timer, eaten counters
- `useEffect` with socket.io-client for real-time WebSocket connection
- Click handler validates piece ownership before sending move to server
- Receives `init`, `state`, `timer`, `gameover`, `error` events from server

**Server side** (`server.js`, `src/lib/checkers.js`) — _by braugust_
- Custom Next.js server with socket.io integrated on the same HTTP server
- Dynamic game rooms identified by `gameId` from the database
- Player color assigned from database (not by connection order)
- `checkers.js`: complete game engine — `legalMoves`, `applyMove`, `isDrawByMaterial`, `makeFreshBoard`
- Per-turn countdown timer with automatic forfeit on timeout
- Results pushed to database after each game (ELO calculation)
- Maximum 2 players per room enforced server-side

### Modules claimed

| Module | Type | Points | Implemented by |
|--------|------|--------|----------------|
| Implement a complete web-based game | Major | 2 pts | yamartin, braugust |
| Remote players (real-time multiplayer) | Major | 2 pts | yamartin, braugust |
| Real-time features using WebSockets | Major | 2 pts | yamartin, braugust |

**Total: 6 points**

### Individual Contributions

**yamartin**
- Designed and built the complete checkers game logic on the client side (React/Next.js)
- Implemented board rendering, piece selection, move validation (diagonal movement, mandatory capture, multi-capture chains, king promotion, long-distance king movement and capture)
- Integrated socket.io client for real-time communication with the server
- Built the game UI: turn indicator, timer display, piece counters, win screen, replay button
- Learned React, Next.js, TypeScript, WebSockets from scratch during this project

**braugust** _(server-side game engine, infrastructure & i18n)_
- Built the complete server-side game engine (`checkers.js`) with full French checkers rules
- Implemented the custom Node.js/socket.io server with dynamic room management
- Handled player authentication from database (JWT cookie verification)
- Implemented per-turn countdown timer with forfeit logic
- Integrated game results with the database (ELO calculation, match history)
- Set up the complete Docker infrastructure (PostgreSQL, Next.js, Nginx) with `docker compose up --build` as the single launch command
- Configured HTTPS with self-signed SSL certificates via Nginx reverse proxy
- Solved Prisma v7 migration compatibility in Docker (prisma.config.ts placement, .prisma client copy between node_modules)
- Implemented full internationalization (FR/EN/AR) using next-intl with locale-aware routing and language switcher
- Translated all user-facing text across the application (navbar, modals, profile, parameters pages)
- Set up ngrok for external HTTPS access during evaluations

 **maissat** _(front-end architecture, UI/UX & core layout components)_

-Chose and set up the front-end stack (Next.js/TypeScript/React, Tailwind CSS, shadcn/ui) and structured the App routing.
-Designed and implemented the overall visual direction (DA) of the site applied across all pages
-Built the Topbar component: navigation, game status display, notification bell, login/logout state handling
-Built the Footer component
-Built the LoginModal
-Built the RegisterModal for new account creation
-Built the NotifModal for displaying user notifications

---

## Avatar System _by braugust_

### Overview

Users can personalize their profile picture, either by uploading their own image or by choosing from a set of built-in avatars. Once changed, the new avatar propagates instantly across the entire application without any manual refresh.

### Features

**Custom upload**
- Upload an image directly from the user's computer
- Live preview before confirming the change
- Confirm or cancel the selection

**Built-in avatar gallery**
- 5 default avatars shipped as application assets (`public/avatars/`)
- Stylized checkers kings matching the four club colors (Alliance, Assembly, Federation, Order) plus a neutral one
- Single-click selection, currently selected avatar highlighted

**Validation & security** (server side, `src/app/api/avatar/route.ts`)
- Allowed formats only: PNG, JPG, JPEG, WEBP
- Maximum file size: 2 MB
- Corrupted file detection: the binary signature (magic number) of each upload is verified, so a renamed non-image file is rejected
- Failed uploads never leave the profile in an inconsistent state — the database is only updated once the file is safely written
- Clear, translated error messages returned to the user (unsupported format, file too large, corrupted file, network error)

### Technical Implementation

**Single reusable component** (`src/components/ui/Avatar.tsx`)

The avatar is rendered by one single component reused everywhere it appears — no duplicated UI logic:

---

# Instructions

## Prerequisites

- Docker & Docker Compose installed
- Git

## Setup

1. Clone the repository:
```bash
git clone https://github.com/nmartin-git/ft_checkmate.git
cd ft_checkmate
```

2. Create your `.env` file from the template:
```bash
cp .env.example .env
```

3. Fill in the required values in `.env`:
```env
POSTGRES_DB=ft_checkmate
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgresql://your_user:your_password@db:5432/ft_checkmate
RESEND_API_KEY=your_resend_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=a_long_random_string
NEXTAUTH_URL=https://localhost
```

4. Launch the full stack:
```bash
docker compose up --build
```

5. Open your browser at [https://localhost](https://localhost)

> The browser will show a security warning for the self-signed certificate — click "Advanced" then "Proceed to localhost" to continue.

## External access (evaluations)

To share the app over the internet via HTTPS:

```bash
# Install ngrok
ngrok config add-authtoken YOUR_TOKEN
ngrok http 443 --scheme https
```

Share the generated URL (e.g. `https://abc123.ngrok-free.app`) with the evaluator.

---

# Documentation

## Database
- https://www.youtube.com/watch?v=iHKE_4KeNWQ&list=PLjwdMgw5TTLXXpRlzDZq7d8iS6YXgnslt
- https://youtu.be/qw--VYLpxG4?si=kX9xEN0Cez4mMprK
- https://www.postgresql.org/docs/
- https://youtu.be/RebA5J-rlwg?si=_ajJHgS3vmEiO95y
- https://www.prisma.io/docs

## Infrastructure & i18n
- https://docs.docker.com/compose/
- https://nginx.org/en/docs/
- https://next-intl-docs.vercel.app/

## Game
- https://socket.io/docs/v4/
- https://nextjs.org/docs
- https://react.dev/

## AI Usage

Claude (Anthropic) was used by multiple team members throughout the project:

- **braugust** — used Claude to set up Docker infrastructure, configure Nginx HTTPS, solve Prisma v7 migration issues in Docker, and implement the next-intl internationalization system
- **yamartin** — used Claude extensively to help with web development for creating the game client (React, Next.js, TypeScript, WebSockets)

All AI-generated content was reviewed, tested, and understood by the team members before integration.