package com.DigitalVillageHub.demo.persistence;

import com.DigitalVillageHub.demo.model.entity.Surat;
import com.DigitalVillageHub.demo.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SuratRepository extends JpaRepository<Surat, Long> {

    List<Surat> findByUserId(Long userId);

    List<Surat> findByUserOrderByTglDiajukanDesc(User user);

    List<Surat> findByStatus(Surat.StatusSurat status);
}