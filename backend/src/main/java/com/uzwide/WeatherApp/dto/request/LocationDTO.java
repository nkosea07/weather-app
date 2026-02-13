package com.uzwide.WeatherApp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LocationDTO {

    private String name;

    private String country;

    private Double latitude;

    private Double longitude;

    private String displayName;
    private Boolean isFavorite;
}
