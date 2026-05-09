# SA Bookings - Enterprise Accommodation Booking Platform

A full-stack, enterprise-ready web application for booking accommodation across all 9 provinces of South Africa.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express, TypeScript, TypeORM |
| **Database** | PostgreSQL 16 |
| **Caching** | Redis 7 |
| **Payments** | Stripe |
| **Auth** | JWT (access + refresh tokens) |
| **API Docs** | Swagger/OpenAPI 3.0 |
| **Containerization** | Docker, Docker Compose |
| **Monitoring** | Prometheus, Grafana |
| **CI/CD** | GitHub Actions |

## Project Structure

```
sa-bookings/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/             # App configuration, database, logger
│   │   ├── controllers/        # Route handlers
│   │   ├── entities/           # TypeORM entities (User, Accommodation, Booking, Payment, Review)
│   │   ├── middleware/         # Auth, validation, error handling, rate limiting
│   │   ├── repositories/      # Data access layer (Repository pattern)
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Business logic layer
│   │   ├── types/             # TypeScript types and enums
│   │   ├── utils/             # Swagger config, helpers
│   │   ├── seeds/             # Database seed data
│   │   ├── test/              # Jest test suites
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript interfaces
│   │   ├── App.tsx            # Root component with routing
│   │   └── index.tsx          # Entry point
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker/
│   ├── nginx/nginx.conf       # Reverse proxy config
│   ├── prometheus/prometheus.yml
│   └── grafana/datasources.yml
├── infra/
│   ├── terraform/             # IaC for AWS/Azure
│   └── k8s/                   # Kubernetes manifests
├── scripts/                   # Utility scripts
├── docker-compose.yml         # Full stack orchestration
└── .github/workflows/ci-cd.yml
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (if running without Docker)

### 1. Clone and Install

```bash
git clone <repo-url> sa-bookings
cd sa-bookings

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Environment Configuration

```bash
cp backend/.env backend/.env.local
# Edit backend/.env.local with your settings
```

### 3. Run with Docker (Recommended)

```bash
docker-compose up -d
```

This starts: PostgreSQL, Redis, Backend API, Frontend, Nginx, Prometheus, and Grafana.

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000/api/v1
- **Swagger Docs:** http://localhost:4000/api-docs
- **Grafana:** http://localhost:3001 (admin/admin)

### 5. Seed Data

The application auto-seeds on first startup in development mode. Default accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sabookings.co.za | Password123 |
| Host | thabo@example.com | Password123 |
| Host | sarah@example.com | Password123 |
| Tourist | alice@example.com | Password123 |
| Tourist | bob@example.com | Password123 |

## Database Schema

### Entity Relationship Diagram

```
┌─────────┐     ┌────────────────┐     ┌──────────┐
│  User   │1──N│ Accommodation  │1──N│  Booking │
├─────────┤     ├────────────────┤     ├──────────┤
│ id      │     │ id             │     │ id       │
│ email   │     │ name           │     │ reference│
│ password│     │ type (enum)    │     │ checkIn  │
│ role    │     │ province (enum)│     │ checkOut │
│ name    │     │ pricePerNight  │     │ guests   │
│ phone   │     │ maxGuests      │     │ status   │
│         │     │ amenities[]    │     │ total    │
└─────────┘     │ hostId ───┐    │     │ userId   │
       │        └───────────┼────┘     └─────┬────┘
       │                   N                 │
       │        ┌───────────┼────┐           │
       └───N──N─┤  Review   │    │           │
                ├───────────┘    │     ┌──────┴──────┐
                │ id             │     │   Payment   │
                │ rating         │     ├─────────────┤
                │ comment        │     │ id          │
                │ userId         │     │ stripeId    │
                │ accommodationId│     │ amount      │
                └────────────────┘     │ status      │
                                       └─────────────┘
```

### Key Features
- **Users** - Role-based (tourist, host, admin) with JWT authentication
- **Accommodations** - Full-text searchable with 10 types across 9 provinces
- **Bookings** - Unique reference numbers, availability checking, cancellation workflow
- **Payments** - Stripe integration with webhook handling
- **Reviews** - Verified purchase tagging, host response capability

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh-token` | Refresh JWT |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/profile` | Get profile |
| PUT | `/api/v1/auth/profile` | Update profile |
| PUT | `/api/v1/auth/change-password` | Change password |

