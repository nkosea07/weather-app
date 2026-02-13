package com.uzwide.WeatherApp.scheduler;

import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.dto.response.UserPreferencesDTO;
import com.uzwide.WeatherApp.model.Location;
import com.uzwide.WeatherApp.repositories.LocationRepository;
import com.uzwide.WeatherApp.service.UserPreferencesService;
import com.uzwide.WeatherApp.service.WeatherService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeatherSyncSchedulerTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private WeatherService weatherService;

    @Mock
    private UserPreferencesService userPreferencesService;

    @InjectMocks
    private WeatherSyncScheduler weatherSyncScheduler;

    private Location createLocation(Long id, String name) {
        Location location = new Location();
        location.setId(id);
        location.setName(name);
        location.setCountry("ZA");
        location.setLatitude(-33.9);
        location.setLongitude(18.4);
        return location;
    }

    @Test
    void syncSkipsWhenAutoRefreshDisabled() {
        UserPreferencesDTO prefs = UserPreferencesDTO.builder()
                .autoRefreshEnabled(false)
                .build();
        when(userPreferencesService.getUserPreferences()).thenReturn(prefs);

        weatherSyncScheduler.syncAllLocations();

        verify(locationRepository, never()).findAllOrdered();
        verify(weatherService, never()).refreshWeather(any(), any());
    }

    @Test
    void syncSkipsWhenAutoRefreshNull() {
        UserPreferencesDTO prefs = UserPreferencesDTO.builder()
                .autoRefreshEnabled(null)
                .build();
        when(userPreferencesService.getUserPreferences()).thenReturn(prefs);

        weatherSyncScheduler.syncAllLocations();

        verify(locationRepository, never()).findAllOrdered();
        verify(weatherService, never()).refreshWeather(any(), any());
    }

    @Test
    void syncRefreshesAllLocationsWhenEnabled() {
        UserPreferencesDTO prefs = UserPreferencesDTO.builder()
                .autoRefreshEnabled(true)
                .defaultUnits(Units.IMPERIAL)
                .build();
        Location loc1 = createLocation(1L, "Cape Town");
        Location loc2 = createLocation(2L, "Johannesburg");

        when(userPreferencesService.getUserPreferences()).thenReturn(prefs);
        when(locationRepository.findAllOrdered()).thenReturn(List.of(loc1, loc2));

        weatherSyncScheduler.syncAllLocations();

        verify(weatherService).refreshWeather(1L, Units.IMPERIAL);
        verify(weatherService).refreshWeather(2L, Units.IMPERIAL);
    }

    @Test
    void syncUsesMetricWhenDefaultUnitsNull() {
        UserPreferencesDTO prefs = UserPreferencesDTO.builder()
                .autoRefreshEnabled(true)
                .defaultUnits(null)
                .build();
        Location loc = createLocation(1L, "Durban");

        when(userPreferencesService.getUserPreferences()).thenReturn(prefs);
        when(locationRepository.findAllOrdered()).thenReturn(List.of(loc));

        weatherSyncScheduler.syncAllLocations();

        verify(weatherService).refreshWeather(1L, Units.METRIC);
    }

    @Test
    void syncContinuesWhenOneLocationFails() {
        UserPreferencesDTO prefs = UserPreferencesDTO.builder()
                .autoRefreshEnabled(true)
                .defaultUnits(Units.METRIC)
                .build();
        Location loc1 = createLocation(1L, "Cape Town");
        Location loc2 = createLocation(2L, "Johannesburg");

        when(userPreferencesService.getUserPreferences()).thenReturn(prefs);
        when(locationRepository.findAllOrdered()).thenReturn(List.of(loc1, loc2));
        doThrow(new RuntimeException("API error")).when(weatherService).refreshWeather(eq(1L), any());

        weatherSyncScheduler.syncAllLocations();

        verify(weatherService).refreshWeather(1L, Units.METRIC);
        verify(weatherService).refreshWeather(2L, Units.METRIC);
    }
}
