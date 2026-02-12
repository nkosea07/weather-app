package com.uzwide.WeatherApp.dto.response;

import com.uzwide.WeatherApp.dto.request.Units;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDTO {
    private Long id;
    private Units defaultUnits;
    private Integer refreshIntervalMinutes;
    private Boolean autoRefreshEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
