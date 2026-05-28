package com.DigitalVillageHub.demo.persistence;

import com.DigitalVillageHub.demo.model.entity.PengaduanPetugasId;
import com.DigitalVillageHub.demo.model.entity.PengaduanPetugas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PengaduanPetugasRepository extends JpaRepository<PengaduanPetugas, PengaduanPetugasId> {

    List<PengaduanPetugas> findByPengaduan_IdOrderByAssignedAtDesc(Long pengaduanId);
}