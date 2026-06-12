# Waggora — UX & Wireframes Complets

## Principes UX

1. **Friction zéro** — Chaque action = minimum de taps
2. **Clarté financière** — Le joueur sait toujours combien il a/gagne/perd
3. **Feedback immédiat** — Chaque action a une réponse visuelle < 200ms
4. **Sortie facile** — Retour au jeu accessible partout
5. **Confiance** — Résultats transparents, historique accessible

---

## Flux 1 — Défi Direct (parcours principal)

### Écran 1.1 — Jeu principal du studio

```
┌─────────────────────────────┐
│                             │
│     [JEU DU STUDIO]         │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   GAMEPLAY PRINCIPAL  │  │
│  │   (inchangé)          │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Score: 0          Vies: 3  │
│                             │
│  ┌─────────────────────┐    │
│  │  🏆 WAGGORA         │    │
│  │  💎 340             │    │
│  └─────────────────────┘    │
└─────────────────────────────┘

Notes design :
- Bouton Waggora = overlay non-intrusif
- Position flexible (corner, bottom bar)
- Affiche solde en temps réel
- Badge rouge si défi en attente
```

### Écran 1.2 — Menu Waggora (overlay)

```
┌─────────────────────────────┐
│  ╔═══════════════════════╗  │
│  ║  ← Retour              ║  │
│  ║  ─────────────────     ║  │
│  ║  ▓▓▓  WAGGORA  ▓▓▓    ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  👤 ShadowBlade99      ║  │
│  ║  ⭐ Niveau 42           ║  │
│  ║  ─────────────────     ║  │
│  ║  💎 340 jetons          ║  │
│  ║  🔒 50 en jeu           ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  ┌─────────────────┐   ║  │
│  ║  │  ⚔️  DÉFI DIRECT │   ║  │
│  ║  │  Affronter un   │   ║  │
│  ║  │  joueur en live │   ║  │
│  ║  └─────────────────┘   ║  │
│  ║                        ║  │
│  ║  ┌─────────────────┐   ║  │
│  ║  │  ⏱  DÉFI ASYNC  │   ║  │
│  ║  │  Jouer à votre  │   ║  │
│  ║  │  rythme 24h     │   ║  │
│  ║  └─────────────────┘   ║  │
│  ║                        ║  │
│  ║  ┌──────┐  ┌────────┐  ║  │
│  ║  │  🏪  │  │  🏆    │  ║  │
│  ║  │Market│  │Classmt │  ║  │
│  ║  └──────┘  └────────┘  ║  │
│  ║                        ║  │
│  ║  📋 Historique          ║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘
```

### Écran 1.3 — Sélection de mise

```
┌─────────────────────────────┐
│  ╔═══════════════════════╗  │
│  ║  ← Retour   ⚔️ DÉFI   ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  Votre solde :         ║  │
│  ║  💎 340 jetons          ║  │
│  ║                        ║  │
│  ║  Choisissez votre mise ║  │
│  ║                        ║  │
│  ║  ┌─────────┐ ┌───────┐ ║  │
│  ║  │   10    │ │  20   │ ║  │
│  ║  │ JETONS  │ │JETONS │ ║  │
│  ║  │         │ │       │ ║  │
│  ║  │ Gain max│ │Gn max │ ║  │
│  ║  │   20T   │ │  40T  │ ║  │
│  ║  └─────────┘ └───────┘ ║  │
│  ║                        ║  │
│  ║  ┌─────────┐ ┌───────┐ ║  │
│  ║  │   50    │ │  100  │ ║  │
│  ║  │ JETONS  │ │JETONS │ ║  │
│  ║  │ ★ POP  │ │       │ ║  │
│  ║  │ Gn max │ │Gn max │ ║  │
│  ║  │   100T  │ │  200T │ ║  │
│  ║  └─────────┘ └───────┘ ║  │
│  ║                        ║  │
│  ║  💡 Gain max = mise × 2║  │
│  ║     selon multiplicateur║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘
```

### Écran 1.4 — Recherche d'adversaire

```
┌─────────────────────────────┐
│  ╔═══════════════════════╗  │
│  ║                        ║  │
│  ║                        ║  │
│  ║    ╔═══════════════╗   ║  │
│  ║    ║               ║   ║  │
│  ║    ║   👤    ⚔️    ║   ║  │
│  ║    ║  Vous          ║   ║  │
│  ║    ╚═══════════════╝   ║  │
│  ║                        ║  │
│  ║    Recherche d'un      ║  │
│  ║    adversaire...       ║  │
│  ║                        ║  │
│  ║  ░░░░░░░░░░████████    ║  │
│  ║  Environ 8 secondes    ║  │
│  ║                        ║  │
│  ║  Mise bloquée : 💎 50  ║  │
│  ║  (remboursée si 30s)   ║  │
│  ║                        ║  │
│  ║  ┌──────────────────┐  ║  │
│  ║  │   ✕  Annuler     │  ║  │
│  ║  └──────────────────┘  ║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘
```

