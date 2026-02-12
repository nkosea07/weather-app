# Weather Data Integration Platform

A Spring Boot application that integrates with the OpenWeatherMap API to provide weather data management and forecasting capabilities.

## Overview

This application demonstrates:
- Third-party API integration with OpenWeatherMap
- Local data persistence with PostgreSQL
- RESTful API design with full CRUD operations
- Data caching and synchronization
- Clean architecture with separation of concerns

## Features

### Core Functionality
- **Weather Data Management**: Add, update, delete, and view weather locations
- **Current Weather**: Fetch real-time weather data for tracked locations
- **5-Day Forecast**: Get extended weather forecasts
- **User Preferences**: Configure units, refresh intervals, and auto-refresh settings
- **Data Persistence**: Historical weather snapshots with timestamps
- **Caching**: Intelligent caching to minimize API calls

### API Endpoints

#### Weather Management
- `GET /api/weather/locations` - Get all tracked locations with current weather
- `GET /api/weather/locations/{id}` - Get weather for specific location
- `POST /api/weather/locations` - Add new location
- `PUT /api/weather/locations/{id}` - Update location details
- `DELETE /api/weather/locations/{id}` - Remove location
- `POST /api/weather/locations/{id}/refresh` - Refresh weather data

#### Forecast
- `GET /api/forecast/{locationId}` - Get 5-day forecast for location

#### User Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences

### Query Parameters
All weather endpoints support optional units parameter:
- `?units=METRIC` (default) - Celsius, m/s, etc.
- `?units=IMPERIAL` - Fahrenheit, mph, etc.
- `?units=STANDARD` - Kelvin, m/s, etc.

## Technical Architecture

### Technology Stack
- **Backend**: Spring Boot 3.x
- **Database**: PostgreSQL with Flyway migrations
- **ORM**: Spring Data JPA with Hibernate
- **Caching**: Caffeine
- **External API**: OpenWeatherMap API
- **Build Tool**: Maven
- **Java Version**: 17+

### Project Structure
```
backend/
├── src/main/java/com/uzwide/WeatherApp/
│   ├── controller/          # REST API endpoints
│   ├── service/            # Business logic
│   ├── model/              # JPA entities
│   ├── repositories/       # Data access layer
│   ├── dto/                # Data transfer objects
│   ├── exception/          # Custom exceptions
│   └── config/             # Configuration classes
├── src/main/resources/
│   ├── db/migration/       # Flyway database migrations
│   └── application.properties
└── src/test/              # Unit and integration tests
```

### Database Schema
- **locations**: Stores user-tracked locations
- **weather_snapshots**: Historical weather data
- **user_preferences**: Application settings

## Setup Instructions

### Prerequisites
- Java 17 or higher
- PostgreSQL 12 or higher
- Maven 3.6 or higher
- OpenWeatherMap API key

### 1. Database Setup
```sql
CREATE DATABASE weather_db;
CREATE USER weather_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE weather_db TO weather_user;
```

### 2. Environment Configuration
Set the following environment variables:
```bash
export WEATHER_API_KEY=your_openweathermap_api_key
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/weather_db
export SPRING_DATASOURCE_USERNAME=weather_user
export SPRING_DATASOURCE_PASSWORD=your_password
```

Or update `application.properties` directly.

### 3. OpenWeatherMap API
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Set the `WEATHER_API_KEY` environment variable

### 4. Build and Run
```bash
# Build the application
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 5. Database Migration
Flyway will automatically run database migrations on startup. No manual setup required.

## API Usage Examples

### Add a Location
```bash
curl -X POST http://localhost:8080/api/weather/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "London",
    "country": "GB",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "displayName": "London, UK",
    "isFavorite": true
  }'
```

### Get Weather with Imperial Units
```bash
curl "http://localhost:8080/api/weather/locations/1?units=IMPERIAL"
```

### Get 5-Day Forecast
```bash
curl "http://localhost:8080/api/forecast/1?units=METRIC"
```

### Update User Preferences
```bash
curl -X PUT http://localhost:8080/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "defaultUnits": "IMPERIAL",
    "refreshIntervalMinutes": 15,
    "autoRefreshEnabled": true
  }'
```

## Architectural Decisions

### 1. Separation of Concerns
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and orchestration
- **Repositories**: Manage data access
- **DTOs**: Separate API contracts from domain models

### 2. Data Persistence Strategy
- **WeatherSnapshots**: Store historical data for audit trail
- **Caching**: Reduce API calls with 30-minute cache TTL
- **Flyway**: Version-controlled database migrations

### 3. Error Handling
- Custom exceptions for different error scenarios
- Global exception handler for consistent error responses
- Graceful API error handling with proper logging

### 4. Performance Considerations
- Database indexes on frequently queried fields
- Caching strategy to minimize external API calls
- Lazy loading for entity relationships

## Assumptions Made

1. **Single User System**: Application assumes one user with global preferences
2. **API Rate Limits**: OpenWeatherMap free tier (1000 calls/day)
3. **Data Freshness**: 30-minute cache TTL balances freshness and performance
4. **Units Support**: All three OpenWeatherMap unit systems supported
5. **Database**: PostgreSQL chosen for robustness and SQL compliance

## Testing

Run the test suite:
```bash
mvn test
```

## Future Enhancements

- **Multi-user Support**: Add authentication and user-specific data
- **Background Jobs**: Automatic weather data refresh
- **Rate Limiting**: API endpoint protection
- **WebSocket Support**: Real-time weather updates
- **Mobile App**: React Native or Flutter application
- **Advanced Caching**: Redis for distributed caching

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check connection string in application.properties
   - Ensure database user has proper permissions

2. **API Key Issues**
   - Verify WEATHER_API_KEY environment variable is set
   - Check API key is valid and active
   - Monitor API usage limits

3. **Migration Failures**
   - Check database permissions
   - Verify Flyway baseline configuration
   - Review migration SQL syntax

### Logging
Application logs include:
- API call details and errors
- Database operation logs
- Cache hit/miss statistics
- Performance metrics

## License

This project is for educational/assessment purposes.

## Contact

For questions about this implementation, please refer to the assessment guidelines.

- 🌤️ Real-time weather data from OpenWeatherMap
- 📍 Track multiple locations with custom display names
- ⭐ Favorite locations for quick access
- 📅 5-day weather forecast
- 🔄 Manual and automatic data synchronization
- 💾 Persistent storage with PostgreSQL
- 🎨 Responsive, modern UI
- ⚡ Caching for optimal API usage

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2
- Spring Data JPA
- PostgreSQL
- Flyway (database migrations)
- Caffeine Cache
- Lombok

### Frontend
- React 18
- Axios for API calls
- React Hot Toast for notifications
- Tailwind CSS for styling
- date-fns for date formatting

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- OpenWeatherMap API key (free tier)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd weather-platform