_This project has been created as part of the 42 curriculum by nmartin, yamartin, joudafke, braugust, maissat_

# Ft_checkmate

## Description

Ft_checkmate is a real-time multiplayer checkers game (jeu de dames) built as a full-stack web application. Two players can compete against each other online from separate computers, with full French checkers rules enforced server-side.

**Key features:**
- Real-time online multiplayer checkers game
- User authentication (email/password, Google OAuth, 2FA)
- User profiles with ELO ranking, match history, and friends system
- Leaderboard and matchmaking system
- In-game chat
- Internationalization (French, English, Arabic)
- Full containerization with Docker

---

## Team Organisation

### Roles

**Product Owner (PO):** _nmartin_
As a product owner, I decided with my teammates the project subject (checkers game).
I discussed with my team and decided which modules and features were pertinent to do according to the project and our preferences.
With the Project Manager, we established roles and work repartitions between each member, priority order of modules and features and tracked their progression.
I also regularly discussed with each member of the group to see their work, its compatibility with the global code and to merge it with GitHub.

**Project Manager (PM) / Scrum Master:** _joudafke_

**Technical Lead / Architect:** _maissat_
As technical lead, I was responsible for the overall front-end architecture and technical choices of the project.
I chose the front-end stack (Next.js, TypeScript, React, Tailwind CSS, shadcn/ui) and set up the App Router structure, deciding how pages, layouts, and locales would be organized across the codebase.
I defined the visual direction (DA) of the site and made sure it stayed consistent across every page, so teammates building new features had clear styling conventions to follow.
I built the core shared components (Topbar, Footer, modals) that the rest of the app depends on.

**Developers:** all team members

### Work Repartition

| Member | Role | Main contributions |
|--------|------|--------------------|
| nmartin | PO + Developer | Database schema, Prisma ORM, project management |
| joudafke | PM + Developer | Authentication (login, register, OAuth, 2FA), backend routes |
| maissat | Tech Lead + Developer | Front-end architecture, UI/UX, shared components |
| braugust | Developer | Server-side game engine, Docker, HTTPS, i18n, avatar system |
| yamartin | Developer | Client-side game logic, WebSocket client, game UI |

### Project Management

- Communication via Discord (daily updates, code reviews, blockers)
- Work organized by feature branches on GitHub (`database`, `front`, `game`, `brice`, etc.)
- Regular syncs between members before merging branches
- GitHub used for version control with meaningful commit messages per member

---

## Technical Stack

### Frontend
- **Next.js 16** (App Router) — full-stack React framework
- **React** — UI component library
- **TypeScript** — static typing
- **Tailwind CSS** — utility-first CSS framework
- **shadcn/ui** — reusable UI components
- **next-intl** — internationalization (FR/EN/AR)
- **socket.io-client** — WebSocket client for real-time game

### Backend
- **Next.js API Routes** — REST API endpoints
- **Node.js custom server** — socket.io WebSocket server integrated with Next.js
- **socket.io** — real-time bidirectional communication
- **NextAuth.js** — authentication (session management, OAuth)
- **Prisma v7** — ORM for database interaction
- **argon2** — password hashing

### Database
- **PostgreSQL 16** — relational database
- Chosen for its reliability, SQL standard compliance, and strong ecosystem

### Infrastructure
- **Docker & Docker Compose** — full containerization
- **Nginx** — reverse proxy with HTTPS termination
- **ngrok** — external HTTPS tunnel for evaluations

---

## Database Schema

### Tables

**User**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String (unique) | User email |
| username | String (unique, max 12) | Display name |
| password | String? | Hashed with argon2 |
| birthdate | Date? | Optional |
| avatar_url | String? | Profile picture |
| a2f_enable | Boolean | 2FA enabled |
| club | Enum | Assembly / Order / Federation / Alliance |
| elo | Int | ELO rating (default 800) |
| is_online | Boolean | Online presence |

**Game**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| date | DateTime | Game start time |
| white_player_id | UUID | Foreign key → User |
| black_player_id | UUID | Foreign key → User |
| white_player_elo | Int | ELO at game start |
| black_player_elo | Int | ELO at game start |
| result | Enum? | WHITE / BLACK / DRAW |

**Move**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| game_id | UUID | Foreign key → Game |
| move_number | Int | Order in game |
| initial_position | SmallInt | From position |
| new_position | SmallInt | To position |
| time_to_move | Int | Time taken (seconds) |

**Friends**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key → User |
| friend_id | UUID | Foreign key → User |
| status | Enum | PENDING / ACCEPTED / REFUSED / GAME_REQUESTED |

**Chat** (in-game)
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| game_id | UUID | Foreign key → Game |
| author_user_id | UUID | Foreign key → User |
| message | String (max 140) | Message content |
| date | DateTime | Timestamp |

**DirectMessage**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| sender_id | UUID | Foreign key → User |
| receiver_id | UUID | Foreign key → User |
| message | String (max 140) | Message content |
| date | DateTime | Sent at |
| read_at | DateTime? | Read receipt |

