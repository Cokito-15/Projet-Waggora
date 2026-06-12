# Waggora — Schéma Base de Données

## Diagramme Entité-Relation

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Studio    │ 1───* │     Game     │ 1───* │    Player    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ name         │       │ studioId     │       │ gameId       │
│ slug         │       │ name         │       │ externalId   │
│ apiKey       │       │ bundleId     │       │ displayName  │
│ plan         │       │ genre        │       │ level        │
│ commRate     │       │ scoreType    │       │ rating       │
│ isActive     │       │ scoreOrder   │       │ isActive     │
└──────────────┘       │ isActive     │       └──────┬───────┘
                       └──────────────┘              │
                                                     │ 1
                                                     │
                              ┌──────────────────────┤
                              │                      │
                         ┌────▼─────┐    ┌───────────▼──────┐
                         │  Wallet  │    │  PlayerSession   │
                         ├──────────┤    ├──────────────────┤
                         │ id       │    │ id               │
                         │ playerId │    │ playerId         │
                         │ balance  │    │ gameId           │
                         │ locked   │    │ startedAt        │
                         │ lifetime │    │ endedAt          │
                         └────┬─────┘    │ duration         │
                              │          │ source           │
                              │ 1        └──────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ WalletTransaction  │
                    ├────────────────────┤
                    │ id                 │
                    │ walletId           │
                    │ type               │
                    │ amount             │
                    │ balanceBefore      │
                    │ balanceAfter       │
                    │ reference          │
                    │ createdAt          │
                    └────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      CHALLENGE FLOW                          │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌──────────────────────┐    ┌─────────────┐
│   Player    │    │      Challenge       │    │   Player    │
│ (Challenger)│    ├──────────────────────┤    │ (Opponent)  │
└──────┬──────┘    │ id                   │    └──────┬──────┘
       │           │ gameId               │           │
       └───────────► challengerId         │           │
                   │ opponentId ◄─────────┼───────────┘
                   │ type                 │
                   │ status               │
                   │ stake                │
                   │ multiplier           │
                   │ multiplierSeed       │
                   │ challengerScore      │
                   │ opponentScore        │
                   │ winnerId             │
                   │ commission           │
                   │ winnerPayout         │
                   │ expiresAt            │
                   └──────────┬───────────┘
                              │ 1
                              │
                   ┌──────────▼───────────┐
                   │   ChallengeResult    │
                   ├──────────────────────┤
                   │ id                   │
                   │ challengeId          │
                   │ outcome              │
                   │ challengerScore      │
                   │ opponentScore        │
                   │ multiplierApplied    │
                   │ challengerPayout     │
                   │ opponentPayout       │
                   │ waggoraCommission    │
                   │ processedAt          │
                   └──────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     MARKETPLACE FLOW                         │
└──────────────────────────────────────────────────────────────┘

┌─────────────────┐    *─────1    ┌──────────────────────┐
│  MarketplaceItem│               │  MarketplacePurchase  │
├─────────────────┤               ├──────────────────────┤
│ id              │               │ id                   │
│ gameId (null=   │               │ playerId             │
│   cross-game)   │               │ itemId               │
│ name            │               │ status               │
│ description     │               │ tokensSpent          │
│ imageUrl        │               │ redemptionCode       │
│ category        │               │ redeemedAt           │
│ priceTokens     │               │ createdAt            │
│ stock           │               └──────────────────────┘
│ isActive        │
│ metadata (JSON) │
└─────────────────┘
```

## Index de performance

```sql
-- Players — recherche par jeu + ID externe (appel le plus fréquent)
CREATE UNIQUE INDEX idx_player_game_external ON "Player"("gameId", "externalId");

-- Challenges — statut actif (matchmaking polling)
CREATE INDEX idx_challenge_status ON "Challenge"("status") 
  WHERE status IN ('PENDING', 'MATCHED', 'ACTIVE');

-- Challenges — historique par joueur
CREATE INDEX idx_challenge_challenger ON "Challenge"("challengerId", "createdAt");
CREATE INDEX idx_challenge_opponent ON "Challenge"("opponentId", "createdAt");

-- Wallet — transactions récentes (dashboard)
CREATE INDEX idx_wallet_tx_created ON "WalletTransaction"("walletId", "createdAt" DESC);

-- Leaderboard — classement par score
CREATE INDEX idx_leaderboard_score ON "LeaderboardEntry"("leaderboardId", "score" DESC);

-- Matchmaking queue — par mise + expiration
CREATE INDEX idx_matchmaking_queue ON "MatchmakingQueue"("gameId", "stake", "matched", "expiresAt");

-- Analytics — sessions par jeu et date
CREATE INDEX idx_session_game_date ON "PlayerSession"("gameId", "startedAt");
```

## Politique de rétention des données

| Table | Rétention | Raison |
|-------|-----------|--------|
| WalletTransaction | Permanente (7 ans) | Obligation comptable |
| ChallengeResult | Permanente | Audit anti-fraude |
| PlayerSession | 2 ans | Analytics |
| MatchmakingQueue | 24h | Opérationnel |
| ApiUsage | 90 jours | Monitoring |
| Notification | 30 jours | UX |
