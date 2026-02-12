package com.uzwide.WeatherApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "weather_snapshots")
@Data
@NoArgsConstructor
public class WeatherSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(nullable = false)
    private Double temperature;

    @Column(name = "feels_like", nullable = false)
    private Double feelsLike;

    @Column(nullable = false)
    private Integer humidity;

    @Column(nullable = false)
    private Integer pressure;

    @Column(name = "wind_speed", nullable = false)
    private Double windSpeed;

    @Column(name = "wind_direction", nullable = false)
    private Integer windDirection;

    @Column(name = "weather_condition", nullable = false, length = 50)
    private String weatherCondition;

    @Column(name = "weather_description", nullable = false, length = 200)
    private String weatherDescription;

    @Column(name = "weather_icon", nullable = false, length = 10)
    private String weatherIcon;

    @Column(nullable = false)
    private Integer cloudiness;

    @Column(nullable = false)
    private Integer visibility;

    @Column(name = "fetched_at", nullable = false)
    private LocalDateTime fetchedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
