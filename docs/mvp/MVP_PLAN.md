# Waggora MVP — Plan Détaillé

## Objectif du MVP

Produire une démonstration fonctionnelle permettant de :
1. **Convaincre un studio pilote** → intégration réelle
2. **Convaincre un investisseur** → données de rétention
3. **Obtenir un financement** → Bpifrance / love money / angel

---

## Périmètre exact du MVP

### ✅ INCLUS

| Fonctionnalité | Priorité | Durée |
|----------------|----------|-------|
| API Auth (API Key + JWT) | P0 | 1 sem |
| Player CRUD + Wallet | P0 | 1 sem |
| Défi Direct (stake 10/20/50/100) | P0 | 2 sem |
| Matchmaking simple (Redis queues) | P0 | 1 sem |
| Roulette multiplicateur (PRNG serveur) | P0 | 0.5 sem |
| Result Engine + paiement jetons | P0 | 1 sem |
| SDK Unity (menu, score submit) | P0 | 3 sem |
| Dashboard Studio (KPIs essentiels) | P0 | 2 sem |
| Défi Asynchrone | P1 | 1 sem |
| Marketplace (5 items) | P1 | 1 sem |
| Leaderboard hebdomadaire | P1 | 0.5 sem |
| Deploy (Railway) + monitoring | P0 | 0.5 sem |
| Jeu démo Unity (Endless Runner) | P0 | 1 sem |

### ❌ HORS SCOPE MVP

- Tournaments
- SDK Unreal / iOS natif / Android natif
- ClickHouse analytics
- Push notifications Firebase
- Webhooks avancés
- Multi-jeux par studio
- Dashboard Admin complet
- Compliance RGPD complète (phase post-seed)

---

## Planning semaine par semaine

### Semaine 1 — Fondations

**Backend :**
```
- Setup Turborepo monorepo
- PostgreSQL sur Railway + Prisma schema
- Fastify server + plugins (auth, cors, swagger)
- POST /players — upsert joueur + init wallet
- GET /players/:id + wallet
- Tests unitaires wallet transactions
```

**Infra :**
```
- Railway project (API + DB + Redis)
- GitHub Actions CI (lint + test)
- .env management
```

**Livrable S1 :** API joueurs opérationnelle, DB en production

---

### Semaine 2 — Core Challenges

**Backend :**
```
- POST /challenges — créer défi + lock stake
- MatchmakingService (BullMQ + Redis)
- MultiplierService (PRNG HMAC)
- POST /challenges/:id/score — soumettre score
- ResultEngine — comparer scores + settle wallet
- Endpoints cancel + status
```

**Tests :**
```
- Tests intégration : défi complet (créer → matcher → score → résultat)
- Test atomicité wallet (rollback si erreur)
```

**Livrable S2 :** Défi direct fonctionnel via API (testable avec curl)

---

### Semaine 3-4 — SDK Unity

**SDK :**
```
S3 :
- Package UPM structure
- WaggoraConfig ScriptableObject
- HttpClient C# (Fastify API)
- SyncPlayer() — upsert + cache local
- GetActiveChallengeId()
- SubmitScore()

S4 :
- UI Canvas : Menu Waggora
- UI Canvas : Sélection mise
- UI Canvas : Roulette animation (côté client, valeur serveur)
- UI Canvas : Résultat (victoire / défaite)
- Events système (OnChallengeResult, OnTokensUpdated)
- Polling matchmaking (coroutine 2s)
```

**Livrable S3-4 :** SDK Unity compilable + documenté

---

### Semaine 5 — Jeu démo Unity

**Jeu Endless Runner simple :**
```
- Assets gratuits Unity Asset Store
- Mécaniques : course, obstacles, score distance
- Intégration SDK Waggora en 30 minutes (démontrable)
- Bouton WAGGORA dans l'UI du jeu
- Soumission automatique du score
```

**Livrable S5 :** Démo jouable illustrant le parcours complet

---

### Semaine 6-7 — Dashboard Studio

