package com.uzwide.WeatherApp.controller;

import com.uzwide.WeatherApp.dto.response.ForecastDTO;
import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.service.ForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ForecastController {
    private final ForecastService forecastService;

    @GetMapping("/{locationId}")
    public ResponseEntity<List<ForecastDTO>> getForecast(
            @PathVariable Long locationId,
            @RequestParam(defaultValue = "METRIC") Units units) {
        List<ForecastDTO> forecast = forecastService.getForecast(locationId, units);
        return ResponseEntity.ok(forecast);
    }
}