---

## Features List

### Authentication _by joudafke_
- User registration with email and password (hashed with argon2)
- User login with session management (NextAuth.js)
- Google OAuth 2.0 login
- Two-factor authentication (2FA) with recovery codes
- Protected routes — unauthenticated users are redirected

### User Management _by joudafke & nmartin_
- User profile page with avatar, username, ELO, club, birthdate
- Match history (results, opponents, dates)
- ELO chart (progression over time)
- Friends system — send/accept/refuse friend requests, see online status
- Parameters page — update profile information, enable/disable 2FA, change avatar
- Leaderboard — ranking of all players by ELO

### Avatar System _by braugust_
- Upload a custom image (PNG, JPG, JPEG, WEBP — max 2MB)
- Binary signature validation (magic number check) to reject disguised files
- Choose from 5 built-in avatars (stylized checkers kings per club)
- Live preview before confirming
- Avatar propagates instantly across the entire app without refresh

### Game _by yamartin & braugust_
- Complete French checkers game playable in real-time between two players
- Full rules: diagonal movement, mandatory capture, multi-capture chains, king promotion, long-distance king movement and capture
- Online matchmaking — players are matched and a game room is created
- Local mode — two players on the same device
- 30-second timer per turn with automatic forfeit on timeout
- Draw conditions: king vs king with no progress, 10 turns without capture
- In-game chat

### Real-time & WebSockets _by yamartin & braugust_
- Custom Node.js server with socket.io integrated on the same port as Next.js
- Dynamic game rooms identified by `gameId`
- Server-side move validation via `checkers.js` game engine
- Real-time board sync between both players
- Turn enforcement — a player cannot act if it is not their turn
- Graceful disconnection handling

### Infrastructure _by braugust_
- Full Docker Compose setup (PostgreSQL, Next.js, Nginx)
- Single launch command: `docker compose up --build`
- HTTPS with self-signed SSL certificate via Nginx reverse proxy
- Automatic Prisma migrations on container startup
- ngrok tunnel for external HTTPS access during evaluations

### Internationalization _by braugust_
- 3 languages: French (default), English, Arabic
- Locale-aware routing (`/fr/`, `/en/`, `/ar/`)
- Language switcher in navbar
- All user-facing text translated (navbar, modals, profile, parameters)

### Front-end Architecture _by maissat_
- Next.js App Router structure with locale-aware layout
- Consistent visual direction (DA) across all pages
- Topbar with navigation, game status, notification bell, login/logout
- Footer
- Login and Register modals
- Notification modal

---

## Modules

| Module | Category | Type | Points | Implemented by |
|--------|----------|------|--------|----------------|
| Use a framework for both frontend and backend (Next.js) | Web | Major | 2 pts | maissat |
| Implement real-time features using WebSockets | Web | Major | 2 pts | yamartin, braugust |
| Use an ORM for the database (Prisma) | Web | Minor | 1 pt | nmartin |
| Standard user management and authentication | User Management | Major | 2 pts | joudafke |
| Game statistics and match history | User Management | Minor | 1 pt | joudafke, nmartin |
| Implement remote authentication with OAuth 2.0 (Google) | User Management | Minor | 1 pt | joudafke |
| Implement a complete 2FA system | User Management | Minor | 1 pt | joudafke |
| Implement a complete web-based game | Gaming | Major | 2 pts | yamartin, braugust |
| Remote players (real-time multiplayer) | Gaming | Major | 2 pts | yamartin, braugust |
| Support for multiple languages (FR/EN/AR) | Accessibility & i18n | Minor | 1 pt | braugust |

**Total: 15 points**

---

## Database _by nmartin_

For the database, we decided to use PostgreSQL for its pertinence to learn how to use it on the market, for its efficiency and for its usage of SQL language.
To establish a communication between the database and the backend, we decided to use an Object-Relational Mapping (ORM).
Using an ORM makes this task easier and more instinctive, it's also a minor module.
The most pertinent ORM to learn on the market according to us is Prisma.
Prisma is synchronized with the database, it converts its code automatically into SQL commands which are sent to the database.

### Schematization

A well organized database is an important pillar to build a project like ours.
Before any code, visualizing the needs of our project is important to get a global vision and a strong database structure.

![MCD schema](documents/MCD.drawio.png)

This schema is a Conceptual Data Model (CDM).
Its goal is to establish the different tables of our database, the different elements composing each and the relation between those tables.

![MLD schema](documents/MLD.drawio.png)

This schema is a Logical Data Model (LDM).
Its goal is to get a global vision closer to Prisma's models.
It is similar to the CDM, adding different constraints (unique, check, not null...) and foreign keys.

### Interaction

```bash
npx prisma init --datasource-provider postgresql
npx prisma migrate dev --name add_constraints --create-only
npx prisma migrate dev
```

Our backend is now in communication with our database with functions like `find`, `update`, `delete`.

