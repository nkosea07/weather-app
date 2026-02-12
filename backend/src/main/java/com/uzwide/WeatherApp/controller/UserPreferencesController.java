package com.uzwide.WeatherApp.controller;

import com.uzwide.WeatherApp.dto.response.UserPreferencesDTO;
import com.uzwide.WeatherApp.service.UserPreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UserPreferencesController {
    private final UserPreferencesService userPreferencesService;

    @GetMapping
    public ResponseEntity<UserPreferencesDTO> getUserPreferences() {
        return ResponseEntity.ok(userPreferencesService.getUserPreferences());
    }

    @PutMapping
    public ResponseEntity<UserPreferencesDTO> updateUserPreferences(@Valid @RequestBody UserPreferencesDTO preferencesDTO) {
        UserPreferencesDTO updated = userPreferencesService.updateUserPreferences(preferencesDTO);
        return ResponseEntity.ok(updated);
    }
}
