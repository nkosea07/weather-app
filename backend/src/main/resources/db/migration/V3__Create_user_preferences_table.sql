CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    default_units VARCHAR(20) NOT NULL DEFAULT 'METRIC',
    refresh_interval_minutes INTEGER NOT NULL DEFAULT 30,
    auto_refresh_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO user_preferences (default_units, refresh_interval_minutes, auto_refresh_enabled) 
VALUES ('METRIC', 30, FALSE);
