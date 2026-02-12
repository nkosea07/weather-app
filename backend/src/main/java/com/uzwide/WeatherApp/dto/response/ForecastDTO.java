package com.uzwide.WeatherApp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastDTO {
    private LocalDateTime forecastTime;
    private Double temperature;
    private Double feelsLike;
    private Integer humidity;
    private Integer pressure;
    private Double windSpeed;
    private Integer windDirection;
    private String weatherCondition;
    private String weatherDescription;
    private String weatherIcon;
    private Integer cloudiness;
    private Double precipitationProbability;
    private Double rainVolume;
}


