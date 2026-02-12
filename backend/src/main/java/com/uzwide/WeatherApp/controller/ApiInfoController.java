package com.uzwide.WeatherApp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class ApiInfoController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "WeatherApp API",
                "status", "UP",
                "timestamp", LocalDateTime.now(),
                "basePath", "/api",
                "endpoints", Map.of(
                        "weather", "/api/weather/locations",
                        "forecast", "/api/forecast/{locationId}",
                        "preferences", "/api/preferences"
                )
        ));
    }
}
