CREATE TABLE weather_snapshots (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2) NOT NULL,
    feels_like DECIMAL(5,2) NOT NULL,
    humidity INTEGER NOT NULL,
    pressure INTEGER NOT NULL,
    wind_speed DECIMAL(6,2) NOT NULL,
    wind_direction INTEGER NOT NULL,
    weather_condition VARCHAR(50) NOT NULL,
    weather_description VARCHAR(200) NOT NULL,
    weather_icon VARCHAR(10) NOT NULL,
    cloudiness INTEGER NOT NULL,
    visibility INTEGER NOT NULL,
    fetched_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weather_snapshots_location_fetched ON weather_snapshots(location_id, fetched_at DESC);
CREATE INDEX idx_weather_snapshots_fetched_at ON weather_snapshots(fetched_at DESC);
