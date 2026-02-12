package com.uzwide.WeatherApp.repositories;

import com.uzwide.WeatherApp.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByNameAndCountry(String name, String country);

    @Query("SELECT l FROM Location l ORDER BY l.isFavorite DESC, l.displayName ASC, l.name ASC")
    List<Location> findAllOrdered();

    List<Location> findByIsFavoriteTrue();
}