### Accommodations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accommodations/search` | Search with filters |
| GET | `/api/v1/accommodations/featured` | Featured listings |
| GET | `/api/v1/accommodations/province-counts` | Counts by province |
| GET | `/api/v1/accommodations/:id` | Get details |
| POST | `/api/v1/accommodations` | Create listing (host) |
| PUT | `/api/v1/accommodations/:id` | Update listing (host) |
| DELETE | `/api/v1/accommodations/:id` | Soft delete (host) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/bookings` | Create booking |
| GET | `/api/v1/bookings` | My bookings |
| GET | `/api/v1/bookings/:id` | Booking details |
| GET | `/api/v1/bookings/reference/:ref` | Lookup by reference |
| PUT | `/api/v1/bookings/:id/cancel` | Cancel booking |

### Payments (Stripe)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/create-payment-intent` | Create intent |
| POST | `/api/v1/payments/webhook` | Stripe webhook |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reviews/accommodation/:id` | Accommodation reviews |
| POST | `/api/v1/reviews` | Create review |
| PUT | `/api/v1/reviews/:id` | Update review |
| DELETE | `/api/v1/reviews/:id` | Delete review |
| PUT | `/api/v1/reviews/:id/respond` | Host response |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard stats |
| GET | `/api/v1/admin/users` | List users |
| PUT | `/api/v1/admin/users/:id/toggle-status` | Toggle user active |

## Example API Requests

### Register a tourist
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "password": "SecurePass123",
    "role": "tourist"
  }'
```

### Search accommodations in Western Cape
```bash
curl "http://localhost:4000/api/v1/accommodations/search?province=Western%20Cape&minPrice=1000&maxPrice=5000&guests=2&sortBy=pricePerNight&sortOrder=ASC"
```

### Create a booking
```bash
curl -X POST http://localhost:4000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "accommodationId": "<uuid>",
    "checkIn": "2026-06-15",
    "checkOut": "2026-06-18",
    "guests": 2,
    "specialRequests": "Early check-in preferred"
  }'
```

### Response format
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reference": "SAK2F3X1P9",
    "status": "confirmed",
    "totalAmount": 4500,
    "checkIn": "2026-06-15",
    "checkOut": "2026-06-18"
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Enterprise Features

### Security
- **JWT authentication** with access + refresh token rotation
- **Role-based access control** (tourist, host, admin)
- **Rate limiting** (100 req/15min general, 10 req/15min auth)
- **Helmet** security headers (CSP, HSTS, XSS protection)
- **Input validation** via express-validator
- **bcrypt** password hashing (cost factor 12)
- **SQL injection prevention** via TypeORM parameterized queries

### Monitoring & Observability
- **Structured logging** with Winston (file + console transports)
- **Prometheus metrics** endpoint for performance monitoring
- **Grafana dashboards** for visualization
- **Health check endpoint** at `/api/health`

### Error Handling
- Global error handling middleware
- Operational vs programmer error distinction
- Detailed error logging with stack traces
- Graceful error responses to clients

### Caching Strategy
- **Redis** for session storage and rate limiting
- Browser caching for static assets (1 year)
- Nginx reverse proxy caching
- Database query result caching (recommended)

### Scalability
- **Horizontal scaling**: Stateless API servers behind load balancer
- **Database**: PostgreSQL replication (read replicas)
- **Caching**: Redis cluster
- **CDN**: CloudFront/Cloudflare for static assets
- **Auto-scaling**: Kubernetes HPA based on CPU/memory

## Deployment

### Docker Compose (Development/Staging)
```bash
docker-compose up -d --build
```

### Kubernetes (Production)
```bash
kubectl apply -f infra/k8s/
```

### Cloud Deployment Strategy

**AWS:**
1. ECS Fargate or EKS for container orchestration
2. RDS PostgreSQL with Multi-AZ deployment
3. ElastiCache Redis cluster
4. Application Load Balancer with SSL termination
5. CloudFront CDN for static assets
6. Route53 for DNS management
7. CloudWatch for logging and monitoring

**Azure:**
1. AKS for container orchestration
2. Azure Database for PostgreSQL Flexible Server
3. Azure Cache for Redis
4. Application Gateway with WAF
5. Azure Front Door CDN
6. Azure Monitor + Application Insights

## Testing

```bash
# Backend tests
cd backend && npm test

# With coverage
npm run test:coverage

# Frontend tests
cd frontend && npm test
```

## Performance Optimizations

1. **Database**: Indexes on frequently queried columns, query optimization
2. **Caching**: Redis for session data, computed aggregates
3. **API**: Pagination, selective field loading, compression
4. **Frontend**: Code splitting, lazy loading, image optimization
5. **CDN**: Static asset delivery via CDN
6. **Connection pooling**: Database connection pooling via TypeORM

## Future Scaling & Features

### Phase 2 - Enhanced Features
- **Real-time availability calendar**
- **Multi-currency support** (ZAR, USD, EUR, GBP)
- **Wishlist / Saved properties**
- **Messaging system** between guests and hosts
- **Advanced search** with map integration (Mapbox/Google Maps)

### Phase 3 - Platform Growth
- **Microservices migration** (booking service, payment service, notification service)
- **Event-driven architecture** with message queue (RabbitMQ/AWS SQS)
- **Search optimization** with Elasticsearch
- **Recommendation engine** using ML
- **Mobile apps** (React Native)

### Phase 4 - Enterprise
- **Multi-language support** (i18n)
- **Compliance** (POPIA, GDPR, PCI-DSS)
- **Advanced analytics** with data warehouse
- **A/B testing infrastructure**
- **Feature flags** for progressive rollout

## License

Private / Proprietary