### Écran 1.5 — Adversaire trouvé + Roulette

```
┌─────────────────────────────┐
│  ╔═══════════════════════╗  │
│  ║                        ║  │
│  ║  🎉 ADVERSAIRE TROUVÉ !║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  👤 Vous  VS  👤 PixelK║  │
│  ║  Niv.42       Niv.39   ║  │
│  ║                        ║  │
│  ║  ─────────────────     ║  │
│  ║  🎰 MULTIPLICATEUR     ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  ┌────────────────────┐║  │
│  ║  │ x1.2 │ x1.5 │ x1.8│║  │
│  ║  │──────│═══════│─────│║  │
│  ║  │ x1.3 │►x1.5◄│ x1.9│║  │  ← Animation
│  ║  │──────│═══════│─────│║  │
│  ║  │ x1.4 │ x1.6 │ x2.0│║  │
│  ║  └────────────────────┘║  │
│  ║                        ║  │
│  ║  ✨ Multiplicateur : x1.5║ │
│  ║                        ║  │
│  ║  Mise : 💎 50          ║  │
│  ║  → Victoire : 💎 75    ║  │
│  ║                        ║  │
│  ║  ┌──────────────────┐  ║  │
│  ║  │  🎮 JOUER !      │  ║  │
│  ║  └──────────────────┘  ║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘

Animation roulette :
- Durée : 3 secondes
- Décelération naturelle (ease-out)
- Son : tick-tick-tick → ding!
- La valeur est connue du serveur dès le matching
- L'animation est purement cosmétique (valeur pré-déterminée)
```

### Écran 1.6 — Retour au jeu (pendant la partie)

```
┌─────────────────────────────┐
│                             │
│     [JEU DU STUDIO]         │
│                             │
│  Score: 8,400       Vies: 2 │
│                             │
│  ┌─────────────────────────┐│
│  │⚔️ DÉFI EN COURS  x1.5  ││
│  │vs PixelKnight • 💎50    ││
│  └─────────────────────────┘│
│  ↑ Bannière discrète        │
│                             │
│  [GAMEPLAY INCHANGÉ]        │
│                             │
└─────────────────────────────┘

Note : Une petite bannière indique que le défi est en cours.
Aucune autre modification du jeu.
```

### Écran 1.9 — Résultat

```
┌─────────────────────────────┐
│  ╔═══════════════════════╗  │
│  ║                        ║  │
│  ║  ════ 🏆 VICTOIRE ! ════║  │
│  ║                        ║  │
│  ║  ─────────────────     ║  │
│  ║  Votre score : 12,400  ║  │
│  ║  PixelKnight :  9,800  ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  Multiplicateur : x1.5 ║  │
│  ║                        ║  │
│  ║  ┌──────────────────┐  ║  │
│  ║  │  + 💎 +40 jetons │  ║  │
│  ║  │  (75T - 50T mise)│  ║  │
│  ║  └──────────────────┘  ║  │
│  ║                        ║  │
│  ║  Nouveau solde :       ║  │
│  ║  💎 380 jetons          ║  │
│  ║                        ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  ┌──────┐  ┌────────┐  ║  │
│  ║  │Rejou.│  │ Market │  ║  │
│  ║  └──────┘  └────────┘  ║  │
│  ║                        ║  │
│  ║  ┌──────────────────┐  ║  │
│  ║  │  ← Retour au jeu │  ║  │
│  ║  └──────────────────┘  ║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘
```

### Écran 1.9b — Défaite

```
┌─────────────────────────────┐
│  ╔═══════════════════════╗  │
│  ║                        ║  │
│  ║  ════ 😔 DÉFAITE ══════║  │
│  ║                        ║  │
│  ║  Votre score :  9,800  ║  │
│  ║  PixelKnight : 12,400  ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  ┌──────────────────┐  ║  │
│  ║  │  - 💎 -50 jetons │  ║  │
│  ║  └──────────────────┘  ║  │
│  ║                        ║  │
│  ║  Nouveau solde :       ║  │
│  ║  💎 290 jetons          ║  │
│  ║                        ║  │
│  ║  💪 Revanche ?          ║  │
│  ║  PixelKnight joue aussi ║  │
│  ║                        ║  │
│  ║  ┌──────┐  ┌────────┐  ║  │
│  ║  │Revan.│  │ Market │  ║  │
│  ║  └──────┘  └────────┘  ║  │
│  ║                        ║  │
│  ║  ┌──────────────────┐  ║  │
│  ║  │  ← Retour au jeu │  ║  │
│  ║  └──────────────────┘  ║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘
```

