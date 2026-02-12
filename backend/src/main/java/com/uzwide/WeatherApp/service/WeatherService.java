package com.uzwide.WeatherApp.service;


import com.uzwide.WeatherApp.dto.request.LocationDTO;
import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.dto.response.WeatherResponseDTO;
import com.uzwide.WeatherApp.exception.DuplicateLocationException;
import com.uzwide.WeatherApp.exception.LocationNotFoundException;
import com.uzwide.WeatherApp.exception.WeatherApiException;
import com.uzwide.WeatherApp.model.Location;
import com.uzwide.WeatherApp.model.WeatherSnapshot;
import com.uzwide.WeatherApp.repositories.LocationRepository;
import com.uzwide.WeatherApp.repositories.WeatherSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {
    private static final double SIGNIFICANT_TEMP_DELTA = 8.0;
    private static final int SIGNIFICANT_HUMIDITY_DELTA = 30;
    private static final int SIGNIFICANT_PRESSURE_DELTA = 20;

    private final LocationRepository locationRepository;
    private final WeatherSnapshotRepository weatherSnapshotRepository;
    private final RestTemplate restTemplate;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base-url}")
    private String apiBaseUrl;


    @Transactional
    public Location addLocation(LocationDTO locationDTO) {
        String normalizedCountryCode = normalizeCountryCode(locationDTO.getCountry());
        Optional<Location> existing = locationRepository.findByNameAndCountry(
                locationDTO.getName(), normalizedCountryCode
        );

        if (existing.isPresent()) {
            throw new DuplicateLocationException(
                    String.format("Location %s, %s already exists",
                            locationDTO.getName(), normalizedCountryCode)
            );
        }

        Location location = new Location();
        location.setName(locationDTO.getName());
        location.setCountry(normalizedCountryCode);
        location.setLatitude(locationDTO.getLatitude());
        location.setLongitude(locationDTO.getLongitude());
        location.setDisplayName(locationDTO.getDisplayName());
        location.setIsFavorite(locationDTO.getIsFavorite() != null ? locationDTO.getIsFavorite() : false);

        Location saved = locationRepository.save(location);

        // Fetch initial weather data
        try {
            fetchAndSaveWeatherData(saved, Units.METRIC);
        } catch (Exception e) {
            log.warn("Failed to fetch initial weather for new location: {}", e.getMessage());
        }

        return saved;
    }

    @Cacheable(value = "weather", key = "#locationId + '_' + #units")
    public WeatherResponseDTO getCurrentWeather(Long locationId, Units units) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException("Location not found with id: " + locationId));

        WeatherSnapshot latestSnapshot = weatherSnapshotRepository
                .findFirstByLocationOrderByFetchedAtDesc(location)
                .orElseGet(() -> fetchAndSaveWeatherData(location, units));

        return mapToResponseDTO(location, latestSnapshot);
    }

    public List<WeatherResponseDTO> getAllLocationsWithWeather(Units units) {
        List<Location> locations = locationRepository.findAllOrdered();

        return locations.stream()
                .map(location -> {
                    Optional<WeatherSnapshot> snapshot = weatherSnapshotRepository
                            .findFirstByLocationOrderByFetchedAtDesc(location);
                    return snapshot.map(s -> mapToResponseDTO(location, s))
                            .orElseGet(() -> {
                                WeatherSnapshot newSnapshot = fetchAndSaveWeatherData(location, units);
                                return mapToResponseDTO(location, newSnapshot);
                            });
                })
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "weather", key = "#locationId")
    @Transactional
    public WeatherResponseDTO refreshWeather(Long locationId,Units units) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException("Location not found with id: " + locationId));

        WeatherSnapshot snapshot = fetchAndSaveWeatherData(location,units);
        return mapToResponseDTO(location, snapshot);
    }

    @Transactional
    public Location updateLocation(Long id, LocationDTO locationDTO) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new LocationNotFoundException("Location not found with id: " + id));

        if (locationDTO.getDisplayName() != null) {
            location.setDisplayName(locationDTO.getDisplayName());
        }
        if (locationDTO.getIsFavorite() != null) {
            location.setIsFavorite(locationDTO.getIsFavorite());
        }

        return locationRepository.save(location);
    }

    @Transactional
    @CacheEvict(value = "weather", key = "#id")
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new LocationNotFoundException("Location not found with id: " + id);
        }
        locationRepository.deleteById(id);
    }

    private WeatherSnapshot fetchAndSaveWeatherData(Location location, Units units) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString(apiBaseUrl + "/weather")
                    .queryParam("lat", location.getLatitude())
                    .queryParam("lon", location.getLongitude())
                    .queryParam("appid", apiKey)
                    .queryParam("units", units.name().toLowerCase())
                    .build()
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            Optional<WeatherSnapshot> latestSnapshot = weatherSnapshotRepository
                    .findFirstByLocationOrderByFetchedAtDesc(location);
            WeatherSnapshot weatherSnapshot = mapToWeatherSnapshot(response, location);

            latestSnapshot.ifPresent(previous -> {
                if (isSignificantWeatherDrift(previous, weatherSnapshot)) {
                    log.warn(
                            "Significant weather drift detected for {}. Keeping historical data and appending latest snapshot.",
                            location.getName()
                    );
                }
            });

            weatherSnapshotRepository.save(weatherSnapshot);
            return weatherSnapshot;

        } catch (HttpClientErrorException e) {
            log.error("API error for location {}: {}", location.getName(), e.getStatusCode());
            throw new WeatherApiException("Failed to fetch weather data: " + e.getStatusText());
        } catch (Exception e) {
            log.error("Unexpected error fetching weather data: {}", e.getMessage());
            throw new WeatherApiException("Failed to fetch weather data");
        }
    }

    @SuppressWarnings("unchecked")
    private WeatherSnapshot mapToWeatherSnapshot(Map<String, Object> response, Location location) {
        WeatherSnapshot weatherSnapshot = new WeatherSnapshot();
        weatherSnapshot.setLocation(location);
        weatherSnapshot.setFetchedAt(java.time.LocalDateTime.now());
        
        // Map main weather data
        if (response.containsKey("main")) {
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            weatherSnapshot.setTemperature(((Number) main.get("temp")).doubleValue());
            weatherSnapshot.setFeelsLike(((Number) main.get("feels_like")).doubleValue());
            weatherSnapshot.setHumidity(((Number) main.get("humidity")).intValue());
            weatherSnapshot.setPressure(((Number) main.get("pressure")).intValue());
        }
        
        // Map wind data
        if (response.containsKey("wind")) {
            Map<String, Object> wind = (Map<String, Object>) response.get("wind");
            weatherSnapshot.setWindSpeed(((Number) wind.get("speed")).doubleValue());
            weatherSnapshot.setWindDirection(wind.containsKey("deg") ? ((Number) wind.get("deg")).intValue() : 0);
        }
        
        // Map weather condition
        if (response.containsKey("weather")) {
            List<Map<String, Object>> weather = (List<Map<String, Object>>) response.get("weather");
            if (!weather.isEmpty()) {
                Map<String, Object> weatherData = weather.get(0);
                weatherSnapshot.setWeatherCondition((String) weatherData.get("main"));
                weatherSnapshot.setWeatherDescription((String) weatherData.get("description"));
                weatherSnapshot.setWeatherIcon((String) weatherData.get("icon"));
            }
        }
        
        // Map clouds
        if (response.containsKey("clouds")) {
            Map<String, Object> clouds = (Map<String, Object>) response.get("clouds");
            weatherSnapshot.setCloudiness(((Number) clouds.get("all")).intValue());
        }
        
        // Map visibility
        weatherSnapshot.setVisibility(response.containsKey("visibility") ? ((Number) response.get("visibility")).intValue() : 10000);
        
        return weatherSnapshot;
    }

    private boolean isSignificantWeatherDrift(WeatherSnapshot previous, WeatherSnapshot current) {
        if (previous.getTemperature() == null || current.getTemperature() == null
                || previous.getHumidity() == null || current.getHumidity() == null
                || previous.getPressure() == null || current.getPressure() == null) {
            return false;
        }

        return Math.abs(previous.getTemperature() - current.getTemperature()) >= SIGNIFICANT_TEMP_DELTA
                || Math.abs(previous.getHumidity() - current.getHumidity()) >= SIGNIFICANT_HUMIDITY_DELTA
                || Math.abs(previous.getPressure() - current.getPressure()) >= SIGNIFICANT_PRESSURE_DELTA;
    }

    private WeatherResponseDTO mapToResponseDTO(Location location, WeatherSnapshot weatherSnapshot) {
        return WeatherResponseDTO.builder()
                .locationId(location.getId())
                .locationName(location.getName())
                .displayName(location.getDisplayName())
                .country(location.getCountry())
                .temperature(weatherSnapshot.getTemperature())
                .feelsLike(weatherSnapshot.getFeelsLike())
                .humidity(weatherSnapshot.getHumidity())
                .pressure(weatherSnapshot.getPressure())
                .windSpeed(weatherSnapshot.getWindSpeed())
                .weatherCondition(weatherSnapshot.getWeatherCondition())
                .weatherDescription(weatherSnapshot.getWeatherDescription())
                .weatherIcon(weatherSnapshot.getWeatherIcon())
                .lastUpdated(weatherSnapshot.getFetchedAt())
                .isFavorite(location.getIsFavorite())
                .build();
    }

    private String normalizeCountryCode(String countryInput) {
        if (countryInput == null || countryInput.isBlank()) {
            throw new IllegalArgumentException("Country is required");
        }

        String value = countryInput.trim();
        if (value.length() == 2) {
            return value.toUpperCase(Locale.ROOT);
        }

        for (String isoCode : Locale.getISOCountries()) {
            String displayName = new Locale("", isoCode).getDisplayCountry(Locale.ENGLISH);
            if (displayName.equalsIgnoreCase(value)) {
                return isoCode;
            }
        }

        throw new IllegalArgumentException("Country must be a valid 2-letter ISO code or recognized country name");
    }
}
