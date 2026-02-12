package com.uzwide.WeatherApp.service;

import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.dto.response.UserPreferencesDTO;
import com.uzwide.WeatherApp.model.UserPreferences;
import com.uzwide.WeatherApp.repositories.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserPreferencesService {
    private final UserPreferencesRepository userPreferencesRepository;

    @Cacheable(value = "userPreferences")
    @Transactional(readOnly = true)
    public UserPreferencesDTO getUserPreferences() {
        UserPreferences preferences = userPreferencesRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultPreferences);
        return mapToDTO(preferences);
    }

    @Transactional
    @CacheEvict(value = "userPreferences")
    public UserPreferencesDTO updateUserPreferences(UserPreferencesDTO dto) {
        UserPreferences preferences = userPreferencesRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultPreferences);

        if (dto.getDefaultUnits() != null) {
            preferences.setDefaultUnits(dto.getDefaultUnits());
        }
        if (dto.getRefreshIntervalMinutes() != null) {
            preferences.setRefreshIntervalMinutes(dto.getRefreshIntervalMinutes());
        }
        if (dto.getAutoRefreshEnabled() != null) {
            preferences.setAutoRefreshEnabled(dto.getAutoRefreshEnabled());
        }

        UserPreferences saved = userPreferencesRepository.save(preferences);
        return mapToDTO(saved);
    }

    private UserPreferences createDefaultPreferences() {
        UserPreferences preferences = new UserPreferences();
        preferences.setDefaultUnits(Units.METRIC);
        preferences.setRefreshIntervalMinutes(30);
        preferences.setAutoRefreshEnabled(false);
        return userPreferencesRepository.save(preferences);
    }

    private UserPreferencesDTO mapToDTO(UserPreferences preferences) {
        return UserPreferencesDTO.builder()
                .id(preferences.getId())
                .defaultUnits(preferences.getDefaultUnits())
                .refreshIntervalMinutes(preferences.getRefreshIntervalMinutes())
                .autoRefreshEnabled(preferences.getAutoRefreshEnabled())
                .createdAt(preferences.getCreatedAt())
                .updatedAt(preferences.getUpdatedAt())
                .build();
    }
}
