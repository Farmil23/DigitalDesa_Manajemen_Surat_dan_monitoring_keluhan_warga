package com.DigitalVillageHub.demo.persistence;

import com.DigitalVillageHub.demo.model.entity.Keluarga;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KeluargaRepository extends JpaRepository<Keluarga, String> {
}