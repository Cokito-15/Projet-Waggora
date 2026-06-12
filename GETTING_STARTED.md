# Waggora MVP — Getting Started

Welcome to the Waggora MVP project! This document will help you get started with development.

## Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Cokito-15/Projet-Waggora.git
cd Projet-Waggora

# 2. Run setup script
bash scripts/setup.sh

# 3. Update environment variables
vim .env
vim apps/api/.env
vim apps/web/.env

# 4. Start development
npm run dev
```

Then visit:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- Database Studio: Run `npm run db:studio`

---

## Project Structure

```
Projet-Waggora/
├── apps/
│   ├── api/              # Backend API (Next.js)
│   │   ├── src/pages/api/
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   ├── player/   # Player endpoints
│   │   │   ├── wallet/   # Wallet endpoints
│   │   │   ├── challenges/
│   │   │   ├── results/
│   │   │   ├── leaderboard/
│   │   │   ├── marketplace/
│   │   │   └── analytics/
│   │   └── src/lib/      # Utilities (auth, etc.)
│   └── web/              # Frontend (Next.js + React)
│       ├── src/pages/
│       │   ├── index.tsx      # Landing page
│       │   ├── login.tsx      # Login
│       │   ├── register.tsx   # Register
│       │   └── dashboard.tsx  # Player dashboard
│       └── src/components/
├── packages/
│   ├── db/               # Prisma schemas & migrations
│   ├── shared/           # Shared types
│   └── ui/               # UI components library
├── docs/
│   ├── SETUP.md          # Setup guide
│   ├── API.md            # API documentation
│   ├── ARCHITECTURE.md   # Architecture overview
│   ├── DATABASE.md       # Database schema
│   ├── ROADMAP.md        # Development roadmap
│   └── swagger.json      # OpenAPI specification
├── docker-compose.yml    # Local development stack
└── scripts/
    ├── setup.sh          # Initial setup
    └── clean.sh          # Clean dependencies
```

---

## Development Workflow

### Starting Development

```bash
# Start all services
npm run dev

# This will start:
# - API on http://localhost:3000
# - Frontend on http://localhost:3000 (same port, different route)
# - Prisma auto-migration on schema changes
```

### Database Operations

```bash
# View/edit data in Prisma Studio
npm run db:studio

# Create a new migration
npm run db:migrate

# Push schema to database
npm run db:push

# Reset database (⚠️ deletes all data)
npm run db:push -- --force-reset
```

### Code Quality

```bash
# Lint code
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new player
- `POST /api/auth/login` - Login player

### Player
- `GET /api/player/me` - Get current player profile

### Wallet
- `GET /api/wallet/balance` - Get wallet balance & history

### Challenges
- `POST /api/challenges/direct` - Create direct challenge
- `GET /api/challenges/:id` - Get challenge details

### Results
- `POST /api/results/submit` - Submit game result

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard

### Marketplace
- `GET /api/marketplace/items` - Get marketplace items
- `POST /api/marketplace/purchase` - Purchase item

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics

**Full API docs**: [Swagger/OpenAPI](./docs/swagger.json) | [API Documentation](./docs/API.md)

---

## Environment Variables

### `.env` (Root)
```env
# Database
DATABASE_URL="postgresql://waggora:waggora@localhost:5432/waggora_db"

# JWT
JWT_SECRET="your-secret-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Environment
NODE_ENV="development"
```

### `apps/api/.env`
```env
DATABASE_URL="postgresql://waggora:waggora@localhost:5432/waggora_db"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### `apps/web/.env`
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## Testing

### Manual Testing

1. **Register a player**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testplayer",
    "password": "SecurePass123"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

3. **Get player profile**
```bash
curl -X GET http://localhost:3000/api/player/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Unit Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### AWS Lambda + RDS

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

---

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5432
lsof -ti:5432 | xargs kill -9
```

### Database connection error

```bash
# Check Docker containers
docker-compose ps

# Start containers
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Node modules issues

```bash
# Clean and reinstall
bash scripts/clean.sh
npm install
```

### Build errors

```bash
# Clear build cache
rm -rf .next dist

# Rebuild
npm run build
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add: your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Code Style

- Use TypeScript
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Support

- **Documentation**: https://docs.waggora.com
- **Issues**: https://github.com/Cokito-15/Projet-Waggora/issues
- **Email**: support@waggora.com

---

**Happy coding! 🚀**
