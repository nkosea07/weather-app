package com.uzwide.WeatherApp.service;

import com.uzwide.WeatherApp.dto.response.ForecastApiResponseDTO;
import com.uzwide.WeatherApp.dto.response.ForecastDTO;
import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.exception.LocationNotFoundException;
import com.uzwide.WeatherApp.exception.WeatherApiException;
import com.uzwide.WeatherApp.model.Location;
import com.uzwide.WeatherApp.repositories.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastService {
    private final LocationRepository locationRepository;
    private final RestTemplate restTemplate;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base-url}")
    private String apiBaseUrl;

    @Cacheable(value = "forecast", key = "#locationId + '_' + #units")
    @Transactional(readOnly = true)
    public List<ForecastDTO> getForecast(Long locationId, Units units) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException("Location not found"));

        return fetchAndSaveForecast(location, units);
    }

    @Transactional
    public List<ForecastDTO> fetchAndSaveForecast(Location location, Units units) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString(apiBaseUrl + "/forecast")
                    .queryParam("lat", location.getLatitude())
                    .queryParam("lon", location.getLongitude())
                    .queryParam("appid", apiKey)
                    .queryParam("units", units.name().toLowerCase())
                    .build()
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            ForecastApiResponseDTO forecastApiResponse = mapToForecastApiResponseDTO(response);
            return mapToForecastDTOList(forecastApiResponse);

        } catch (HttpClientErrorException e) {
            log.error("API error for location {}: {}", location.getName(), e.getStatusCode());
            throw new WeatherApiException("Failed to fetch forecast data: " + e.getStatusText());
        } catch (Exception e) {
            log.error("Failed to fetch forecast for {}: {}", location.getName(), e.getMessage());
            throw new WeatherApiException("Failed to fetch forecast data");
        }
    }

    @SuppressWarnings("unchecked")
    private ForecastApiResponseDTO mapToForecastApiResponseDTO(Map<String, Object> response) {
        ForecastApiResponseDTO.ForecastApiResponseDTOBuilder builder = ForecastApiResponseDTO.builder();
        
        // Map simple fields
        builder.cod((String) response.get("cod"))
                .message(response.containsKey("message") ? ((Number) response.get("message")).intValue() : 0)
                .cnt(((Number) response.get("cnt")).intValue());
        
        // Map city
        if (response.containsKey("city")) {
            Map<String, Object> city = (Map<String, Object>) response.get("city");
            builder.city(ForecastApiResponseDTO.City.builder()
                    .id(((Number) city.get("id")).intValue())
                    .name((String) city.get("name"))
                    .country((String) city.get("country"))
                    .population(city.containsKey("population") ? ((Number) city.get("population")).intValue() : 0)
                    .timezone(city.containsKey("timezone") ? ((Number) city.get("timezone")).intValue() : 0)
                    .sunrise(city.containsKey("sunrise") ? ((Number) city.get("sunrise")).intValue() : 0)
                    .sunset(city.containsKey("sunset") ? ((Number) city.get("sunset")).intValue() : 0)
                    .build());
        }
        
        // Map list
        if (response.containsKey("list")) {
            List<Map<String, Object>> list = (List<Map<String, Object>>) response.get("list");
            List<ForecastApiResponseDTO.ForecastItem> forecastItems = list.stream()
                    .map(this::mapToForecastItem)
                    .collect(Collectors.toList());
            builder.list(forecastItems);
        }
        
        return builder.build();
    }
    
    @SuppressWarnings("unchecked")
    private ForecastApiResponseDTO.ForecastItem mapToForecastItem(Map<String, Object> item) {
        ForecastApiResponseDTO.ForecastItem.ForecastItemBuilder builder = ForecastApiResponseDTO.ForecastItem.builder();
        
        builder.dt(((Number) item.get("dt")).intValue())
                .dt_txt((String) item.get("dt_txt"))
                .visibility(item.containsKey("visibility") ? ((Number) item.get("visibility")).intValue() : 0)
                .pop(item.containsKey("pop") ? ((Number) item.get("pop")).doubleValue() : 0.0);
        
        // Map main
        if (item.containsKey("main")) {
            Map<String, Object> main = (Map<String, Object>) item.get("main");
            builder.main(ForecastApiResponseDTO.Main.builder()
                    .temp(((Number) main.get("temp")).doubleValue())
                    .feels_like(((Number) main.get("feels_like")).doubleValue())
                    .temp_min(((Number) main.get("temp_min")).doubleValue())
                    .temp_max(((Number) main.get("temp_max")).doubleValue())
                    .pressure(((Number) main.get("pressure")).intValue())
                    .sea_level(main.containsKey("sea_level") ? ((Number) main.get("sea_level")).intValue() : 0)
                    .grnd_level(main.containsKey("grnd_level") ? ((Number) main.get("grnd_level")).intValue() : 0)
                    .humidity(((Number) main.get("humidity")).intValue())
                    .temp_kf(main.containsKey("temp_kf") ? ((Number) main.get("temp_kf")).doubleValue() : 0.0)
                    .build());
        }
        
        // Map weather
        if (item.containsKey("weather")) {
            List<Map<String, Object>> weather = (List<Map<String, Object>>) item.get("weather");
            List<ForecastApiResponseDTO.Weather> weatherList = weather.stream()
                    .map(w -> ForecastApiResponseDTO.Weather.builder()
                            .id(((Number) w.get("id")).intValue())
                            .main((String) w.get("main"))
                            .description((String) w.get("description"))
                            .icon((String) w.get("icon"))
                            .build())
                    .collect(Collectors.toList());
            builder.weather(weatherList);
        }
        
        // Map wind
        if (item.containsKey("wind")) {
            Map<String, Object> wind = (Map<String, Object>) item.get("wind");
            ForecastApiResponseDTO.Wind.WindBuilder windBuilder = ForecastApiResponseDTO.Wind.builder()
                    .speed(((Number) wind.get("speed")).doubleValue())
                    .deg(wind.containsKey("deg") ? ((Number) wind.get("deg")).intValue() : 0);
            if (wind.containsKey("gust")) {
                windBuilder.gust(((Number) wind.get("gust")).doubleValue());
            }
            builder.wind(windBuilder.build());
        }
        
        // Map clouds
        if (item.containsKey("clouds")) {
            Map<String, Object> clouds = (Map<String, Object>) item.get("clouds");
            builder.clouds(ForecastApiResponseDTO.Clouds.builder()
                    .all(((Number) clouds.get("all")).intValue())
                    .build());
        }
        
        // Map sys
        if (item.containsKey("sys")) {
            Map<String, Object> sys = (Map<String, Object>) item.get("sys");
            builder.sys(ForecastApiResponseDTO.Sys.builder()
                    .pod((String) sys.get("pod"))
                    .build());
        }
        
        // Map rain
        if (item.containsKey("rain")) {
            Map<String, Object> rain = (Map<String, Object>) item.get("rain");
            builder.rain(ForecastApiResponseDTO.Rain.builder()
                    ._3h(rain.containsKey("3h") ? ((Number) rain.get("3h")).doubleValue() : 0.0)
                    .build());
        }
        
        return builder.build();
    }
    
    private List<ForecastDTO> mapToForecastDTOList(ForecastApiResponseDTO forecastApiResponse) {
        return forecastApiResponse.getList().stream()
                .map(this::mapToForecastDTO)
                .collect(Collectors.toList());
    }
    
    private ForecastDTO mapToForecastDTO(ForecastApiResponseDTO.ForecastItem item) {
        long timestamp = ((Number) item.getDt()).longValue() * 1000;
        LocalDateTime forecastTime = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
        
        return ForecastDTO.builder()
                .forecastTime(forecastTime)
                .temperature(item.getMain() != null ? item.getMain().getTemp() : null)
                .feelsLike(item.getMain() != null ? item.getMain().getFeels_like() : null)
                .humidity(item.getMain() != null ? item.getMain().getHumidity() : null)
                .pressure(item.getMain() != null ? item.getMain().getPressure() : null)
                .windSpeed(item.getWind() != null ? item.getWind().getSpeed() : null)
                .windDirection(item.getWind() != null ? item.getWind().getDeg() : null)
                .weatherCondition(item.getWeather() != null && !item.getWeather().isEmpty() 
                        ? item.getWeather().get(0).getMain() : null)
                .weatherDescription(item.getWeather() != null && !item.getWeather().isEmpty() 
                        ? item.getWeather().get(0).getDescription() : null)
                .weatherIcon(item.getWeather() != null && !item.getWeather().isEmpty() 
                        ? item.getWeather().get(0).getIcon() : null)
                .cloudiness(item.getClouds() != null ? item.getClouds().getAll() : null)
                .precipitationProbability(item.getPop())
                .rainVolume(item.getRain() != null ? item.getRain().get_3h() : null)
                .build();
    }
}