---

## Flux 2 — Marketplace

```
┌─────────────────────────────┐
│  ╔═══════════════════════╗  │
│  ║  ← Retour  🏪 MARKET  ║  │
│  ║  💎 380 jetons          ║  │
│  ║  ─────────────────     ║  │
│  ║  [Tous▼] [Prix▼] [Cat]  ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  ┌──────────┐ ┌──────┐ ║  │
│  ║  │ 🐉       │ │ 🚀   │ ║  │
│  ║  │ Skin     │ │Boost │ ║  │
│  ║  │ Dragon   │ │  x2  │ ║  │
│  ║  │          │ │      │ ║  │
│  ║  │ 💎 200T  │ │ 💎50 │ ║  │
│  ║  │[Acheter] │ │[Ach.]│ ║  │
│  ║  └──────────┘ └──────┘ ║  │
│  ║                        ║  │
│  ║  ┌──────────┐ ┌──────┐ ║  │
│  ║  │ 🎁       │ │ 🎟   │ ║  │
│  ║  │Gift Card │ │Event │ ║  │
│  ║  │   5€     │ │  VIP │ ║  │
│  ║  │          │ │      │ ║  │
│  ║  │ 💎 500T  │ │💎300 │ ║  │
│  ║  │[Acheter] │ │[Ach.]│ ║  │
│  ║  └──────────┘ └──────┘ ║  │
│  ║                        ║  │
│  ║  ─────────────────     ║  │
│  ║  Mes achats (3)         ║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘
```

---

## Flux 3 — Classement

```
┌─────────────────────────────┐
│  ╔═══════════════════════╗  │
│  ║  ← Retour  🏆 CLASSMT ║  │
│  ║  [Semaine▼] [Global▼]  ║  │
│  ║  ─────────────────     ║  │
│  ║                        ║  │
│  ║  🥇 #1 DragonSlayer    ║  │
│  ║      89,500 pts  +840T ║  │
│  ║                        ║  │
│  ║  🥈 #2 NeonRider       ║  │
│  ║      76,200 pts  +620T ║  │
│  ║                        ║  │
│  ║  🥉 #3 PixelKnight     ║  │
│  ║      68,900 pts  +480T ║  │
│  ║  ─────────────────     ║  │
│  ║     #4 CosmoViper      ║  │
│  ║     #5 StarForge       ║  │
│  ║     ...                ║  │
│  ║  ─────────────────     ║  │
│  ║  ▶ #23 ShadowBlade99   ║  │  ← Joueur actuel
│  ║      31,200 pts  +180T ║  │
│  ║                        ║  │
│  ║  💡 Top 3 = bonus 50T  ║  │
│  ╚═══════════════════════╝  │
└─────────────────────────────┘
```

---

## Design System

### Couleurs (base Waggora — adaptable par studio)

```
Primary    : #FF6B00  (orange compétitif)
Secondary  : #1A1A2E  (fond sombre)
Accent     : #FFD700  (or pour les gains)
Success    : #00C851  (victoire, jetons gagnés)
Danger     : #FF4444  (défaite, erreur)
Neutral    : #8892A4  (texte secondaire)
Surface    : #242438  (cartes, modales)
```

### Typographie

```
Headings   : Rajdhani Bold (gaming, dynamique)
Body       : Inter Regular (lisibilité)
Numbers    : Rajdhani SemiBold (scores, jetons)
Monospace  : JetBrains Mono (codes, IDs)
```

### Composants récurrents

```
TokenBadge  : 💎 [montant] — toujours visible en haut
ActionCard  : Bouton principal avec icône + titre + sous-titre
ResultCard  : Fond coloré (vert/rouge) + montant ± jetons
RouletteSpin: Animation Canvas (Unity) ou CSS 3D (web)
PlayerAvatar: Cercle 48px avec border coloré selon rang
```

---

## Recommandations Figma

### Organisation des frames

```
Waggora Design System/
├── 🎨 Foundations/
│   ├── Colors
│   ├── Typography
│   ├── Icons
│   └── Spacing
├── 🧩 Components/
│   ├── TokenBadge
│   ├── ChallengeCard
│   ├── PlayerAvatar
│   ├── Roulette
│   ├── ResultModal
│   └── MarketplaceItem
├── 📱 Flows/
│   ├── 01_Direct_Challenge
│   ├── 02_Async_Challenge
│   ├── 03_Marketplace
│   └── 04_Leaderboard
└── 🖥 Dashboard/
    ├── Overview
    ├── Analytics
    ├── Players
    └── Settings
```

### Prototype interactif Figma

- Connecter tous les écrans du flux Défi Direct
- Inclure les transitions (slide + fade)
- Ajouter la micro-animation roulette (GIF ou Lottie)
- Mode mobile (375px) + tablette (768px)
