package com.uzwide.WeatherApp.repositories;

import com.uzwide.WeatherApp.model.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
    Optional<UserPreferences> findFirstByOrderByIdAsc();
}
