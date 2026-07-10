_This project has been created as part of the 42 curriculum by nmartin, yamartin, joudafke, braugust, maissat_

# Team organisatiom

## Roles

Product Owner (PO): _nmartin_
As a product owner, I decided with my teammates the project subject (checkers game).
I discuss with my team and decided wich modules and features were pertinents to do according to the project and our preferences.
With the Project Manager, we established roles and work repartitions between each members, priority order of modules and features and tracked their progression.
Also I regularly discuss with each members of the group to see their work, its compatility with the global code and to merge it with github.

Project Manager (PM) / Scrum Master: _joudafke_


Technical Lead / Architect: _maissat_


Developers: all team members



## Work repartition

## Technologies

## Modules

# Ft_checkmate

## Database _by nmartin_

For the database, we decided to use PostgreSQL for its pertinence to learn how to use it on the market, for its efficienty and for his usage of SQL langage.
To establish a communication between the database and the beackend, we decided to use a Object-Relational Mapping (ORM).
Using a ORM makes this task easier and more instinctive, its also a minor module.
The most pertinent ORM to learn on the market according to us is Prisma.
Prisma is synchronized with the database, he convert its code automaticcaly into SQL commands who are send to the database.

### Schematization

A well organized database is an important pillar to build a project like ours.
Before any code, visualize the needs of our project is important to get a global vision and getting a strong database structure.
I found a platform who make schema realization easier: draw.io.

![MCD schema](documents/MCD.drawio.png)

This schema is a Conceptual Data Model (CDM).
Its goal is to establish the differents tables of our database, the differents elements composing each and the relation between those tables.

![MLD schema](documents/MCD.drawio.png)

This schema is a Logical Data Model (LDM).
Its goal is to get a global vision closer to prisma's models.
It is similar to the CDM, adding differents constraints (unique, check, not null...) and foreign keys.

Those schemas make the implementation of prisma (and globally the entire code) easier and more intuitive.

### Interaction

As we said, Prisma permits an interaction between database and backend.
We need to start with a `schema.prisma` file who is a translation of our precedent schemas in code.
```generate schema.prisma file and nescessary files
npx prisma init --datasource-provider postgresql
```
Next, Prisma generates a `migraton.sql` file who is a translation of our code in SQL.
```generate migration.sql
npx prisma migrate dev --name add_constraints --create-only
```
We add our constraints in SQL langage and we send this `.sql` file to our database.
```apply migration.sql
npx prisma migrate dev
```
Our backend is now in communication with our database with functions like `find`,`update`,`delete`.

# Documentation
-- Database

https://www.youtube.com/watch?v=iHKE_4KeNWQ&list=PLjwdMgw5TTLXXpRlzDZq7d8iS6YXgnslt&pp=0gcJCdAEOCosWNin

https://youtu.be/qw--VYLpxG4?si=kX9xEN0Cez4mfPrK

https://www.postgresql.org/docs/

https://youtu.be/RebA5J-rlwg?si=_ajJHgS3vmEiO95y

https://www.prisma.io/docs

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

**braugust**
- Built the complete server-side game engine (`checkers.js`) with full French checkers rules
- Implemented the custom Node.js/socket.io server with dynamic room management
- Handled player authentication from database (JWT cookie verification)
- Implemented per-turn countdown timer with forfeit logic
- Integrated game results with the database (ELO calculation, match history)
- Containerized the application with Docker

### Resources & AI Usage

**Documentation used**
- https://socket.io/docs/v4/
- https://nextjs.org/docs
- https://react.dev/

**AI usage**
Claude (Anthropic) was used extensively by yamartin to help on web development for creating the game