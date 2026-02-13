package com.uzwide.WeatherApp.repositories;

import com.uzwide.WeatherApp.model.Location;
import com.uzwide.WeatherApp.model.WeatherSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeatherSnapshotRepository extends JpaRepository<WeatherSnapshot, Long> {
    Optional<WeatherSnapshot> findFirstByLocationOrderByFetchedAtDesc(Location location);

    @Query("SELECT w FROM WeatherSnapshot w WHERE w.location = :location AND w.fetchedAt > :since ORDER BY w.fetchedAt DESC")
    List<WeatherSnapshot> findRecentSnapshots(Location location, LocalDateTime since);

    void deleteByFetchedAtBefore(LocalDateTime cutoff);

    void deleteByLocation(Location location);
}