**Next.js Dashboard :**
```
S6 :
- Setup Next.js 14 + shadcn/ui + Tailwind
- Auth (NextAuth.js — login studio)
- Page Overview : 4 KPI cards + 2 graphiques
- Graphique Rétention avec/sans Waggora (simulé pour MVP)
- Graphique Volume défis 30 jours

S7 :
- Page Joueurs (liste + recherche)
- Page Défis (liste + statut)
- Page Settings (API Keys, config jeu)
- Page Marketplace (basic)
```

**Livrable S6-7 :** Dashboard studio déployé sur Vercel

---

### Semaine 8 — Marketplace + Leaderboard

**Backend + Dashboard :**
```
- GET /marketplace/items
- POST /marketplace/purchase (déduction jetons)
- GET /games/:id/leaderboard
- UI Marketplace dans SDK Unity
- UI Leaderboard dans SDK Unity
- Ajout 5 items démo (2 skins, 1 boost, 1 gift card, 1 event)
```

**Livrable S8 :** Marketplace fonctionnel

---

### Semaine 9 — Défi Asynchrone

**Backend :**
```
- Challenge type ASYNC
- Timeout 24h si adversaire ne joue pas
- Notifications async (polling)
- UI Async dans SDK Unity
```

**Livrable S9 :** Défi async end-to-end

---

### Semaine 10 — Sécurité & Tests

**Sécurité :**
```
- Rate limiting par endpoint et par studio
- Anti-cheat basique (score > 3σ, durée min)
- Idempotency keys sur transactions
- HMAC signature scores
- Audit log wallet (immuable)
```

**Tests :**
```
- Load test : 100 défis simultanés
- Test matchmaking : 50 joueurs en queue
- Test wallet : 1000 transactions concurrentes
```

---

### Semaine 11 — Polish & Infra

**Infra :**
```
- Domaine api.waggora.com + SSL
- Sentry (error monitoring)
- Uptime monitoring (Better Uptime)
- Documentation Swagger auto (déployée)
- README intégration studio
```

**Polish :**
```
- Animations roulette finalisées
- Notifications in-app soignées
- Logo et branding Waggora dans SDK
```

---

### Semaine 12 — Démo & Présentation

**Livrables finaux :**
```
- Vidéo démo 2-3 minutes (parcours joueur complet)
- One-pager studio (PDF)
- Deck investisseur (PDF + Figma)
- Documentation API (Swagger UI déployée)
- Guide intégration Unity (5 étapes)
- Landing page waggora.com (simple, professional)
```

---

## Stack résumée MVP

```
Backend   : Node.js 20 + Fastify + Prisma + BullMQ
DB        : PostgreSQL 16 + Redis 7 (Railway)
Dashboard : Next.js 14 + shadcn/ui (Vercel)
SDK       : Unity C# package (UPM)
CI/CD     : GitHub Actions
Monitoring: Sentry + Better Uptime
Domain    : Cloudflare (DNS + SSL)
```

---

## Budget MVP détaillé

| Poste | Coût mensuel | 3 mois |
|-------|-------------|--------|
| Railway (API + DB + Redis) | 50-100€ | 300€ |
| Vercel (Dashboard) | 0€ (hobby) | 0€ |
| Domaine waggora.com | - | 15€ |
| Sentry (error monitoring) | 26€ | 78€ |
| Better Uptime | 20€ | 60€ |
| Outils dev (Linear, Figma) | 30€ | 90€ |
| **Total infrastructure MVP** | | **~543€** |

**Budget dev MVP : 80,000 - 120,000€** (selon profils)

---

## Critères de succès MVP

Le MVP est validé si :

```
✅ Un développeur Unity peut intégrer le SDK en < 1 journée
✅ Un défi complet s'exécute en < 60 secondes (bout en bout)
✅ Le dashboard affiche les bons KPIs pour un studio fictif
✅ La démo est présentable à un studio mobile professionnel
✅ L'API répond en < 300ms sur tous les endpoints critiques
✅ Zéro bug de wallet en 72h de test intensif
```

---

## Risques et mitigation

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Retard technique | Moyen | Moyen | Scope MVP minimal strict |
| SDK Unity complexe | Faible | Fort | Prototype SDK S1 |
| Performance matchmaking | Faible | Moyen | Load test dès S8 |
| Problème légal jetons | Très faible | Fort | Avis juridique S1 |
| Studio pilote refuse | Moyen | Fort | 3 studios contactés en parallèle |
