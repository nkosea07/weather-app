package com.uzwide.WeatherApp.dto.request;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Units {
    METRIC,
    STANDARD,
    IMPERIAL;

    @JsonCreator
    public static Units fromString(String value) {
        return Units.valueOf(value.toUpperCase());
    }
}
