# Requirements Traceability

Source document: `docs/Systems Development Assesment.docx`

## Functional Requirements

| Requirement | Status | Implementation Notes |
|---|---|---|
| Fetch current weather for a city | Implemented | Backend weather service + `/api/weather/*` endpoints |
| Fetch 5-day forecast for a city | Implemented | Forecast service + `/api/forecast/{locationId}` |
| Handle API errors gracefully | Implemented | Backend global exception handling + frontend error toasts/messages |
| Persist locations, snapshots, preferences | Implemented | PostgreSQL entities + Flyway migrations |
| Full location CRUD | Implemented | Create/read/update/delete endpoints and UI actions |
| Web UI for watchlist + weather | Implemented | Dashboard, cards, add-location modal |
| View forecast for selected city | Implemented | Forecast modal triggered per location |
| Show last synced timestamp | Implemented | `lastUpdated` displayed in weather cards |
| Manual data refresh | Implemented | Per-location refresh and refresh-all actions |
| Sync conflict handling | Implemented | Significant drift detection logs and snapshot preservation |

## Technical Requirements

| Requirement | Status | Notes |
|---|---|---|
| Mainstream language and framework | Implemented | Java/Spring Boot backend, React frontend |
| README with setup/run/docs | Implemented | Root `README.md` includes setup, architectural decisions, and assumptions |
| Unit tests | Implemented | Backend + frontend service-layer tests |
| Schema/migrations included | Implemented | Flyway SQL migrations in backend resources |

## Bonus Coverage (Partial)

| Bonus Item | Status | Notes |
|---|---|---|
| Docker setup | Implemented | `docker-compose.yml` + Dockerfiles |
| Caching strategy | Implemented | Caffeine caching in backend |
| Polished UI/UX | Implemented | Responsive dashboard, map/manual location entry, clearer feedback |
| Accessibility improvements | Partial | Added labels for icon-only controls |
