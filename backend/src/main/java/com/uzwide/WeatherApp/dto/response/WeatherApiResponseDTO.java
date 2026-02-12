package com.uzwide.WeatherApp.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class WeatherApiResponseDTO {
    private Coord coord;
    private List<Weather> weather;
    private String base;
    private Main main;
    private int visibility;
    private Wind wind;
    private Clouds clouds;
    private int dt;
    private Sys sys;
    private int timezone;
    private int id;
    private String name;
    private int cod;
    private LocalDateTime fetchedAt;

    @Data
    @Builder
    public static class Coord {
        private double lon;
        private double lat;
    }

    @Data
    @Builder
    public static class Main {
        private double temp;
        private double feels_like;
        private double temp_min;
        private double temp_max;
        private int pressure;
        private int humidity;
        private int sea_level;
        private int grnd_level;
    }

    @Data
    @Builder
    public static class Weather {
        private int id;
        private String main;
        private String description;
        private String icon;
    }

    @Data
    @Builder
    public static class Wind {
        private double speed;
        private int deg;
        private double gust;
    }

    @Data
    @Builder
    public static class Clouds {
        private int all;
    }

    @Data
    @Builder
    public static class Sys {
        private String country;
        private int sunrise;
        private int sunset;
    }
}

