package com.uzwide.WeatherApp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LocationDTO {

    @NotBlank(message = "City name is required")
    private String name;

    @NotBlank(message = "Country code is required")
    private String country;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String displayName;
    private Boolean isFavorite;
}