---

## Infrastructure & Deployment _by braugust_

The infrastructure ensures the entire application can be launched with a single command, runs securely over HTTPS, and connects all services together reliably.

### Docker Setup

Three services communicating over an internal Docker network:
- **db** — PostgreSQL 16 with health checks
- **frontend** — Next.js with automatic Prisma migration on startup
- **nginx** — Reverse proxy handling HTTPS termination

```bash
docker compose up --build
```

**Key implementation details:**
- Prisma `migrate deploy` runs automatically at container startup
- Health checks on `db` prevent the frontend from starting before PostgreSQL is ready
- A `prisma.config.ts` at `packages/` level provides the `datasource.url` required by Prisma v7

### HTTPS with Nginx

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/localhost.key \
  -out nginx/certs/localhost.crt \
  -subj "/CN=localhost"
```

- HTTP (port 80) redirects to HTTPS
- HTTPS (port 443) proxies to Next.js on port 3000 (internal network only)

---

## Internationalization _by braugust_

3 languages supported: French (default), English, Arabic — built with **next-intl**.

```
messages/
├── fr.json
├── en.json
└── ar.json
```

All routes are prefixed with the locale (`/fr/`, `/en/`, `/ar/`). The middleware handles auth protection and locale routing simultaneously. Language switcher available in the navbar.

---

## Game _by yamartin & braugust_

### Client side — _yamartin_ (`src/components/OnlineGameClient.tsx`)

Built with React, TypeScript, Tailwind CSS:
- `useState` for board state, selected piece, turn, timer, eaten piece counters
- `useEffect` with socket.io-client for real-time WebSocket connection
- `handleClick` manages piece selection and sends moves to the server
- Receives `init`, `state`, `timer`, `gameover`, `error` events from the server
- Board rendered with double `.map()` over the 8×8 array
- Pieces represented as numbers: 0=empty, 1=black pawn, 2=white pawn, 3=black king, 4=white king

### Server side — _braugust_ (`server.js`, `src/lib/checkers.js`)

- Custom Node.js server with socket.io on the same HTTP server as Next.js
- Dynamic game rooms by `gameId` from the database
- Player color assigned from database (JWT cookie verification)
- `checkers.js`: complete game engine (`legalMoves`, `applyMove`, `isDrawByMaterial`, `makeFreshBoard`)
- 30-second countdown timer per turn with automatic forfeit
- Results pushed to database (ELO calculation, match history)
- Maximum 2 players per room enforced server-side

---

## Individual Contributions

### nmartin — Product Owner & Developer
- Defined project scope, modules, and feature priorities
- Designed and implemented the database schema (PostgreSQL + Prisma)
- Managed GitHub merges and team coordination
- Implemented game statistics backend (ELO calculator, match history)

### joudafke — Project Manager & Developer
- Coordinated team meetings, tracked deadlines, managed blockers
- _(backend contributions to be completed)_

### maissat — Technical Lead & Developer
- Chose and set up the front-end stack (Next.js, TypeScript, React, Tailwind CSS, shadcn/ui)
- Designed and implemented the overall visual direction across all pages
- Built the Topbar, Footer, LoginModal, RegisterModal, NotifModal
- Structured the App Router with locale-aware layouts

### braugust — Developer
- Built the complete server-side game engine (`checkers.js`) with full French checkers rules
- Implemented the custom Node.js/socket.io server with dynamic room management
- Handled player authentication via JWT cookie verification
- Implemented per-turn countdown timer with forfeit logic
- Integrated game results with the database (ELO calculation, match history)
- Set up the complete Docker infrastructure (PostgreSQL, Next.js, Nginx)
- Configured HTTPS with self-signed SSL certificates via Nginx
- Solved Prisma v7 migration compatibility in Docker
- Implemented full i18n (FR/EN/AR) with next-intl and locale-aware routing
- Built the avatar system with custom upload and built-in gallery
- Set up ngrok for external HTTPS access during evaluations

### yamartin — Developer
- Built the complete checkers game client from scratch (React/Next.js)
- Implemented board rendering, piece selection, and click handler logic
- Integrated socket.io client for real-time WebSocket communication
- Built the game UI: turn indicator, timer, piece counters, win/loss screen, replay button
- Learned React, Next.js, TypeScript, and WebSockets from scratch during this project

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

```bash
ngrok config add-authtoken YOUR_TOKEN
ngrok http 443 --scheme https
```

Share the generated URL with the evaluator.

---

# Resources

## Database
- https://www.postgresql.org/docs/
- https://www.prisma.io/docs

## Infrastructure & i18n
- https://docs.docker.com/compose/
- https://nginx.org/en/docs/
- https://next-intl-docs.vercel.app/

## Game & Real-time
- https://socket.io/docs/v4/
- https://nextjs.org/docs
- https://react.dev/

## Authentication
- https://next-auth.js.org/

## AI Usage
AI tools were used by some team members as a learning and debugging during development.