package com.DigitalVillageHub.demo.persistence;

import com.DigitalVillageHub.demo.model.entity.Wilayah;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WilayahRepository extends JpaRepository<Wilayah, Long> {
}