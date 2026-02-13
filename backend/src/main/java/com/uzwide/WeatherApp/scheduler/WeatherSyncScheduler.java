package com.uzwide.WeatherApp.scheduler;

import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.dto.response.UserPreferencesDTO;
import com.uzwide.WeatherApp.model.Location;
import com.uzwide.WeatherApp.repositories.LocationRepository;
import com.uzwide.WeatherApp.service.UserPreferencesService;
import com.uzwide.WeatherApp.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeatherSyncScheduler {
    private final LocationRepository locationRepository;
    private final WeatherService weatherService;
    private final UserPreferencesService userPreferencesService;

    @Scheduled(fixedDelayString = "${weather.sync.interval:1800000}")
    public void syncAllLocations() {
        UserPreferencesDTO preferences = userPreferencesService.getUserPreferences();
        if (!Boolean.TRUE.equals(preferences.getAutoRefreshEnabled())) {
            log.debug("Auto-refresh is disabled, skipping scheduled sync");
            return;
        }

        Units units = preferences.getDefaultUnits() != null ? preferences.getDefaultUnits() : Units.METRIC;
        List<Location> locations = locationRepository.findAllOrdered();
        log.info("Scheduled sync started for {} locations", locations.size());

        int success = 0;
        for (Location location : locations) {
            try {
                weatherService.refreshWeather(location.getId(), units);
                success++;
            } catch (Exception e) {
                log.warn("Scheduled sync failed for {}: {}", location.getName(), e.getMessage());
            }
        }

        log.info("Scheduled sync completed: {}/{} locations refreshed", success, locations.size());
    }
}
