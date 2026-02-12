package com.uzwide.WeatherApp.model;

import com.uzwide.WeatherApp.dto.request.Units;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
public class UserPreferences {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_units", nullable = false, length = 20)
    private Units defaultUnits = Units.METRIC;

    @Column(name = "refresh_interval_minutes", nullable = false)
    private Integer refreshIntervalMinutes = 30;

    @Column(name = "auto_refresh_enabled", nullable = false)
    private Boolean autoRefreshEnabled = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
