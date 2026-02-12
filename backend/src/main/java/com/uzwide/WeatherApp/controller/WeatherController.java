package com.uzwide.WeatherApp.controller;

import com.uzwide.WeatherApp.dto.request.LocationDTO;
import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.dto.response.WeatherResponseDTO;
import com.uzwide.WeatherApp.model.Location;
import com.uzwide.WeatherApp.service.WeatherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class WeatherController {
    private final WeatherService weatherService;

    @GetMapping("/locations")
    public ResponseEntity<List<WeatherResponseDTO>> getAllLocations(
            @RequestParam(defaultValue = "METRIC") Units units) {
        return ResponseEntity.ok(weatherService.getAllLocationsWithWeather(units));
    }

    @GetMapping("/locations/{id}")
    public ResponseEntity<WeatherResponseDTO> getLocationWeather(
            @PathVariable Long id,
            @RequestParam(defaultValue = "METRIC") Units units) {
        return ResponseEntity.ok(weatherService.getCurrentWeather(id, units));
    }

    @PostMapping("/locations")
    public ResponseEntity<Location> addLocation(@Valid @RequestBody LocationDTO locationDTO) {
        Location location = weatherService.addLocation(locationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(location);
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<Location> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationDTO locationDTO) {
        Location location = weatherService.updateLocation(id, locationDTO);
        return ResponseEntity.ok(location);
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        weatherService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/locations/{id}/refresh")
    public ResponseEntity<WeatherResponseDTO> refreshWeather(
            @PathVariable Long id,
            @RequestParam(defaultValue = "METRIC") Units units) {
        WeatherResponseDTO weather = weatherService.refreshWeather(id, units);
        return ResponseEntity.ok(weather);
    }
}