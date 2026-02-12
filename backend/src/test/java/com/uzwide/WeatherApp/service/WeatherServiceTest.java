package com.uzwide.WeatherApp.service;

import com.uzwide.WeatherApp.dto.request.LocationDTO;
import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.dto.response.WeatherResponseDTO;
import com.uzwide.WeatherApp.exception.DuplicateLocationException;
import com.uzwide.WeatherApp.exception.LocationNotFoundException;
import com.uzwide.WeatherApp.model.Location;
import com.uzwide.WeatherApp.model.WeatherSnapshot;
import com.uzwide.WeatherApp.repositories.LocationRepository;
import com.uzwide.WeatherApp.repositories.WeatherSnapshotRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private WeatherSnapshotRepository weatherSnapshotRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private WeatherService weatherService;

    @Test
    void addLocationThrowsWhenDuplicateExists() {
        LocationDTO dto = new LocationDTO();
        dto.setName("Cape Town");
        dto.setCountry("ZA");

        when(locationRepository.findByNameAndCountry("Cape Town", "ZA"))
                .thenReturn(Optional.of(new Location()));

        assertThrows(DuplicateLocationException.class, () -> weatherService.addLocation(dto));
        verify(locationRepository, never()).save(any(Location.class));
    }

    @Test
    void addLocationDefaultsFavoriteToFalseWhenNotProvided() {
        LocationDTO dto = new LocationDTO();
        dto.setName("Johannesburg");
        dto.setCountry("ZA");
        dto.setLatitude(-26.2041);
        dto.setLongitude(28.0473);
        dto.setDisplayName("Johannesburg, ZA");
        dto.setIsFavorite(null);

        when(locationRepository.findByNameAndCountry("Johannesburg", "ZA"))
                .thenReturn(Optional.empty());
        when(locationRepository.save(any(Location.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Location saved = weatherService.addLocation(dto);

        assertEquals("Johannesburg", saved.getName());
        assertEquals("ZA", saved.getCountry());
        assertFalse(saved.getIsFavorite());
        verify(locationRepository).save(any(Location.class));
    }

    @Test
    void addLocationAcceptsCountryDisplayNameAndNormalizesToIsoCode() {
        LocationDTO dto = new LocationDTO();
        dto.setName("Cape Town");
        dto.setCountry("South Africa");
        dto.setLatitude(-33.9249);
        dto.setLongitude(18.4241);

        when(locationRepository.findByNameAndCountry("Cape Town", "ZA"))
                .thenReturn(Optional.empty());
        when(locationRepository.save(any(Location.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Location saved = weatherService.addLocation(dto);

        assertEquals("ZA", saved.getCountry());
        verify(locationRepository).save(any(Location.class));
    }

    @Test
    void addLocationThrowsWhenCountryCannotBeNormalized() {
        LocationDTO dto = new LocationDTO();
        dto.setName("Cape Town");
        dto.setCountry("NotACountry");
        dto.setLatitude(-33.9249);
        dto.setLongitude(18.4241);

        assertThrows(IllegalArgumentException.class, () -> weatherService.addLocation(dto));
        verify(locationRepository, never()).save(any(Location.class));
    }

    @Test
    void updateLocationUpdatesDisplayNameAndFavorite() {
        Location existing = new Location();
        existing.setId(5L);
        existing.setDisplayName("Old Name");
        existing.setIsFavorite(false);

        LocationDTO update = new LocationDTO();
        update.setDisplayName("New Name");
        update.setIsFavorite(true);

        when(locationRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(locationRepository.save(any(Location.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Location result = weatherService.updateLocation(5L, update);

        assertEquals("New Name", result.getDisplayName());
        assertTrue(result.getIsFavorite());
    }

    @Test
    void deleteLocationThrowsWhenLocationMissing() {
        when(locationRepository.existsById(99L)).thenReturn(false);

        assertThrows(LocationNotFoundException.class, () -> weatherService.deleteLocation(99L));
        verify(locationRepository, never()).deleteById(any(Long.class));
    }

    @Test
    void getCurrentWeatherUsesExistingSnapshot() {
        Location location = new Location();
        location.setId(1L);
        location.setName("Durban");
        location.setDisplayName("Durban, ZA");
        location.setCountry("ZA");
        location.setIsFavorite(true);

        WeatherSnapshot snapshot = new WeatherSnapshot();
        snapshot.setTemperature(24.5);
        snapshot.setFeelsLike(25.0);
        snapshot.setHumidity(72);
        snapshot.setPressure(1012);
        snapshot.setWindSpeed(4.2);
        snapshot.setWeatherCondition("Clouds");
        snapshot.setWeatherDescription("few clouds");
        snapshot.setWeatherIcon("02d");
        snapshot.setFetchedAt(LocalDateTime.now());

        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(weatherSnapshotRepository.findFirstByLocationOrderByFetchedAtDesc(location))
                .thenReturn(Optional.of(snapshot));

        WeatherResponseDTO response = weatherService.getCurrentWeather(1L, Units.METRIC);

        assertEquals(1L, response.getLocationId());
        assertEquals("Durban", response.getLocationName());
        assertEquals("Durban, ZA", response.getDisplayName());
        assertEquals(24.5, response.getTemperature());
        assertEquals("Clouds", response.getWeatherCondition());
        assertTrue(response.getIsFavorite());
    }
}
