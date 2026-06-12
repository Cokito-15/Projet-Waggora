# Waggora — API B2B Gaming Competitive Layer

## 📖 Project Overview

Waggora is a B2B API designed for mobile game studios (Casual & Hybrid Casual) to add a competitive layer without modifying core gameplay.

**Key Features:**
- Direct challenges between players
- Asynchronous challenges
- Token-based economy
- Marketplace for rewards
- Real-time analytics dashboard
- Studio integration via simple REST API

## 🚀 Quick Start

See [SETUP.md](./docs/SETUP.md) for detailed installation instructions.

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for local dev)

### Development

```bash
# Clone and setup
git clone https://github.com/Cokito-15/Projet-Waggora.git
cd Projet-Waggora

# Install dependencies
npm install

# Setup database
npm run db:setup

# Run development server
npm run dev
```

API available at: `http://localhost:3000/api`  
Frontend available at: `http://localhost:3000`

## 📁 Project Structure

```
Projet-Waggora/
├── apps/
│   ├── api/                    # Next.js API (backend)
│   └── web/                    # Next.js web app (frontend)
├── packages/
│   ├── db/                     # Prisma schemas & migrations
│   ├── shared/                 # Shared types & utilities
│   └── ui/                     # UI components library
├── docs/                       # Documentation
│   ├── SETUP.md               # Setup guide
│   ├── API.md                 # API documentation
│   ├── ARCHITECTURE.md        # System architecture
│   └── swagger.json           # OpenAPI spec
├── docker-compose.yml         # Local development stack
└── package.json
```

## 🛠 Tech Stack

### Backend
- **Framework**: Next.js 14+ (API Routes + serverless)
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Auth**: NextAuth.js (JWT)
- **Payments**: Stripe
- **Monitoring**: Sentry + PostHog

### Frontend
- **Framework**: React 18+ + Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [Setup Instructions](./docs/SETUP.md)
- [Swagger/OpenAPI](./docs/swagger.json)

## 🎯 MVP Features

### Phase 1: Core Mechanics (M0-M6)
- [x] Player authentication
- [x] Wallet system
- [x] Direct challenges
- [x] Matchmaking algorithm
- [x] Result engine
- [x] Multiplier wheel
- [x] Basic analytics
- [x] Studio integration API

### Phase 2: Marketplace & Native Apps (M6-M13+)
- [ ] Marketplace module
- [ ] Partner rewards
- [ ] iOS/Android native apps
- [ ] Social features
- [ ] Advanced analytics

## 📊 Key Endpoints

```
POST   /api/auth/register          # Player registration
POST   /api/auth/login             # Player login
GET    /api/player/me              # Get current player
GET    /api/wallet                 # Get player wallet
POST   /api/challenges/direct      # Create direct challenge
GET    /api/challenges/:id         # Get challenge details
POST   /api/results/submit         # Submit game result
GET    /api/leaderboard            # Get global leaderboard
GET    /api/analytics/dashboard    # Studio dashboard
```

Full API spec: [API Documentation](./docs/API.md) | [Swagger](./docs/swagger.json)

## 🔐 Security

- JWT-based authentication
- Password hashing (bcrypt)
- Rate limiting on all endpoints
- CORS configured
- HTTPS enforced in production
- Stripe webhook signature verification

## 🚀 Deployment

### Production
```bash
npm run build
npm run start
```

Deployment targets:
- Vercel (recommended for Next.js)
- AWS Lambda (serverless)
- Docker container (self-hosted)

See [SETUP.md](./docs/SETUP.md) for detailed deployment guides.

## 📈 Monitoring & Analytics

- **Sentry**: Error tracking & performance monitoring
- **PostHog**: Product analytics & user behavior
- **Database**: Query performance monitoring

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add: your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📝 License

Proprietary — Waggora SAS

## 📧 Contact

- **Email**: contact@waggora.com
- **Website**: https://waggora.com
- **Documentation**: https://docs.waggora.com

---

**Version**: 1.0.0-MVP  
**Last Updated**: 2026-06-12
