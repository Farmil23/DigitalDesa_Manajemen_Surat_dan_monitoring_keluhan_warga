package com.DigitalVillageHub.demo.persistence;

import com.DigitalVillageHub.demo.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByNik(String nik);

    Optional<User> findFirstByNikOrUsername(String nik, String username);

    boolean existsByNik(String nik);

    boolean existsByUsername(String username);

    List<User> findByRole(User.Role role);

    List<User> findByStatusAkun(String statusAkun);
}