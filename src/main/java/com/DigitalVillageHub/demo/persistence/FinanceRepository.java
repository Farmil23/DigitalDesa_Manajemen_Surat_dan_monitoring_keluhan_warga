package com.DigitalVillageHub.demo.persistence;

import com.DigitalVillageHub.demo.model.entity.Finance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Mengaktifkan scanning komponen persistence JPA Spring Boot
public interface FinanceRepository extends JpaRepository<Finance, Long> {
    
    // 1. Mengambil seluruh riwayat keuangan diurutkan dari transaksi paling baru (ID Terbesar)
    List<Finance> findAllByOrderByIdDesc();
    
    // 2. Mencari data berdasarkan tipe (PEMASUKAN / PENGELUARAN)
    List<Finance> findByType(String type);
    
    // 3. Mencari data berdasarkan kategori belanja/dana
    List<Finance> findByCategory(String category);
}