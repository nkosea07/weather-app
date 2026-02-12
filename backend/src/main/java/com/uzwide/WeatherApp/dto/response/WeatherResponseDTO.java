package com.uzwide.WeatherApp.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class WeatherResponseDTO {
    private Long locationId;
    private String locationName;
    private String displayName;
    private String country;
    private Double temperature;
    private Double feelsLike;
    private Integer humidity;
    private Integer pressure;
    private Double windSpeed;
    private String weatherCondition;
    private String weatherDescription;
    private String weatherIcon;
    private LocalDateTime lastUpdated;
    private Boolean isFavorite;
}