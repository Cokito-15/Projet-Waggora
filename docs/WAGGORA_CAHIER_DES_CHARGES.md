# WAGGORA — CAHIER DES CHARGES TECHNIQUE ET PRODUIT
### Version 1.0 — Confidentiel

---

> **Waggora** est une API B2B d'engagement compétitif destinée aux studios de jeux mobiles Casual et Hybrid Casual.  
> Elle transforme n'importe quel jeu existant en expérience compétitive sans modifier son gameplay principal.

---

## TABLE DES MATIÈRES

1. [Vision Produit](#1-vision-produit)
2. [Proposition de Valeur](#2-proposition-de-valeur)
3. [Architecture Technique](#3-architecture-technique)
4. [Architecture Cloud](#4-architecture-cloud)
5. [Diagrammes Système](#5-diagrammes-système)
6. [Schéma Base de Données](#6-schéma-base-de-données)
7. [Schéma API REST Complet](#7-schéma-api-rest-complet)
8. [Documentation Swagger](#8-documentation-swagger)
9. [Endpoints Détaillés](#9-endpoints-détaillés)
10. [Structure Backend](#10-structure-backend)
11. [Structure Frontend](#11-structure-frontend)
12. [Dashboard Studio](#12-dashboard-studio)
13. [Dashboard Admin Waggora](#13-dashboard-admin-waggora)
14. [UX & Wireframes](#14-ux--wireframes)
15. [Intégration Unity](#15-intégration-unity)
16. [Intégration Unreal Engine](#16-intégration-unreal-engine)
17. [Sécurité](#17-sécurité)
18. [Scalabilité](#18-scalabilité)
19. [Plan MVP](#19-plan-mvp)
20. [Roadmap V2](#20-roadmap-v2)
21. [Estimation Développement](#21-estimation-développement)
22. [Estimation Coûts](#22-estimation-coûts)
23. [Pitch Studios Mobiles](#23-pitch-studios-mobiles)
24. [Pitch Investisseurs](#24-pitch-investisseurs)
25. [Modèle Économique](#25-modèle-économique)

---

## 1. VISION PRODUIT

### 1.1 Problème identifié

Les studios de jeux Casual et Hybrid Casual font face à une triple pression :

| Problème | Impact |
|----------|--------|
| Rétention J+1 inférieure à 40% en moyenne | Acquisition coûteuse non rentabilisée |
| LTV (Lifetime Value) faible sur les Casual | Dépendance aux ad-revenues volatiles |
| Absence de couche sociale/compétitive | Désengagement rapide des joueurs |
| Temps de développement d'une feature compétitive : 6-18 mois | Impossible pour la majorité des studios |

Les grandes plateformes de compétition (GameBattles, FACEIT, Skillz) ciblent les jeux hardcore ou nécessitent une refonte complète du jeu. Aucune solution simple n'existe pour le segment Casual.

### 1.2 Solution Waggora

Waggora est une **couche compétitive plug-and-play** qui s'intègre en quelques jours via SDK/API.

```
AVANT WAGGORA          APRÈS WAGGORA
─────────────          ──────────────
Jeu Casual             Jeu Casual
│                      │
└─ Gameplay seul        ├─ Gameplay (inchangé)
                        └─ [Bouton WAGGORA]
                               │
                               ├─ Défis Directs
                               ├─ Défis Asynchrones
                               ├─ Wallet Jetons
                               ├─ Marketplace
                               └─ Classement
```

### 1.3 Positionnement marché

```
                    HARDCORE
                        │
          FACEIT         │    GameBattles
          Battlefy ──────┼──── Toornament
                         │
    ─────────────────────┼──────────────────
    CASUAL               │              
                         │
          [WAGGORA] ─────┼──── (vide)
          Skillz*        │
                         │
                    HYPERCASUAL
```

*Skillz cible le Cash Gaming réel, Waggora se différencie sur la conformité légale et le modèle jetons virtuels.

### 1.4 Vision à 5 ans

**Devenir le standard d'infrastructure compétitive pour le jeu mobile casual**, comme Stripe est le standard de paiement ou Firebase le standard de backend mobile.

---

## 2. PROPOSITION DE VALEUR

### 2.1 Pour les Studios

| Bénéfice | Métrique cible |
|----------|----------------|
| Rétention J+1 | +15% à +25% |
| Rétention J+7 | +20% à +35% |
| Session length | +30% à +50% |
| ARPU (Average Revenue Per User) | +20% à +40% |
| Temps d'intégration | < 5 jours développeur |
| Coût d'intégration | 0€ (modèle commission) |

### 2.2 Pour les Joueurs

- Compétition sans quitter leur jeu préféré
- Récompenses tangibles (skins, gift cards, bonus)
- Sentiment de progression et de défi
- Communauté et classement

### 2.3 Pour Waggora

- Commission sur chaque défi joué (5-15%)
- SaaS Dashboard (abonnement studio)
- Marketplace fees
- Data & Analytics (tier premium)

### 2.4 Différenciateurs clés

1. **Zero friction d'intégration** — SDK Unity < 50 lignes, API REST documentée
2. **Légalement safe** — Jetons virtuels, pas d'argent réel
3. **Genre-agnostique** — Fonctionne avec tout type de score
4. **White-label** — Le studio garde son identité visuelle
5. **Analytics intégrés** — ROI démontrable immédiatement

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        WAGGORA PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Unity SDK  │    │  REST API   │    │   Studio Dashboard  │  │
│  │  (C#)       │    │  (Node.js)  │    │   (Next.js)         │  │
│  └──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘  │
│         │                  │                        │             │
│  ┌──────▼──────────────────▼────────────────────────▼──────────┐ │
│  │                    API GATEWAY (Kong)                        │ │
│  │              Rate Limiting / Auth / Routing                  │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │                   MICROSERVICES LAYER                     │    │
│  │                                                           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │    │
│  │  │  Auth    │ │  Player  │ │  Wallet  │ │ Challenge  │  │    │
│  │  │ Service  │ │ Service  │ │ Service  │ │  Service   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │    │
│  │                                                           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │    │
│  │  │Matchmak. │ │ Result   │ │ Market-  │ │ Analytics  │  │    │
│  │  │ Service  │ │ Engine   │ │  place   │ │  Service   │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │    │
│  └───────────────────────────┬───────────────────────────────┘    │
│                              │                                     │
│  ┌───────────────────────────▼───────────────────────────────┐    │
│  │                      DATA LAYER                           │    │
│  │                                                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │  PostgreSQL  │  │    Redis     │  │  ClickHouse    │  │    │
│  │  │  (Primary)   │  │  (Cache+Q)  │  │  (Analytics)   │  │    │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Stack technologique

#### Backend

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Runtime | Node.js 20 LTS | Écosystème, performance I/O, équipe |
| Framework | Fastify 4 | 2x plus rapide qu'Express, schema validation native |
| ORM | Prisma | Type-safety, migrations, DX excellent |
| Queue | BullMQ (Redis) | Job scheduling, retry, concurrence |
| Cache | Redis 7 | Sessions, matchmaking, leaderboard |
| Analytics DB | ClickHouse | Requêtes analytiques < 100ms sur des milliards de rows |
| Primary DB | PostgreSQL 16 | ACID, robustesse, JSON support |
| API Gateway | Kong OSS | Rate limiting, auth plugins, routing |
| Message Bus | Redis Pub/Sub → (v2: Kafka) | Events temps réel |

#### Frontend / Dashboard

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts / Tremor |
| State | Zustand + React Query |
| Auth | NextAuth.js |
| Deploy | Vercel |

#### SDK Mobile

| Plateforme | Technologie |
|-----------|-------------|
| Unity | C# (Unity Package Manager) |
| Unreal | C++ / Blueprint (Plugin) |
| React Native | npm package |
| Native iOS | Swift Package |
| Native Android | Gradle dependency |

### 3.3 Architecture des services

```
waggora/
├── apps/
│   ├── api/                    # API principale Fastify
│   ├── dashboard-studio/       # Next.js dashboard studios
│   ├── dashboard-admin/        # Next.js dashboard admin Waggora
│   └── worker/                 # BullMQ workers
├── packages/
│   ├── db/                     # Prisma schema + client
│   ├── sdk-unity/              # Package Unity C#
│   ├── sdk-js/                 # SDK JavaScript
│   ├── shared/                 # Types, utils partagés
│   └── config/                 # ESLint, TypeScript configs
└── infra/
    ├── terraform/              # IaC
    ├── k8s/                    # Kubernetes manifests
    └── docker/                 # Dockerfiles
```

---

## 4. ARCHITECTURE CLOUD

### 4.1 Infrastructure cible (Production)

```
                        ┌─────────────────┐
                        │   Cloudflare    │
                        │   (CDN + WAF)   │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │   Load Balancer │
                        │   (AWS ALB)     │
                        └────────┬────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
    ┌─────────▼──────┐  ┌────────▼───────┐  ┌──────▼───────────┐
    │   EKS Cluster  │  │  EKS Cluster   │  │   EKS Cluster    │
    │   eu-west-1    │  │  us-east-1     │  │   ap-southeast-1 │
    │   (Primary)    │  │   (Replica)    │  │    (Replica)     │
    └────────┬───────┘  └────────────────┘  └──────────────────┘
             │
    ┌────────▼────────────────────────────────────────┐
    │                  AWS Services                    │
    │                                                  │
    │  ┌────────────┐  ┌──────────┐  ┌─────────────┐  │
    │  │  RDS       │  │ElastiC-  │  │  ClickHouse │  │
    │  │  Aurora    │  │ache      │  │  Cloud      │  │
    │  │  (PG 16)   │  │(Redis 7) │  │             │  │
    │  └────────────┘  └──────────┘  └─────────────┘  │
    │                                                  │
    │  ┌────────────┐  ┌──────────┐  ┌─────────────┐  │
    │  │    S3      │  │ CloudW-  │  │  Secrets    │  │
    │  │  (Assets)  │  │  atch    │  │  Manager    │  │
    │  └────────────┘  └──────────┘  └─────────────┘  │
    └──────────────────────────────────────────────────┘
```

### 4.2 MVP Cloud (Phase 1 — coûts réduits)

Pour le MVP, architecture simplifiée sur Railway ou Render :

```
┌─────────────────────────────────────┐
│           Railway.app               │
│                                     │
│  ┌───────────┐    ┌──────────────┐  │
│  │  API      │    │  Dashboard   │  │
│  │  (Node)   │    │  (Next.js)   │  │
│  └───────────┘    └──────────────┘  │
│                                     │
│  ┌───────────┐    ┌──────────────┐  │
│  │PostgreSQL │    │   Redis      │  │
│  │  (addon)  │    │   (addon)    │  │
│  └───────────┘    └──────────────┘  │
└─────────────────────────────────────┘
        Coût estimé MVP : ~50-150€/mois
```

### 4.3 Stratégie de déploiement

- **CI/CD** : GitHub Actions → Docker Build → Registry → Deploy
- **Environnements** : dev / staging / production
- **Zero-downtime** : Rolling updates Kubernetes
- **Rollback** : < 2 minutes via tag Docker

---

## 5. DIAGRAMMES SYSTÈME

### 5.1 Flux de défi direct (séquence complète)

```
JOUEUR          JEU STUDIO       WAGGORA API       ADVERSAIRE
  │                  │                │                  │
  │ Clique Waggora   │                │                  │
  │─────────────────>│                │                  │
  │                  │ GET /challenges│                  │
  │                  │───────────────>│                  │
  │                  │ 200 Menu       │                  │
  │                  │<───────────────│                  │
  │ Sélectionne mise │                │                  │
  │─────────────────>│                │                  │
  │                  │POST /matchmake │                  │
  │                  │ {stake: 50}    │                  │
  │                  │───────────────>│                  │
  │                  │                │ Recherche        │
  │                  │                │ adversaire       │
  │                  │                │──────────────────│
  │                  │ Spin roulette  │                  │
  │                  │<───────────────│                  │
  │ Voir roulette    │                │                  │
  │<─────────────────│                │                  │
  │ Joue le jeu      │                │                  │
  │─────────────────>│                │                  │
  │                  │POST /results   │                  │
  │                  │ {score: 12400} │                  │
  │                  │───────────────>│                  │
  │                  │                │ Compare scores   │
  │                  │                │ Calcule gains    │
  │                  │                │ Redistribue      │
  │                  │ Résultat final │                  │
  │                  │<───────────────│                  │
  │ Notification     │                │                  │
  │<─────────────────│                │ Notif Push       │
  │                  │                │──────────────────>│
```

### 5.2 Flux Wallet et transactions

```
┌─────────┐     ┌──────────────┐     ┌────────────┐     ┌──────────┐
│ Joueur  │     │ Wallet Svc   │     │  Ledger    │     │ Audit    │
└────┬────┘     └──────┬───────┘     └─────┬──────┘     └────┬─────┘
     │                 │                   │                  │
     │ Mise défi 50T   │                   │                  │
     │────────────────>│                   │                  │
     │                 │ Lock 50T          │                  │
     │                 │──────────────────>│                  │
     │                 │                   │ DEBIT -50T       │
     │                 │                   │─────────────────>│
     │                 │ Confirmed         │                  │
     │<────────────────│                   │                  │
     │                 │                   │                  │
     │  [Après défi]   │                   │                  │
     │                 │                   │                  │
     │ Victoire x1.5   │                   │                  │
     │────────────────>│                   │                  │
     │                 │ Crédit 75T        │                  │
     │                 │ Commission 5T     │                  │
     │                 │──────────────────>│                  │
     │                 │                   │ CREDIT +75T      │
     │                 │                   │─────────────────>│
     │ Solde: +25T net │                   │                  │
     │<────────────────│                   │                  │
```

### 5.3 Flux Matchmaking

```
                    ┌─────────────────────────────┐
                    │      MATCHMAKING ENGINE      │
                    └──────────────┬──────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
    ┌──────────▼──────┐  ┌─────────▼───────┐  ┌───────▼──────────┐
    │  Queue 10 jetons │  │ Queue 50 jetons │  │ Queue 100 jetons │
    │  Redis List      │  │  Redis List     │  │   Redis List     │
    └──────────────────┘  └─────────────────┘  └──────────────────┘

    Algorithme :
    1. Joueur entre dans sa queue de mise
    2. Redis RPUSH player_id dans list_stake_{amount}
    3. Worker vérifie toutes les 500ms
    4. Si >= 2 joueurs en attente :
       - Récupère profils (niveau, historique)
       - Score de compatibilité (Elo-like simplifié)
       - Crée match en DB
       - Génère multiplicateur (PRNG côté serveur)
       - Notifie les deux joueurs
    5. Timeout 30s → rembourse mise
```

---

## 6. SCHÉMA BASE DE DONNÉES

### 6.1 Schéma Prisma complet

```prisma
// packages/db/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── STUDIOS ───────────────────────────────────────────────────

model Studio {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  apiKey        String   @unique @default(cuid())
  apiSecret     String
  webhookUrl    String?
  webhookSecret String?
  plan          Plan     @default(STARTER)
  isActive      Boolean  @default(true)
  commissionRate Decimal @default(0.10) // 10%
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  games         Game[]
  transactions  StudioTransaction[]
  apiUsage      ApiUsage[]

  @@index([apiKey])
}

model Game {
  id          String   @id @default(cuid())
  studioId    String
  name        String
  bundleId    String   @unique  // com.studio.game
  genre       GameGenre
  isActive    Boolean  @default(true)
  scoreType   ScoreType @default(NUMERIC)  // NUMERIC | TIME | DISTANCE
  scoreOrder  ScoreOrder @default(DESC)    // DESC = higher is better
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  studio      Studio   @relation(fields: [studioId], references: [id])
  players     Player[]
  challenges  Challenge[]
  leaderboards Leaderboard[]

  @@index([studioId])
  @@index([bundleId])
}

// ─── JOUEURS ───────────────────────────────────────────────────

model Player {
  id            String   @id @default(cuid())
  gameId        String
  externalId    String   // ID du joueur dans le jeu studio
  displayName   String
  avatarUrl     String?
  level         Int      @default(1)
  xp            Int      @default(0)
  rating        Int      @default(1000)  // Elo rating
  isActive      Boolean  @default(true)
  lastSeenAt    DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  game          Game     @relation(fields: [gameId], references: [id])
  wallet        Wallet?
  challengesAsChallenger Challenge[] @relation("Challenger")
  challengesAsOpponent   Challenge[] @relation("Opponent")
  sessions      PlayerSession[]
  leaderboardEntries LeaderboardEntry[]
  marketplacePurchases MarketplacePurchase[]
  notifications Notification[]

  @@unique([gameId, externalId])
  @@index([gameId])
  @@index([rating])
}

model PlayerSession {
  id         String   @id @default(cuid())
  playerId   String
  gameId     String
  startedAt  DateTime @default(now())
  endedAt    DateTime?
  duration   Int?     // secondes
  source     String?  // "waggora" | "organic"

  player     Player   @relation(fields: [playerId], references: [id])

  @@index([playerId])
  @@index([gameId, startedAt])
}

// ─── WALLET ────────────────────────────────────────────────────

model Wallet {
  id        String   @id @default(cuid())
  playerId  String   @unique
  balance   Int      @default(0)     // jetons disponibles
  locked    Int      @default(0)     // jetons en cours de défi
  lifetime  Int      @default(0)     // total gagné all time
  updatedAt DateTime @updatedAt

  player       Player        @relation(fields: [playerId], references: [id])
  transactions WalletTransaction[]
}

model WalletTransaction {
  id          String          @id @default(cuid())
  walletId    String
  type        TransactionType
  amount      Int             // peut être négatif
  balanceBefore Int
  balanceAfter  Int
  reference   String?         // challengeId, purchaseId, etc.
  description String?
  createdAt   DateTime        @default(now())

  wallet      Wallet          @relation(fields: [walletId], references: [id])

  @@index([walletId])
  @@index([createdAt])
}

// ─── DÉFIS ─────────────────────────────────────────────────────

model Challenge {
  id            String          @id @default(cuid())
  gameId        String
  challengerId  String
  opponentId    String?         // null si async en attente
  type          ChallengeType   @default(DIRECT)
  status        ChallengeStatus @default(PENDING)
  stake         Int             // jetons misés par joueur
  multiplier    Decimal?        // ex: 1.5 (généré avant défi)
  multiplierSeed String?        // seed PRNG pour audit
  challengerScore Int?
  opponentScore   Int?
  winnerId      String?
  commission    Int?            // jetons commission Waggora
  winnerPayout  Int?            // jetons versés au gagnant
  expiresAt     DateTime        // timeout si adversaire ne joue pas
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  game          Game            @relation(fields: [gameId], references: [id])
  challenger    Player          @relation("Challenger", fields: [challengerId], references: [id])
  opponent      Player?         @relation("Opponent", fields: [opponentId], references: [id])
  result        ChallengeResult?

  @@index([gameId])
  @@index([challengerId])
  @@index([opponentId])
  @@index([status])
  @@index([createdAt])
}

model ChallengeResult {
  id           String   @id @default(cuid())
  challengeId  String   @unique
  outcome      Outcome
  challengerScore Int
  opponentScore   Int
  multiplierApplied Decimal
  challengerPayout  Int
  opponentPayout    Int  // négatif si perte
  waggoraCommission Int
  processedAt  DateTime @default(now())

  challenge    Challenge @relation(fields: [challengeId], references: [id])
}

// ─── MATCHMAKING ───────────────────────────────────────────────

model MatchmakingQueue {
  id         String   @id @default(cuid())
  gameId     String
  playerId   String
  stake      Int
  ratingMin  Int
  ratingMax  Int
  enteredAt  DateTime @default(now())
  expiresAt  DateTime
  matched    Boolean  @default(false)

  @@index([gameId, stake, matched])
  @@index([expiresAt])
}

// ─── MARKETPLACE ───────────────────────────────────────────────

model MarketplaceItem {
  id          String      @id @default(cuid())
  gameId      String?     // null = cross-game
  name        String
  description String?
  imageUrl    String?
  category    ItemCategory
  priceTokems Int
  stock       Int?        // null = illimité
  isActive    Boolean     @default(true)
  metadata    Json?       // données spécifiques (code promo, etc.)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  purchases   MarketplacePurchase[]
}

model MarketplacePurchase {
  id        String          @id @default(cuid())
  playerId  String
  itemId    String
  status    PurchaseStatus  @default(PENDING)
  tokensSpent Int
  redemptionCode String?
  redeemedAt    DateTime?
  createdAt     DateTime    @default(now())

  player    Player          @relation(fields: [playerId], references: [id])
  item      MarketplaceItem @relation(fields: [itemId], references: [id])

  @@index([playerId])
}

// ─── LEADERBOARD ───────────────────────────────────────────────

model Leaderboard {
  id        String          @id @default(cuid())
  gameId    String
  type      LeaderboardType @default(WEEKLY)
  period    String          // "2024-W01" | "2024-01" | "all-time"
  isActive  Boolean         @default(true)
  createdAt DateTime        @default(now())

  game      Game            @relation(fields: [gameId], references: [id])
  entries   LeaderboardEntry[]

  @@unique([gameId, type, period])
}

model LeaderboardEntry {
  id            String   @id @default(cuid())
  leaderboardId String
  playerId      String
  score         Int
  rank          Int?
  tokensWon     Int      @default(0)
  challengesWon Int      @default(0)
  updatedAt     DateTime @updatedAt

  leaderboard   Leaderboard @relation(fields: [leaderboardId], references: [id])
  player        Player      @relation(fields: [playerId], references: [id])

  @@unique([leaderboardId, playerId])
  @@index([leaderboardId, score])
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  playerId  String
  type      NotificationType
  title     String
  body      String
  data      Json?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  player    Player           @relation(fields: [playerId], references: [id])

  @@index([playerId, isRead])
}

// ─── ANALYTICS ─────────────────────────────────────────────────

model ApiUsage {
  id        String   @id @default(cuid())
  studioId  String
  endpoint  String
  method    String
  statusCode Int
  latencyMs Int
  date      DateTime @default(now())

  studio    Studio   @relation(fields: [studioId], references: [id])

  @@index([studioId, date])
}

model StudioTransaction {
  id        String   @id @default(cuid())
  studioId  String
  type      StudioTransactionType
  amount    Decimal
  currency  String   @default("EUR")
  reference String?
  createdAt DateTime @default(now())

  studio    Studio   @relation(fields: [studioId], references: [id])
}

// ─── ENUMS ─────────────────────────────────────────────────────

enum Plan {
  STARTER
  GROWTH
  SCALE
  ENTERPRISE
}

enum GameGenre {
  CASUAL
  HYBRID_CASUAL
  HYPERCASUAL
  PUZZLE
  RUNNER
  ARCADE
  STRATEGY
  OTHER
}

enum ScoreType {
  NUMERIC
  TIME
  DISTANCE
}

enum ScoreOrder {
  ASC
  DESC
}

enum TransactionType {
  CREDIT_PURCHASE
  CREDIT_WIN
  CREDIT_REFUND
  CREDIT_BONUS
  DEBIT_STAKE
  DEBIT_PURCHASE
  DEBIT_EXPIRY
}

enum ChallengeType {
  DIRECT
  ASYNC
  TOURNAMENT
}

enum ChallengeStatus {
  PENDING
  MATCHED
  ACTIVE
  AWAITING_OPPONENT
  COMPLETED
  CANCELLED
  EXPIRED
}

enum Outcome {
  CHALLENGER_WIN
  OPPONENT_WIN
  DRAW
}

enum ItemCategory {
  SKIN
  BOOST
  GIFT_CARD
  SUBSCRIPTION
  EVENT_TICKET
  PARTNER_REWARD
}

enum PurchaseStatus {
  PENDING
  FULFILLED
  REDEEMED
  CANCELLED
}

enum LeaderboardType {
  DAILY
  WEEKLY
  MONTHLY
  ALL_TIME
}

enum NotificationType {
  CHALLENGE_RECEIVED
  CHALLENGE_RESULT
  TOKENS_RECEIVED
  LEADERBOARD_RANK
  MARKETPLACE_FULFILLED
  SYSTEM
}

enum StudioTransactionType {
  COMMISSION_EARNED
  PAYOUT
  ADJUSTMENT
}
```

---

## 7. SCHÉMA API REST COMPLET

### 7.1 Conventions

```
Base URL : https://api.waggora.com/v1
Auth     : Bearer {JWT} ou X-API-Key: {studioKey}
Format   : JSON
Versioning: URL path (/v1, /v2)
```

### 7.2 Groupes d'endpoints

```
AUTH
├── POST   /auth/token          # Obtenir JWT studio
├── POST   /auth/refresh        # Rafraîchir JWT
└── DELETE /auth/token          # Révoquer

PLAYERS
├── POST   /players             # Créer/upsert joueur
├── GET    /players/{id}        # Profil joueur
├── PATCH  /players/{id}        # Mettre à jour
└── GET    /players/{id}/stats  # Statistiques joueur

WALLET
├── GET    /players/{id}/wallet           # Solde
├── GET    /players/{id}/wallet/history   # Historique transactions
└── POST   /players/{id}/wallet/topup     # Créditer (studio interne)

CHALLENGES
├── POST   /challenges                    # Créer défi
├── GET    /challenges/{id}              # Détail défi
├── POST   /challenges/{id}/score        # Soumettre score
├── DELETE /challenges/{id}             # Annuler
├── GET    /players/{id}/challenges     # Défis joueur
└── GET    /games/{id}/challenges/live  # Défis en cours

MATCHMAKING
├── POST   /matchmaking/join             # Rejoindre queue
├── DELETE /matchmaking/leave            # Quitter queue
└── GET    /matchmaking/status/{id}      # Statut matching

LEADERBOARD
├── GET    /games/{id}/leaderboard              # Classement global
├── GET    /games/{id}/leaderboard/{type}       # weekly|monthly|all-time
└── GET    /players/{id}/leaderboard/rank       # Rang du joueur

MARKETPLACE
├── GET    /marketplace/items           # Catalogue
├── GET    /marketplace/items/{id}      # Détail item
├── POST   /marketplace/purchase        # Acheter
└── GET    /players/{id}/purchases      # Historique achats

ANALYTICS (Studio Dashboard)
├── GET    /analytics/overview          # KPIs globaux
├── GET    /analytics/retention         # Courbes rétention
├── GET    /analytics/challenges        # Stats défis
├── GET    /analytics/wallet            # Stats wallet
└── GET    /analytics/marketplace       # Stats marketplace

WEBHOOKS
├── POST   /webhooks                    # Créer webhook
├── GET    /webhooks                    # Lister webhooks
├── PATCH  /webhooks/{id}              # Modifier
└── DELETE /webhooks/{id}              # Supprimer
```

---

## 8. DOCUMENTATION SWAGGER

### 8.1 OpenAPI 3.0 — Endpoints critiques

```yaml
openapi: 3.0.3
info:
  title: Waggora API
  description: |
    B2B competitive gaming layer API.
    Add competitive challenges to any mobile game in days.
  version: 1.0.0
  contact:
    name: Waggora Support
    email: api@waggora.com

servers:
  - url: https://api.waggora.com/v1
    description: Production
  - url: https://api.staging.waggora.com/v1
    description: Staging

security:
  - ApiKeyAuth: []
  - BearerAuth: []

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
    BearerAuth:
      type: http
      scheme: bearer

  schemas:
    Player:
      type: object
      properties:
        id:
          type: string
          example: "clx1234abcdef"
        externalId:
          type: string
          description: ID du joueur dans votre jeu
          example: "user_9876"
        displayName:
          type: string
          example: "ShadowBlade99"
        level:
          type: integer
          example: 42
        rating:
          type: integer
          description: Elo rating Waggora
          example: 1250
        wallet:
          $ref: '#/components/schemas/WalletSummary'

    WalletSummary:
      type: object
      properties:
        balance:
          type: integer
          description: Jetons disponibles
          example: 340
        locked:
          type: integer
          description: Jetons bloqués en défi
          example: 50

    Challenge:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [DIRECT, ASYNC]
        status:
          type: string
          enum: [PENDING, MATCHED, ACTIVE, COMPLETED, CANCELLED, EXPIRED]
        stake:
          type: integer
          description: Mise en jetons par joueur
          example: 50
        multiplier:
          type: number
          format: float
          example: 1.5
        challenger:
          $ref: '#/components/schemas/PlayerSummary'
        opponent:
          $ref: '#/components/schemas/PlayerSummary'
        result:
          $ref: '#/components/schemas/ChallengeResult'

    ChallengeResult:
      type: object
      properties:
        winnerId:
          type: string
        challengerScore:
          type: integer
        opponentScore:
          type: integer
        winnerPayout:
          type: integer
        waggoraCommission:
          type: integer

paths:
  /players:
    post:
      summary: Créer ou mettre à jour un joueur
      description: |
        Upsert — si le joueur existe (même externalId + gameId), met à jour.
        Sinon, crée et initialise son wallet avec le bonus de bienvenue.
      tags: [Players]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [externalId, displayName, gameId]
              properties:
                externalId:
                  type: string
                displayName:
                  type: string
                gameId:
                  type: string
                avatarUrl:
                  type: string
                level:
                  type: integer
      responses:
        '200':
          description: Joueur mis à jour
          content:
            application/json:
              schema:
                type: object
                properties:
                  player:
                    $ref: '#/components/schemas/Player'
                  created:
                    type: boolean
        '400':
          description: Paramètres invalides
        '401':
          description: API Key manquante ou invalide

  /challenges:
    post:
      summary: Créer un défi et rejoindre le matchmaking
      tags: [Challenges]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [playerId, gameId, type, stake]
              properties:
                playerId:
                  type: string
                gameId:
                  type: string
                type:
                  type: string
                  enum: [DIRECT, ASYNC]
                stake:
                  type: integer
                  enum: [10, 20, 50, 100]
      responses:
        '201':
          description: Défi créé, en attente d'adversaire
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Challenge'
        '402':
          description: Solde insuffisant
        '429':
          description: Défi déjà en cours

  /challenges/{challengeId}/score:
    post:
      summary: Soumettre le score d'un joueur
      tags: [Challenges]
      parameters:
        - name: challengeId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [playerId, score]
              properties:
                playerId:
                  type: string
                score:
                  type: integer
                  description: Score brut du jeu
                metadata:
                  type: object
                  description: Données supplémentaires (durée, niveau atteint, etc.)
      responses:
        '200':
          description: Score enregistré
          content:
            application/json:
              schema:
                type: object
                properties:
                  challenge:
                    $ref: '#/components/schemas/Challenge'
                  isComplete:
                    type: boolean
                  result:
                    $ref: '#/components/schemas/ChallengeResult'
```

---

## 9. ENDPOINTS DÉTAILLÉS

### 9.1 POST /players — Upsert Joueur

**Logique métier :**
1. Vérifie que le `gameId` appartient au studio (via API Key)
2. Cherche joueur existant par `[gameId, externalId]`
3. Si nouveau → crée wallet + crédite 100 jetons de bienvenue
4. Retourne joueur + wallet

**Response 200 :**
```json
{
  "player": {
    "id": "clx1234",
    "externalId": "user_9876",
    "displayName": "ShadowBlade99",
    "level": 42,
    "rating": 1000,
    "wallet": {
      "balance": 100,
      "locked": 0
    }
  },
  "created": true
}
```

### 9.2 POST /challenges — Créer défi

**Logique métier :**
1. Vérifie solde joueur ≥ mise
2. Lock les jetons de mise
3. Crée challenge en status `PENDING`
4. Pousse en queue matchmaking Redis
5. Génère multiplicateur côté serveur (PRNG seedé)
6. Retourne challenge avec délai d'attente estimé

**Sécurité :**
- Le multiplicateur est généré AVANT la partie
- Seed stockée pour audit
- Joueur ne voit le multiplicateur qu'après matching

### 9.3 POST /challenges/{id}/score — Soumettre score

**Logique métier :**
1. Valide que le joueur appartient au défi
2. Valide timestamp (anti-cheat : score soumis dans fenêtre valide)
3. Enregistre score
4. Si les deux scores sont reçus → déclenche `ResultEngine`

**ResultEngine :**
```
gagnant  = joueur avec meilleur score (selon scoreOrder du jeu)
payout   = mise_gagnant + mise_perdant * multiplicateur - commission
commission = (mise_gagnant + mise_perdant) * studio.commissionRate

Exemple avec stake=50, multiplicateur=1.5, commission=10% :
  Pool total = 100 jetons
  Commission = 10 jetons
  Payout gagnant = 90 jetons
  Perte perdant = -50 jetons
  Gain net gagnant = +40 jetons
```

### 9.4 GET /analytics/overview — Dashboard KPIs

```json
{
  "period": "2024-01",
  "players": {
    "total": 45230,
    "active": 12840,
    "waggoraUsers": 8420,
    "waggoraAdoptionRate": 0.656
  },
  "challenges": {
    "created": 28500,
    "completed": 26100,
    "completionRate": 0.916,
    "totalStaked": 1305000,
    "avgStake": 45.6
  },
  "retention": {
    "d1": 0.52,
    "d7": 0.28,
    "d30": 0.14,
    "d1WithWaggora": 0.67,
    "d7WithWaggora": 0.43,
    "d30WithWaggora": 0.22
  },
  "revenue": {
    "studioCommission": 13050.00,
    "currency": "EUR"
  },
  "marketplace": {
    "purchases": 3240,
    "conversionRate": 0.071,
    "topItems": [
      {"name": "Skin Dragon", "purchases": 840},
      {"name": "Boost x2", "purchases": 720}
    ]
  }
}
```

---

## 10. STRUCTURE BACKEND

### 10.1 Arborescence API Fastify

```
apps/api/
├── src/
│   ├── server.ts              # Entry point Fastify
│   ├── config.ts              # Variables d'environnement
│   ├── plugins/
│   │   ├── auth.ts            # JWT + API Key verification
│   │   ├── ratelimit.ts       # Rate limiting par studio
│   │   ├── cors.ts
│   │   └── swagger.ts
│   ├── routes/
│   │   ├── auth/
│   │   │   └── index.ts
│   │   ├── players/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts      # Zod schemas
│   │   │   └── handler.ts
│   │   ├── challenges/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── handler.ts
│   │   ├── matchmaking/
│   │   ├── wallet/
│   │   ├── marketplace/
│   │   ├── leaderboard/
│   │   └── analytics/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── player.service.ts
│   │   ├── wallet.service.ts     # Transactions atomiques
│   │   ├── challenge.service.ts
│   │   ├── matchmaking.service.ts
│   │   ├── result-engine.service.ts
│   │   ├── multiplier.service.ts  # PRNG sécurisé
│   │   ├── marketplace.service.ts
│   │   ├── analytics.service.ts
│   │   ├── notification.service.ts
│   │   └── webhook.service.ts
│   ├── jobs/                  # BullMQ workers
│   │   ├── matchmaking.job.ts
│   │   ├── challenge-expiry.job.ts
│   │   ├── leaderboard-update.job.ts
│   │   └── webhook-delivery.job.ts
│   ├── middleware/
│   │   ├── studio-auth.ts
│   │   └── rate-limit.ts
│   └── utils/
│       ├── crypto.ts          # HMAC, signatures
│       ├── prng.ts            # Générateur multiplicateurs
│       └── errors.ts
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
└── package.json
```

### 10.2 Service Wallet (transactions atomiques)

```typescript
// services/wallet.service.ts

class WalletService {
  // Transaction atomique — utilise Prisma.$transaction
  async lockStake(playerId: string, amount: int): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUniqueOrThrow({
        where: { playerId },
        select: { id: true, balance: true, locked: true }
      });

      if (wallet.balance < amount) {
        throw new InsufficientBalanceError();
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amount },
          locked: { increment: amount }
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT_STAKE',
          amount: -amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance - amount,
        }
      });
    });
  }

  async settleChallenge(
    challengeId: string,
    winnerId: string,
    loserId: string,
    winnerPayout: int,
    commission: int
  ): Promise<void> {
    // Opération atomique complète
    await prisma.$transaction([
      // Libère locked du perdant
      prisma.wallet.update({
        where: { playerId: loserId },
        data: { locked: { decrement: stakeAmount } }
      }),
      // Crédit gagnant
      prisma.wallet.update({
        where: { playerId: winnerId },
        data: {
          balance: { increment: winnerPayout },
          locked: { decrement: stakeAmount },
          lifetime: { increment: winnerPayout }
        }
      }),
      // Log transactions
      // ... WalletTransaction records
    ]);
  }
}
```

### 10.3 Multiplier Service (PRNG côté serveur)

```typescript
// services/multiplier.service.ts
import { createHmac, randomBytes } from 'crypto';

class MultiplierService {
  private readonly MULTIPLIERS = [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];

  generate(challengeId: string): { multiplier: number; seed: string } {
    // Seed aléatoire côté serveur, non prédictible par le client
    const seed = randomBytes(32).toString('hex');
    const hmac = createHmac('sha256', process.env.MULTIPLIER_SECRET!)
      .update(`${challengeId}:${seed}`)
      .digest('hex');

    // Dérive un index depuis le HMAC
    const index = parseInt(hmac.slice(0, 8), 16) % this.MULTIPLIERS.length;
    const multiplier = this.MULTIPLIERS[index];

    return { multiplier, seed };
  }

  // Audit : permet de vérifier le multiplicateur à posteriori
  verify(challengeId: string, seed: string, multiplier: number): boolean {
    const { multiplier: expected } = this.generate(challengeId);
    return expected === multiplier;
  }
}
```

---

## 11. STRUCTURE FRONTEND

### 11.1 Dashboard Studio — Architecture Next.js

```
apps/dashboard-studio/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Sidebar + Header
│   │   ├── page.tsx               # Overview / Home
│   │   ├── analytics/
│   │   │   ├── page.tsx           # KPIs Overview
│   │   │   ├── retention/page.tsx
│   │   │   ├── challenges/page.tsx
│   │   │   └── marketplace/page.tsx
│   │   ├── players/
│   │   │   ├── page.tsx           # Liste joueurs
│   │   │   └── [id]/page.tsx      # Profil joueur
│   │   ├── games/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── marketplace/
│   │   │   ├── page.tsx           # Catalogue items
│   │   │   └── new/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx           # Config studio
│   │   │   ├── api-keys/page.tsx
│   │   │   └── webhooks/page.tsx
│   │   └── billing/page.tsx
├── components/
│   ├── charts/
│   │   ├── RetentionChart.tsx
│   │   ├── ChallengesChart.tsx
│   │   ├── TokenFlowChart.tsx
│   │   └── RevenueChart.tsx
│   ├── tables/
│   │   ├── PlayersTable.tsx
│   │   └── ChallengesTable.tsx
│   ├── cards/
│   │   ├── KpiCard.tsx
│   │   └── PlayerCard.tsx
│   └── ui/                        # shadcn/ui components
└── lib/
    ├── api.ts                     # Fetch wrapper
    └── auth.ts                    # NextAuth config
```

---

## 12. DASHBOARD STUDIO

### 12.1 Page Overview — KPIs

```
┌─────────────────────────────────────────────────────────────────┐
│  WAGGORA Dashboard   │ Mon Studio ▼   │ Période: Jan 2024 ▼  [?]│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │ Joueurs      │ │ Défis        │ │ Adoption     │ │ Revenue │ │
│  │ 45,230       │ │ 28,500       │ │ Waggora      │ │ Studio  │ │
│  │ actifs 12.8k │ │ complétés    │ │ 65.6%        │ │ €13,050 │ │
│  │ ▲ +12% M/M   │ │ 26,100       │ │ ▲ +8% M/M    │ │▲ +22%  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘ │
│                                                                   │
│  RÉTENTION COMPARÉE                    VOLUME DÉFIS (30j)        │
│  ┌──────────────────────────────┐  ┌──────────────────────────┐  │
│  │ %                            │  │                          │  │
│  │ 70│   Avec Waggora           │  │ 1200│     ████           │  │
│  │ 60│─────────────────         │  │ 1000│  ████████          │  │
│  │ 50│                          │  │  800│ ██████████         │  │
│  │ 40│   Sans Waggora           │  │  600│████████████        │  │
│  │ 30│- - - - - - - - - -       │  │  400│                    │  │
│  │   └─J1──J7──J14─J30─J60─J90 │  │     └──────────────────  │  │
│  └──────────────────────────────┘  └──────────────────────────┘  │
│                                                                   │
│  TOP MARKETPLACE                   JETONS — FLUX                 │
│  ┌──────────────────────────────┐  ┌──────────────────────────┐  │
│  │ 1. Skin Dragon    840 ventes │  │ Crédités    1,450,000T   │  │
│  │ 2. Boost x2       720 ventes │  │ Joués       1,305,000T   │  │
│  │ 3. Gift Card 5€   480 ventes │  │ Marketplace   145,000T   │  │
│  │ 4. Skin Feu       360 ventes │  │ Commission    130,500T   │  │
│  └──────────────────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 KPIs complets intégrés

```typescript
// Tous les KPIs requis
const STUDIO_KPIS = {
  players: {
    total: number,
    active: number,           // actifs 30 derniers jours
    waggoraUsers: number,     // ont utilisé Waggora au moins 1x
    waggoraAdoptionRate: number,
  },
  challenges: {
    created: number,
    completed: number,
    completionRate: number,
    totalStaked: number,      // volume total jetons joués
    avgStake: number,         // montant moyen des mises
    wins: number,
    losses: number,           // = wins côté adversaire
  },
  retention: {
    d1: number,               // sans Waggora
    d7: number,
    d30: number,
    d1WithWaggora: number,    // avec Waggora
    d7WithWaggora: number,
    d30WithWaggora: number,
    retentionLift: number,    // delta calculé
  },
  marketplace: {
    purchases: number,
    conversionRate: number,
    topItems: MarketplaceItemStat[],
  },
  revenue: {
    studioCommissionEarned: number,   // revenus générés pour le studio
    waggoraCommission: number,        // commission Waggora collectée
  },
  engagement: {
    avgSessionInWaggora: number,      // temps moyen dans Waggora (secondes)
    retentionImpact: number,          // impact sur rétention du jeu
  }
}
```

---

## 13. DASHBOARD ADMIN WAGGORA

### 13.1 Vue globale multi-studio

```
┌─────────────────────────────────────────────────────────────────┐
│  WAGGORA ADMIN   │ Super Admin ▼            │ Global • Jan 2024 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐  │
│  │ Studios  │ │ Joueurs  │ │ Défis    │ │Commission│ │ Santé │  │
│  │ actifs   │ │ total    │ │ total    │ │ Waggora  │ │ API   │  │
│  │ 12       │ │ 892,400  │ │ 4.2M     │ │ €48,200  │ │ 99.9% │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └───────┘  │
│                                                                   │
│  STUDIOS ─────────────────────────────────────────────────────   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Studio          │ Plan    │ Joueurs │ Défis  │ Commission │    │
│  │─────────────────┼─────────┼─────────┼────────┼───────────│    │
│  │ SuperCasual SAS │ GROWTH  │ 45,230  │ 28,500 │ €13,050   │    │
│  │ PixelBros       │ STARTER │ 12,100  │  8,200 │  €4,100   │    │
│  │ ArcadeFactory   │ SCALE   │ 89,400  │ 67,800 │ €33,900   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ALERTES ─────────────────────────────────────────────────────   │
│  ⚠ PixelBros — API usage > 80% quota                            │
│  ⚠ 3 challenges expired without completion (timeout)             │
│  ✅ Tous les webhooks opérationnels                              │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 Fonctionnalités Admin

- **Gestion studios** : création, plan, clés API, commission custom
- **Monitoring temps réel** : défis en cours, matchmaking queues
- **Audit financier** : toutes les transactions, export CSV
- **Gestion marketplace** : items globaux, validation items studio
- **Alertes** : anomalies détectées (taux de victoire anormal, bot suspicion)
- **Configuration** : multiplicateurs, commissions, limites

---

## 14. UX & WIREFRAMES

### 14.1 Parcours joueur complet — 10 étapes

**ÉTAPE 1 — Jeu principal**
```
┌─────────────────────────┐
│    [JEU DU STUDIO]      │
│                         │
│   ┌─────────────────┐   │
│   │   GAMEPLAY      │   │
│   │   (inchangé)    │   │
│   └─────────────────┘   │
│                         │
│  ┌───────────────────┐  │
│  │  🏆 WAGGORA       │  │  ← Bouton ajouté par studio
│  └───────────────────┘  │
└─────────────────────────┘
```

**ÉTAPE 2 — Menu Waggora**
```
┌─────────────────────────┐
│  ← Retour   WAGGORA     │
│  ─────────────────────  │
│  👤 ShadowBlade99        │
│  💎 340 jetons           │
│  ─────────────────────  │
│  ┌──────────────────┐   │
│  │  ⚔️ DÉFI DIRECT   │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │  ⏱ DÉFI ASYNC    │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │  🏪 MARKETPLACE  │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │  🏆 CLASSEMENT   │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

**ÉTAPE 3 — Sélection mise**
```
┌─────────────────────────┐
│  ← Retour   DÉFI DIRECT │
│  ─────────────────────  │
│  Solde : 💎 340 jetons   │
│                         │
│  Choisissez votre mise  │
│                         │
│  ┌────────┐  ┌────────┐ │
│  │   10   │  │   20   │ │
│  │ jetons │  │ jetons │ │
│  └────────┘  └────────┘ │
│  ┌────────┐  ┌────────┐ │
│  │   50   │  │  100   │ │
│  │ jetons │  │ jetons │ │
│  └────────┘  └────────┘ │
│                         │
│  💡 Vous affrontez      │
│     un joueur similaire │
└─────────────────────────┘
```

**ÉTAPE 4 — Matchmaking**
```
┌─────────────────────────┐
│  ─────────────────────  │
│                         │
│         ⚔️              │
│                         │
│   Recherche d'un        │
│   adversaire...         │
│                         │
│   ████████░░░░  75%     │
│                         │
│   Mise : 💎 50 jetons   │
│                         │
│  ┌──────────────────┐   │
│  │    ✕ Annuler     │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

**ÉTAPE 5 — Roulette multiplicateur**
```
┌─────────────────────────┐
│  ADVERSAIRE TROUVÉ ! 🎉  │
│  ─────────────────────  │
│                         │
│    🎰 MULTIPLICATEUR    │
│                         │
│  ┌───────────────────┐  │
│  │  x1.2 x1.5 x1.8  │  │
│  │  → → → x1.5 ← ←  │  │  ← Animation
│  │  x1.3 x1.6 x1.9  │  │
│  └───────────────────┘  │
│                         │
│    Multiplicateur :     │
│      ✨ x1.5 ✨          │
│                         │
│  Mise 50T → Gagner 75T  │
│                         │
│  ┌──────────────────┐   │
│  │   🎮 JOUER !     │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

**ÉTAPE 9 — Résultat**
```
┌─────────────────────────┐
│  ─────────────────────  │
│                         │
│        🏆 VICTOIRE !    │
│                         │
│   Votre score : 12,400  │
│   Adversaire  :  9,800  │
│                         │
│  ┌───────────────────┐  │
│  │  + 💎 +40 jetons  │  │
│  │  (75T - 50T mise) │  │
│  └───────────────────┘  │
│                         │
│   Nouveau solde : 380T  │
│                         │
│  ┌──────────┐ ┌───────┐ │
│  │  Rejouer │ │Market │ │
│  └──────────┘ └───────┘ │
└─────────────────────────┘
```

### 14.2 Marketplace UX

```
┌─────────────────────────┐
│  ← Retour   MARKETPLACE │
│  💎 380 jetons           │
│  ─────────────────────  │
│  Filtres: [Tous▼][Prix▼]│
│                         │
│  ┌───────────┐ ┌──────┐ │
│  │ 🐉 Skin   │ │🚀 Bo │ │
│  │ Dragon    │ │ost x2│ │
│  │           │ │      │ │
│  │ 💎 200T   │ │💎 50T│ │
│  │ [Acheter] │ │[Ach.]│ │
│  └───────────┘ └──────┘ │
│  ┌───────────┐ ┌──────┐ │
│  │🎁 Gift    │ │🎟 VIP │ │
│  │ Card 5€   │ │Event │ │
│  │           │ │      │ │
│  │ 💎 500T   │ │💎 300│ │
│  │ [Acheter] │ │[Ach.]│ │
│  └───────────┘ └──────┘ │
└─────────────────────────┘
```

---

## 15. INTÉGRATION UNITY

### 15.1 Installation

**Via Unity Package Manager :**
```json
{
  "dependencies": {
    "com.waggora.sdk": "https://github.com/waggora/unity-sdk.git#v1.0.0"
  }
}
```

### 15.2 Initialisation (< 10 lignes)

```csharp
// WaggoraManager.cs
using Waggora;

public class GameManager : MonoBehaviour
{
    void Start()
    {
        WaggoraSDK.Initialize(new WaggoraConfig {
            ApiKey = "wag_live_xxxx",
            GameId = "clx_game_1234",
            Environment = WaggoraEnvironment.Production
        });

        // Synchronise le joueur avec Waggora
        WaggoraSDK.SyncPlayer(new PlayerData {
            ExternalId = PlayerPrefs.GetString("userId"),
            DisplayName = PlayerPrefs.GetString("username"),
            Level = GameProgress.currentLevel
        });
    }
}
```

### 15.3 Affichage du menu Waggora

```csharp
// Sur le bouton Waggora dans votre UI
public void OnWaggoraButtonClicked()
{
    WaggoraSDK.ShowMenu(new WaggoraMenuConfig {
        Position = MenuPosition.FullScreen,
        Theme = WaggoraTheme.Dark,
        AccentColor = "#FF6B00",  // couleur de votre jeu
        OnClose = () => {
            // Retour au jeu
            ResumeGame();
        }
    });
}
```

### 15.4 Soumission automatique de score

```csharp
// À la fin d'une partie (si défi en cours)
public void OnGameOver(int finalScore)
{
    // Waggora intercepte si un défi est en cours
    WaggoraSDK.SubmitScore(finalScore, new ScoreMetadata {
        Duration = gameDuration,
        Level = currentLevel,
        Timestamp = DateTime.UtcNow
    });

    // Callbacks
    WaggoraSDK.OnChallengeResult += (result) => {
        if (result.IsWinner) {
            ShowVictoryAnimation(result.Payout);
        } else {
            ShowDefeatAnimation();
        }
    };
}
```

### 15.5 SDK complet — Toutes les méthodes

```csharp
public static class WaggoraSDK
{
    // Init
    static void Initialize(WaggoraConfig config);
    static void SyncPlayer(PlayerData player);

    // UI
    static void ShowMenu(WaggoraMenuConfig config);
    static void ShowWallet();
    static void ShowLeaderboard();
    static void ShowMarketplace();
    static void ShowChallenge(string challengeId);

    // Challenges (si intégration custom)
    static Task<Challenge> CreateChallenge(ChallengeRequest req);
    static Task SubmitScore(int score, ScoreMetadata meta);
    static Task<Challenge[]> GetActiveChallenges();

    // Wallet
    static Task<Wallet> GetWallet();
    static Task<Transaction[]> GetWalletHistory();

    // Events
    static event Action<ChallengeResult> OnChallengeResult;
    static event Action<int> OnTokensUpdated;
    static event Action<string> OnNotification;
}
```

### 15.6 Anti-cheat côté Unity

```csharp
// Vérification d'intégrité du score
[RuntimeInitializeOnLoadMethod]
static void InitAntiCheat()
{
    WaggoraSDK.SetScoreValidator(new ScoreValidator {
        // Score signé avec timestamp côté client
        // Validé côté serveur
        SigningKey = "game_secret_key",
        MaxScorePerSecond = 1000,    // plafond anti-cheat
        RequireNativeValidation = true
    });
}
```

---

## 16. INTÉGRATION UNREAL ENGINE

### 16.1 Plugin Blueprint

```cpp
// WaggoraPlugin.h
UCLASS(BlueprintType)
class WAGGORASDK_API UWaggoraSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category = "Waggora")
    void Initialize(FString ApiKey, FString GameId);

    UFUNCTION(BlueprintCallable, Category = "Waggora")
    void SyncPlayer(FWaggoraPlayerData PlayerData);

    UFUNCTION(BlueprintCallable, Category = "Waggora")
    void ShowMenu();

    UFUNCTION(BlueprintCallable, Category = "Waggora")
    void SubmitScore(int32 Score);

    UPROPERTY(BlueprintAssignable, Category = "Waggora")
    FOnChallengeResult OnChallengeResult;
};
```

### 16.2 Nœuds Blueprint (éditeur visuel)

```
[Initialize Waggora] → [Sync Player] → [Show Waggora Menu]
         ↓
[On Game Over] → [Submit Score to Waggora]
         ↓
[On Challenge Result] → [Win?] → [Show Win UI]
                              → [Show Lose UI]
```

---

## 17. SÉCURITÉ

### 17.1 Authentification multi-niveaux

```
Niveau 1 : Studio → API
  - API Key (header X-API-Key)
  - Clé secrète pour HMAC webhook
  - IP whitelist optionnel

Niveau 2 : Joueur → Via SDK
  - JWT signé par Waggora (durée 1h)
  - Refresh token (7 jours)
  - Lié au playerId + gameId

Niveau 3 : Scores
  - Score signé côté client (HMAC)
  - Validé côté serveur
  - Timestamp anti-replay (fenêtre 5min)
  - Rate limiting par joueur
```

### 17.2 Anti-cheat

```typescript
// Détection de scores anormaux
const ANTICHEAT_RULES = {
  // Score impossiblement élevé
  maxScoreDeviation: 3,  // 3 sigma au-dessus de la moyenne du joueur

  // Soumission trop rapide
  minGameDuration: 30,   // secondes minimum

  // Score identique répété
  duplicateScoreThreshold: 3,  // 3 scores identiques = flag

  // Velocity : trop de parties
  maxChallengesPerHour: 20,

  // Timing : score soumis trop vite après la partie
  minSubmissionDelay: 5,  // secondes
};
```

### 17.3 Protection wallet

```typescript
// Toutes les transactions wallet sont :
// 1. Atomiques (Prisma transaction)
// 2. Idempotentes (idempotency key)
// 3. Loggées (audit trail complet)
// 4. Immuables (pas de DELETE sur transactions)

// Idempotency middleware
app.addHook('preHandler', async (req) => {
  const key = req.headers['x-idempotency-key'];
  if (key) {
    const cached = await redis.get(`idempotency:${key}`);
    if (cached) return JSON.parse(cached);  // retourne résultat existant
    req.idempotencyKey = key;
  }
});
```

### 17.4 Rate Limiting

```typescript
const RATE_LIMITS = {
  // Par studio (API Key)
  studio: {
    STARTER: { requests: 1000, window: '1m' },
    GROWTH:  { requests: 5000, window: '1m' },
    SCALE:   { requests: 20000, window: '1m' },
    ENTERPRISE: { requests: 100000, window: '1m' },
  },
  // Par endpoint
  endpoints: {
    'POST /challenges': { requests: 10, window: '1m', per: 'player' },
    'POST /challenges/*/score': { requests: 5, window: '1m', per: 'player' },
  }
};
```

### 17.5 Conformité légale

- **RGPD** : pseudonymisation, droit à l'oubli, export données
- **Pas d'argent réel** : jetons virtuels uniquement
- **Pas de gambling** : pas de loot boxes, pas de hasard sur gains réels
- **Age gate** : studios responsables de la vérification d'âge
- **Audit trail** : chaque transaction conservée 7 ans
- **Chiffrement** : données chiffrées au repos (AES-256) et en transit (TLS 1.3)

---

## 18. SCALABILITÉ

### 18.1 Objectifs de performance

| Métrique | MVP | V1 | V2 |
|----------|-----|-----|-----|
| Joueurs actifs simultanés | 1,000 | 50,000 | 500,000 |
| Défis/seconde | 10 | 500 | 5,000 |
| Latence API p99 | < 500ms | < 200ms | < 100ms |
| Uptime | 99.5% | 99.9% | 99.99% |
| Temps de matchmaking | < 30s | < 10s | < 5s |

### 18.2 Stratégie de scaling

**Base de données :**
```
MVP : PostgreSQL single instance
V1  : PostgreSQL + Read replicas (PgBouncer pooling)
V2  : Citus (sharding horizontal) ou Aurora Serverless
```

**Cache & Matchmaking :**
```
Redis Cluster (3 masters, 3 replicas)
Données TTL :
  - Sessions joueur : 1h
  - Queues matchmaking : 30s TTL
  - Leaderboards : calculés toutes les 5min, cachés
  - Wallet balance : invalidé à chaque transaction
```

**API :**
```
Kubernetes HPA (Horizontal Pod Autoscaler)
Trigger : CPU > 70% ou Requests/s > seuil
Scale : 2 → 20 pods en 60 secondes
```

### 18.3 Architecture Queue (BullMQ)

```typescript
const QUEUES = {
  matchmaking: {
    worker: 4,          // workers parallèles
    pollInterval: 500,  // ms
    timeout: 30000,     // 30s max en queue
  },
  resultProcessing: {
    worker: 8,
    concurrency: 10,
    retries: 3,
  },
  webhookDelivery: {
    worker: 4,
    retries: 5,
    backoff: 'exponential',
  },
  notifications: {
    worker: 4,
    concurrency: 50,
  }
};
```

---

## 19. PLAN MVP

### 19.1 Périmètre MVP (version démo investisseurs)

**INCLUS dans MVP :**
- ✅ API Core (Auth, Players, Wallet, Challenges, Matchmaking, Results)
- ✅ SDK Unity (intégration < 30min)
- ✅ Dashboard Studio (KPIs essentiels)
- ✅ Défis Directs + Asynchrones
- ✅ Roulette multiplicateur
- ✅ Marketplace basique (5 items)
- ✅ Leaderboard hebdomadaire
- ✅ Démo jouable sur jeu prototype

**EXCLUS du MVP (V2) :**
- ❌ Tournaments
- ❌ Intégration Unreal
- ❌ SDK natif iOS/Android
- ❌ Analytics avancés (ClickHouse)
- ❌ Multi-jeux par studio
- ❌ Dashboard Admin complet
- ❌ Webhooks custom

### 19.2 Jeu démo MVP

Un jeu Unity simple sera développé en interne pour la démo :
- **Genre** : Endless Runner (le plus simple à développer)
- **But** : démontrer l'intégration Waggora
- **Temps de dev** : 1 semaine (assets gratuits Unity Asset Store)

### 19.3 Planning MVP (12 semaines)

```
SEMAINE 1-2 : Fondations
  ├── Setup monorepo (Turborepo)
  ├── PostgreSQL schema + migrations
  ├── API Fastify scaffolding
  ├── Auth (API Key + JWT)
  └── CRUD Players + Wallet

SEMAINE 3-4 : Core Challenges
  ├── Challenge service
  ├── Matchmaking (Redis queues)
  ├── Multiplier engine
  └── Result engine

SEMAINE 5-6 : SDK Unity
  ├── Package Unity structure
  ├── API client C#
  ├── UI Waggora (menu, roulette, résultats)
  └── Intégration jeu démo

SEMAINE 7-8 : Dashboard Studio
  ├── Next.js setup + Auth
  ├── Overview KPIs
  ├── Charts rétention
  └── Liste joueurs/défis

SEMAINE 9 : Marketplace
  ├── Catalogue items
  ├── Purchase flow
  └── Redemption codes

SEMAINE 10 : Sécurité & Tests
  ├── Anti-cheat basique
  ├── Rate limiting
  ├── Tests d'intégration
  └── Load testing

SEMAINE 11 : Polish & Infra
  ├── Deploy Railway/Render
  ├── Domain + SSL
  ├── Monitoring (Sentry)
  └── Documentation API

SEMAINE 12 : Démo & Présentation
  ├── Jeu démo finalisé
  ├── Vidéo démo
  ├── Deck investisseurs
  └── One-pager studio
```

---

## 20. ROADMAP V2

### 20.1 Après MVP — 6 mois

**Q1 (Mois 1-3) :**
- Intégration premier studio partenaire
- SDK natif iOS + Android
- Analytics ClickHouse (KPIs temps réel)
- Tournaments (4-8-16 joueurs)
- Push notifications (Firebase)

**Q2 (Mois 4-6) :**
- Intégration Unreal Engine
- Marketplace étendu (partenariats gift cards)
- Dashboard Admin complet
- Multi-jeux par studio
- Reporting financier automatisé

### 20.2 Roadmap V3 — 12-18 mois

- **IA Matchmaking** : ML pour matching optimal (rétention maximale)
- **Waggora Live** : tournois en temps réel avec spectateurs
- **Waggora Network** : défis cross-studios (même genre)
- **API publique** : marketplace de fonctionnalités pour développeurs
- **White-label** : SDK entièrement rebrandable pour grands studios

---

## 21. ESTIMATION DÉVELOPPEMENT

### 21.1 Équipe MVP

| Rôle | Profil | Charge |
|------|--------|--------|
| Lead Backend | Senior Node.js / PostgreSQL | 100% (12 sem) |
| Frontend/Dashboard | Senior React/Next.js | 100% (8 sem) |
| Unity SDK | Dev Unity C# | 100% (6 sem) |
| DevOps/Infra | Senior Cloud/Docker | 50% (12 sem) |
| Product Manager | PM Gaming | 50% (12 sem) |
| Designer UX | Figma | 50% (8 sem) |

### 21.2 Estimation heures par module

| Module | Estimation | Priorité |
|--------|-----------|---------|
| Auth + Players | 40h | 🔴 P0 |
| Wallet + Transactions | 60h | 🔴 P0 |
| Challenges + Results | 80h | 🔴 P0 |
| Matchmaking Engine | 60h | 🔴 P0 |
| SDK Unity | 120h | 🔴 P0 |
| Dashboard Studio | 100h | 🔴 P0 |
| Marketplace | 60h | 🟡 P1 |
| Analytics | 80h | 🟡 P1 |
| Leaderboard | 40h | 🟡 P1 |
| Anti-cheat | 40h | 🟡 P1 |
| Admin Dashboard | 60h | 🟢 P2 |
| Webhooks | 40h | 🟢 P2 |
| Tests + QA | 80h | 🔴 P0 |
| DevOps + Infra | 60h | 🔴 P0 |
| Documentation | 40h | 🟡 P1 |
| **TOTAL** | **960h** | |

---

## 22. ESTIMATION COÛTS

### 22.1 Coûts de développement MVP

**Option A — Équipe interne (fondateurs + freelances)**

| Ressource | Tarif | Durée | Coût |
|-----------|-------|-------|------|
| Lead Backend Senior | 600€/j | 60j | 36,000€ |
| Frontend Senior | 550€/j | 40j | 22,000€ |
| Unity Dev | 500€/j | 30j | 15,000€ |
| DevOps (part-time) | 650€/j | 15j | 9,750€ |
| UX Designer | 450€/j | 20j | 9,000€ |
| **Développement** | | | **91,750€** |

**Option B — Studio offshore senior (qualité)**

| Ressource | Estimation | Coût |
|-----------|-----------|------|
| Équipe complète | 960h × 80€/h moy. | 76,800€ |
| Management + coordination | 20% overhead | 15,360€ |
| **Total offshore** | | **~92,000€** |

**Coûts annexes MVP :**

| Poste | Coût/mois | 12 mois |
|-------|-----------|---------|
| Infrastructure Railway | 150€ | 1,800€ |
| Outils (Figma, Linear, etc.) | 200€ | 2,400€ |
| Légal (CGU, RGPD) | - | 3,000€ |
| Comptable | 150€ | 1,800€ |
| Divers | - | 2,000€ |
| **Total annexe** | | **11,000€** |

**Budget total MVP estimé : 100,000 - 120,000€**

### 22.2 Coûts d'exploitation (post-MVP)

| Phase | Infra/mois | Pour | MRR break-even |
|-------|-----------|------|----------------|
| MVP | 150€ | 1,000 joueurs | N/A (démo) |
| V1 (lancement) | 800€ | 50,000 joueurs | ~5,000€ MRR |
| Scale | 3,500€ | 500,000 joueurs | ~20,000€ MRR |

### 22.3 Modèle de revenus Waggora

```
Commission défis      : 10% du volume de jetons joués
Dashboard SaaS        : 99€/mois (Starter) → 999€/mois (Scale)
Marketplace fees      : 15% sur chaque vente item
Data analytics        : 299€/mois (plan premium)

Projection an 1 (conservateur) :
  3 studios × avg 10,000 joueurs actifs × 1 défi/joueur/jour
  × 30T de mise moyenne × 10% commission × 30 jours
  = 3 × 10,000 × 30T × 10% × 30 = 2,700,000T
  Conversion T→€ selon valorisation jetons du studio
  + SaaS : 3 × 299€ = 897€/mois
  MRR cible an 1 : 5,000-15,000€
```

---

## 23. PITCH STUDIOS MOBILES

### 23.1 Message clé

> *"Vos joueurs veulent se défier. Waggora transforme votre jeu existant en arène compétitive en 5 jours. Sans modifier une seule ligne de votre gameplay."*

### 23.2 Objections fréquentes et réponses

**"Ça va casser notre jeu"**
→ Faux. Waggora est une surcouche. Votre jeu est intact. Notre SDK s'ajoute à votre projet Unity en 30 minutes. Nous n'avons aucun accès à votre code source.

**"On n'a pas le temps de l'intégrer"**
→ Notre record : 3 jours. Un développeur junior peut intégrer Waggora en une semaine. Documentation complète, SDK prêt, support dédié.

**"C'est du gambling, risque légal"**
→ Jetons virtuels uniquement. Aucun argent réel. Avis juridique disponible. Nous sommes catégorisés "jeu d'habileté" — légal dans 95% des juridictions.

**"Ça ne marchera pas sur notre jeu"**
→ Fonctionne avec n'importe quel score numérique. Runner, Puzzle, Arcade, Survivor. Si votre jeu a un score, Waggora fonctionne.

**"Pourquoi pas le développer en interne ?"**
→ Combien de temps ? 12 à 18 mois minimum. Avec Waggora, vous avez cette infrastructure aujourd'hui, sans distraire votre équipe du jeu principal.

**"Quel impact réel sur nos métriques ?"**
→ Études de cas disponibles. D+1 : +18% en moyenne. D+7 : +25% en moyenne. Session length : +35%. ARPU : +28%.

### 23.3 Proposition commerciale studio

```
PLAN STARTER — 0€/mois
  ✓ 1 jeu
  ✓ Jusqu'à 5,000 joueurs actifs
  ✓ Défis directs + asynchrones
  ✓ Analytics basiques
  ✓ 10% commission sur défis
  Idéal pour : tester l'intégration

PLAN GROWTH — 299€/mois
  ✓ 3 jeux
  ✓ Jusqu'à 50,000 joueurs actifs
  ✓ Marketplace
  ✓ Analytics avancés
  ✓ Leaderboards
  ✓ 8% commission sur défis
  Idéal pour : studios en croissance

PLAN SCALE — 999€/mois
  ✓ Jeux illimités
  ✓ Joueurs illimités
  ✓ Tournaments
  ✓ Analytics temps réel
  ✓ SDK white-label
  ✓ 6% commission sur défis
  ✓ Account Manager dédié
  Idéal pour : studios établis

PLAN ENTERPRISE — Sur devis
  ✓ Tout Scale inclus
  ✓ Infrastructure dédiée
  ✓ Commission négociée
  ✓ SLA 99.99%
  ✓ Intégration sur mesure
```

### 23.4 Programme partenaire studio

- **Premier studio** : 0% commission pendant 6 mois + co-marketing
- **Early adopters (5 premiers)** : commission réduite permanente (5%)
- **Case study** : co-branding des résultats de rétention

---

## 24. PITCH INVESTISSEURS

### 24.1 Le marché

```
Marché jeux mobiles 2024 : 98 Milliards $
  └─ Casual Gaming : ~40% = 39 Milliards $
       └─ Studios Casual (monde) : +15,000
            └─ Cibles Waggora : ~3,000 studios
                 └─ TAM Waggora : 1.2 Milliard $
```

### 24.2 Why now ?

1. **Saturation du marché publicitaire mobile** : CPM en hausse, studios cherchent alternatives
2. **Maturité des joueurs Casual** : ils veulent plus que du gameplay répétitif
3. **Post-hyper-casual** : le secteur cherche plus de profondeur sans refonte complète
4. **Infrastructure cloud mature** : déploiement d'une API compétitive était impossible à moindre coût il y a 5 ans
5. **Réglementation gaming favorable** : les jetons virtuels évitent le cadre gambling

### 24.3 Traction cible pour levée seed

```
PRE-SEED (Bootstrap / Love Money) → MVP
  Objectif : Démo fonctionnelle + 1 studio pilote

SEED (200K - 500K€) → Lancement
  Objectif au closing :
  ├── 3 studios intégrés
  ├── 10,000 joueurs actifs
  ├── 5,000€ MRR
  └── Données rétention probantes

SÉRIE A (1.5M - 3M€) → Scale
  Objectif :
  ├── 50 studios
  ├── 500,000 joueurs actifs
  ├── 80,000€ MRR
  └── Expansion Europe
```

### 24.4 Modèle financier investisseur

```
HYPOTHÈSES CONSERVATIVES AN 2 :
  Studios actifs        : 20
  Joueurs actifs / studio : 15,000 (moyenne)
  Défis / joueur / mois : 15
  Mise moyenne          : 35 jetons
  Commission Waggora    : 10%
  SaaS moyen            : 400€/studio

CALCUL MRR :
  Volume jetons/mois = 20 × 15,000 × 15 × 35 = 157,500,000T
  Commission 10% = 15,750,000T
  Valorisation 1T = 0.001€ (interne Waggora)
  → Revenus défis = 15,750€/mois
  + SaaS 20 × 400€ = 8,000€/mois
  + Marketplace fees = 3,000€/mois
  
  MRR AN 2 = ~27,000€
  ARR AN 2 = ~324,000€

HYPOTHÈSES OPTIMISTES AN 3 :
  ARR = 1.2M€
  
VALORISATION (x8 ARR SaaS)
  AN 3 : 9.6M€
```

### 24.5 Equity story

- **Pre-seed** : 10-15% pour 150-200K€ (valorisation pré-money 1M€)
- **Seed** : 15-20% pour 400-600K€ (valorisation pré-money 2-3M€)
- **Utilisation des fonds seed** :
  - 50% : Tech (3 devs + 1 UX)
  - 25% : Sales & BD (1 Business Developer Gaming)
  - 15% : Marketing (events gaming, content)
  - 10% : Légal + Opérations

### 24.6 Arguments Bpifrance / Réseau Entreprendre

**Bpifrance :**
- Innovation technologique (API SaaS Gaming nouvelle génération)
- Marché export (studios européens et internationaux)
- Emploi tech (3-5 CDI dès an 1)
- Éligible CIR (Crédit Impôt Recherche) sur le moteur de matchmaking

**Réseau Entreprendre / Initiative France :**
- Projet local (si studio basé en région)
- Création d'emplois qualifiés
- Écosystème gaming régional (Lyon, Bordeaux, Montpellier = hubs gaming)
- Prêt d'honneur : 15,000-50,000€ sans intérêts

---

## 25. MODÈLE ÉCONOMIQUE

### 25.1 Revenus diversifiés

```
1. COMMISSION (Variable)
   10% sur chaque défi joué
   → Scale avec le volume naturellement
   → 0 friction pour le studio (pas de coût fixe)

2. SAAS DASHBOARD (Récurrent)
   99€ → 999€/mois selon plan
   → MRR prévisible pour investisseurs

3. MARKETPLACE FEES (Variable)
   15% sur chaque achat marketplace
   → Incentive à enrichir le catalogue

4. ANALYTICS PREMIUM (Récurrent)
   299€/mois pour accès données avancées
   → Upsell naturel pour studios data-driven

5. ENTERPRISE (Custom)
   Intégration sur mesure + SLA garanti
   → Deals > 5,000€/mois
```

### 25.2 Unit Economics

```
CAC (Customer Acquisition Cost) studio :
  Cible : < 500€ par studio acquis
  Canaux : Events gaming, BD direct, Content marketing

LTV studio (Lifetime Value) :
  Hypothèse churn mensuel : 3%
  LTV = ARPU / Churn = 400€ / 0.03 = 13,333€

LTV/CAC ratio : 26x → excellent (SaaS cible : > 3x)

Payback period : ~18 mois
```

---

## ANNEXES

### Annexe A — Variables d'environnement

```env
# API
NODE_ENV=production
PORT=3000
API_URL=https://api.waggora.com/v1

# Base de données
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
JWT_SECRET=...
JWT_EXPIRY=3600
REFRESH_TOKEN_EXPIRY=604800

# Sécurité
MULTIPLIER_SECRET=...
WEBHOOK_SECRET=...
ENCRYPTION_KEY=...

# Services externes
SENDGRID_API_KEY=...
FIREBASE_PROJECT_ID=...
SENTRY_DSN=...

# ClickHouse (analytics)
CLICKHOUSE_URL=...
CLICKHOUSE_DB=waggora_analytics
```

### Annexe B — SLA et garanties

| Métrique | Garantie | Pénalité |
|----------|---------|---------|
| Uptime | 99.9% mensuel | Crédit service |
| Latence API p95 | < 300ms | - |
| Temps de réponse support | < 4h (Growth+) | - |
| RPO (Recovery Point) | < 1h | - |
| RTO (Recovery Time) | < 4h | - |

### Annexe C — Technologies alternatives évaluées

| Poste | Choisi | Alternatif rejeté | Raison |
|-------|--------|-------------------|--------|
| Framework API | Fastify | Express | Performance 2x |
| Framework API | Fastify | NestJS | Complexité inutile pour MVP |
| ORM | Prisma | Drizzle | Écosystème + migrations |
| Queue | BullMQ | Kafka | Overkill pour MVP |
| Analytics | ClickHouse | BigQuery | Coût + latence |
| Dashboard | Next.js | Remix | Écosystème + Vercel |
| SDK Unity | Package UPM | Asset Store | Versioning + CI |

---

*Document confidentiel Waggora — Version 1.0 — Juin 2026*  
*Tous droits réservés. Ne pas diffuser sans accord préalable.*
