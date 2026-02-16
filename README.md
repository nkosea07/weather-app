# Weather App Monorepo

Weather platform with a Spring Boot backend and React frontend.

## Repository Structure

```text
.
├── backend/                # Spring Boot API + database migrations + backend tests
├── frontend/               # React app + frontend tests
├── docker-compose.yml      # Local full-stack orchestration (db + backend + frontend)
├── pom.xml                 # Maven aggregator (root)
├── mvnw / mvnw.cmd         # Maven wrapper
└── docs/                   # Project documentation assets and requirements traceability
```

## Stack

- Backend: Java 17, Spring Boot, Spring Data JPA, Flyway, PostgreSQL, Caffeine, Spring Security
- Frontend: React 18, Axios, Tailwind CSS, react-hot-toast
- Tooling: Maven wrapper, npm, Docker Compose

## Prerequisites

- Java 17+
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (for local non-Docker backend runs)
- OpenWeatherMap API key

## Local Development

### 1. Backend

Set environment variables:

```bash
export WEATHER_API_KEY=your_openweathermap_api_key
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/weather_db
export SPRING_DATASOURCE_USERNAME=weather_user
export SPRING_DATASOURCE_PASSWORD=your_password
```

Run backend from repo root:

```bash
./mvnw -pl backend spring-boot:run
```

Backend API: `http://localhost:8080`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend app: `http://localhost:3000`

## Docker Compose (Full Stack)

### Quick Start

```bash
# 1. Set your OpenWeatherMap API key
export WEATHER_API_KEY=your_openweathermap_api_key

# 2. Start all services
docker compose up --build
```

### Services

| Service | URL | Description |
|---|---|---|
| **frontend** | `http://localhost:3000` | React app (depends on backend) |
| **backend** | `http://localhost:8080` | Spring Boot API (waits for DB health check) |
| **db** | `localhost:5432` | PostgreSQL 16 with persistent volume |

### Environment Variables

Set these in your shell or in a `.env` file in the project root.

| Variable | Default | Used By | Description |
|---|---|---|---|
| `WEATHER_API_KEY` | `demo_key` | backend, frontend | OpenWeatherMap API key |
| `POSTGRES_DB` | `weather_db` | db, backend | PostgreSQL database name |
| `POSTGRES_USER` | `weather_user` | db, backend | PostgreSQL username |
| `REACT_APP_API_URL` | `http://localhost:8080/api` | frontend | Backend API base URL |

### Commands

```bash
# Start all services (foreground)
docker compose up --build

# Start in detached (background) mode
docker compose up --build -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove data volume (fresh database)
docker compose down -v
```

## Testing

From repo root:

```bash
# Backend tests
./mvnw -pl backend test

# Frontend tests
cd frontend && CI=true npm test -- --watchAll=false
```

## API Summary

- `GET /api/weather/locations`
- `GET /api/weather/locations/{id}`
- `POST /api/weather/locations`
- `PUT /api/weather/locations/{id}`
- `DELETE /api/weather/locations/{id}`
- `POST /api/weather/locations/{id}/refresh`
- `GET /api/forecast/{locationId}`
- `GET /api/preferences`
- `PUT /api/preferences`

Units query param supported: `METRIC`, `IMPERIAL`, `STANDARD`.

## Requirement Coverage

- API Integration:
  - Current weather and 5-day forecast are fetched from OpenWeatherMap.
  - API failures are surfaced with graceful backend errors and frontend notifications.
- Database & Persistence:
  - Locations, weather snapshots, and user preferences are persisted in PostgreSQL.
  - Flyway migrations are included under `backend/src/main/resources/db/migration/`.
- CRUD Operations:
  - Full create/read/update/delete flows are implemented for tracked locations.
- Web UI:
  - Users can add/remove locations, view current weather, view forecast, see last-sync time, and manually refresh weather data.
  - Location add flow supports city search, map-based coordinate selection (online), and manual coordinate fallback.
- Data Synchronization:
  - On-demand sync is implemented per location and for all locations.
  - Background sync scheduler (`WeatherSyncScheduler`) periodically refreshes all locations when auto-refresh is enabled in user preferences.
  - Frontend auto-refresh polls at the user-configured interval.
  - Last sync is stored per snapshot (`fetchedAt`) and exposed in API/UI.
  - Significant data drift is explicitly handled by preserving historical snapshots and logging conflict events.
- Rate Limiting:
  - In-memory sliding window rate limiter (`RateLimitFilter`) enforces 60 requests/minute per IP.
  - Returns HTTP 429 with `Retry-After` header when exceeded.
- Tests:
  - Backend: `WeatherServiceTest`, `UserPreferencesServiceTest`, `ForecastServiceTest`, `WeatherSyncSchedulerTest`.
  - Frontend: `weatherService.test.js`, `userPreferencesService.test.js`.

## Architectural Decisions

- Monorepo layout:
  - Root Maven aggregator manages module build (`backend`) while frontend remains an npm app.
- Layered backend architecture:
  - Controllers, services, repositories, DTOs, and exception handlers are separated for maintainability.
- External API isolation:
  - Weather and forecast calls are centralized in service classes with consistent error translation.
- Persistence-first sync strategy:
  - Every refresh stores a new snapshot to preserve historical state and auditability.
- Caching:
  - Caffeine caching reduces repeated API calls for weather and forecast endpoints.
- Rate limiting:
  - Servlet filter with per-IP sliding window, registered in the Spring Security filter chain.
- Background sync:
  - `@Scheduled` job checks user preferences and refreshes all tracked locations on a configurable interval (`weather.sync.interval`, default 30 minutes).

## Assumptions

- Single-user preference model is sufficient for the current scope.
- OpenWeatherMap free-tier constraints are acceptable for this challenge.
- Conflict handling for synchronization is defined as:
  - Preserve both old and new snapshots.
  - Log significant drift for operational visibility.
- Default Docker setup is for local development, not hardened production deployment.

## User Friendliness and Accessibility

- Clear empty states and action prompts are included in the dashboard.
- Error and success toasts are surfaced for key user actions.
- Add-location modal supports multiple input paths (search, map, manual coordinates).
- Inline display name editing directly on weather cards.
- Responsive layout adapts to mobile, tablet, and desktop viewports.
- Icon-only controls include `aria-label` attributes for screen readers.
- Modals use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` for proper dialog semantics.
- Focus traps keep keyboard navigation within open modals; Escape key closes them.
- Navigation uses `aria-current="page"` to indicate the active view.

For detailed requirement-to-implementation mapping, see `docs/Requirements-Traceability.md`.
