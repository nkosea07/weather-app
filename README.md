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
└── docs/                   # Project documentation assets
```

## Stack

- Backend: Java 17, Spring Boot, Spring Data JPA, Flyway, PostgreSQL, Caffeine
- Frontend: React 18, Axios, Tailwind CSS
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

## Docker (Full Stack)

Run all services together:

```bash
export WEATHER_API_KEY=your_openweathermap_api_key # optional, defaults to demo_key
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

Stop:

```bash
docker compose down
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
