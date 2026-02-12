package com.uzwide.WeatherApp.service;

import com.uzwide.WeatherApp.dto.request.Units;
import com.uzwide.WeatherApp.dto.response.UserPreferencesDTO;
import com.uzwide.WeatherApp.model.UserPreferences;
import com.uzwide.WeatherApp.repositories.UserPreferencesRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserPreferencesServiceTest {

    @Mock
    private UserPreferencesRepository userPreferencesRepository;

    @InjectMocks
    private UserPreferencesService userPreferencesService;

    @Test
    void getUserPreferencesReturnsExistingPreferences() {
        UserPreferences existing = new UserPreferences();
        existing.setId(10L);
        existing.setDefaultUnits(Units.IMPERIAL);
        existing.setRefreshIntervalMinutes(15);
        existing.setAutoRefreshEnabled(true);

        when(userPreferencesRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(existing));

        UserPreferencesDTO result = userPreferencesService.getUserPreferences();

        assertEquals(10L, result.getId());
        assertEquals(Units.IMPERIAL, result.getDefaultUnits());
        assertEquals(15, result.getRefreshIntervalMinutes());
        assertTrue(result.getAutoRefreshEnabled());
    }

    @Test
    void getUserPreferencesReturnsDefaultValuesWhenMissing() {
        when(userPreferencesRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.empty());

        UserPreferencesDTO result = userPreferencesService.getUserPreferences();

        assertNull(result.getId());
        assertEquals(Units.METRIC, result.getDefaultUnits());
        assertEquals(30, result.getRefreshIntervalMinutes());
        assertFalse(result.getAutoRefreshEnabled());
        verify(userPreferencesRepository, never()).save(any(UserPreferences.class));
    }

    @Test
    void updateUserPreferencesUpdatesOnlyProvidedFields() {
        UserPreferences existing = new UserPreferences();
        existing.setId(2L);
        existing.setDefaultUnits(Units.METRIC);
        existing.setRefreshIntervalMinutes(30);
        existing.setAutoRefreshEnabled(false);

        UserPreferencesDTO update = UserPreferencesDTO.builder()
                .defaultUnits(Units.STANDARD)
                .autoRefreshEnabled(true)
                .build();

        when(userPreferencesRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(existing));
        when(userPreferencesRepository.save(any(UserPreferences.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserPreferencesDTO result = userPreferencesService.updateUserPreferences(update);

        assertEquals(Units.STANDARD, result.getDefaultUnits());
        assertEquals(30, result.getRefreshIntervalMinutes());
        assertTrue(result.getAutoRefreshEnabled());
    }
}
