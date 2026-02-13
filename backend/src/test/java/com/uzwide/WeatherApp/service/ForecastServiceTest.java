package com.uzwide.WeatherApp.service;

import com.uzwide.WeatherApp.dto.response.ForecastDTO;
import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.exception.LocationNotFoundException;
import com.uzwide.WeatherApp.exception.WeatherApiException;
import com.uzwide.WeatherApp.model.Location;
import com.uzwide.WeatherApp.repositories.LocationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ForecastServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ForecastService forecastService;

    private Location createTestLocation() {
        Location location = new Location();
        location.setId(1L);
        location.setName("Cape Town");
        location.setCountry("ZA");
        location.setLatitude(-33.9249);
        location.setLongitude(18.4241);
        return location;
    }

    private Map<String, Object> createApiForecastResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("cod", "200");
        response.put("message", 0);
        response.put("cnt", 1);

        Map<String, Object> city = new HashMap<>();
        city.put("id", 3369157);
        city.put("name", "Cape Town");
        city.put("country", "ZA");
        city.put("population", 3433441);
        city.put("timezone", 7200);
        city.put("sunrise", 1700000000);
        city.put("sunset", 1700040000);
        response.put("city", city);

        Map<String, Object> main = new HashMap<>();
        main.put("temp", 22.5);
        main.put("feels_like", 21.0);
        main.put("temp_min", 20.0);
        main.put("temp_max", 25.0);
        main.put("pressure", 1013);
        main.put("humidity", 65);
        main.put("temp_kf", 0.0);

        Map<String, Object> weather = new HashMap<>();
        weather.put("id", 800);
        weather.put("main", "Clear");
        weather.put("description", "clear sky");
        weather.put("icon", "01d");

        Map<String, Object> wind = new HashMap<>();
        wind.put("speed", 5.2);
        wind.put("deg", 180);

        Map<String, Object> clouds = new HashMap<>();
        clouds.put("all", 10);

        Map<String, Object> sys = new HashMap<>();
        sys.put("pod", "d");

        Map<String, Object> item = new HashMap<>();
        item.put("dt", 1700000000);
        item.put("dt_txt", "2023-11-14 18:00:00");
        item.put("main", main);
        item.put("weather", List.of(weather));
        item.put("wind", wind);
        item.put("clouds", clouds);
        item.put("sys", sys);
        item.put("visibility", 10000);
        item.put("pop", 0.1);

        response.put("list", List.of(item));
        return response;
    }

    @Test
    void getForecastThrowsWhenLocationNotFound() {
        when(locationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(LocationNotFoundException.class,
                () -> forecastService.getForecast(99L, Units.METRIC));
    }

    @Test
    void getForecastReturnsForecastDTOs() {
        Location location = createTestLocation();
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(createApiForecastResponse());

        List<ForecastDTO> result = forecastService.getForecast(1L, Units.METRIC);

        assertNotNull(result);
        assertEquals(1, result.size());

        ForecastDTO dto = result.get(0);
        assertEquals(22.5, dto.getTemperature());
        assertEquals(21.0, dto.getFeelsLike());
        assertEquals(65, dto.getHumidity());
        assertEquals(1013, dto.getPressure());
        assertEquals(5.2, dto.getWindSpeed());
        assertEquals("Clear", dto.getWeatherCondition());
        assertEquals("clear sky", dto.getWeatherDescription());
        assertEquals("01d", dto.getWeatherIcon());
        assertEquals(10, dto.getCloudiness());
        assertNotNull(dto.getForecastTime());
    }

    @Test
    void getForecastThrowsWeatherApiExceptionOnFailure() {
        Location location = createTestLocation();
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("API down"));

        assertThrows(WeatherApiException.class,
                () -> forecastService.getForecast(1L, Units.METRIC));
    }
}
