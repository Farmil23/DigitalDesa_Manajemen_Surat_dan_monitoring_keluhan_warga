package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.model.dto.AjukanSuratRequestDTO;
import com.DigitalVillageHub.demo.model.entity.Surat;
import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.persistence.SuratRepository;
import com.DigitalVillageHub.demo.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SuratService {

    private static final String USER_TIDAK_DITEMUKAN = "User tidak ditemukan";
    private static final String NIK_WAJIB_DIISI = "NIK wajib diisi";
    private static final String JENIS_SURAT_WAJIB_DIISI = "Jenis surat wajib diisi";

    private final SuratRepository suratRepository;
    private final UserRepository userRepository;

    public List<Surat> getAllSurat() {
        return suratRepository.findAll();
    }

    public Surat getSuratById(Long id) {
        return suratRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surat tidak ditemukan"));
    }

    public List<Surat> getSuratByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(USER_TIDAK_DITEMUKAN));

        return suratRepository.findByUserOrderByTglDiajukanDesc(user);
    }

    @Transactional
    public Surat ajukanSuratWarga(AjukanSuratRequestDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Request pengajuan surat tidak boleh kosong");
        }

        String nik = dto.getNik();
        if (nik == null || nik.isBlank()) {
            throw new IllegalArgumentException(NIK_WAJIB_DIISI);
        }

        User user = userRepository.findByNik(nik)
                .orElseThrow(() -> new RuntimeException("Profil dengan NIK " + nik + " tidak ditemukan di sistem."));

        Surat surat = new Surat();
        surat.setJenisSurat(resolveJenisSurat(dto.getJenisSurat()));
        surat.setKeperluan(dto.getKeperluan());
        surat.setStatus(Surat.StatusSurat.PENDING);
        surat.setTglDiajukan(LocalDateTime.now());
        surat.setUser(user);

        return suratRepository.save(surat);
    }

    @Transactional
    public Surat ajukanSuratWarga(String username, AjukanSuratRequestDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Request pengajuan surat tidak boleh kosong");
        }

        dto.setNik(username);
        return ajukanSuratWarga(dto);
    }

    public Surat createSurat(Long userId, Surat surat) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(USER_TIDAK_DITEMUKAN));

        surat.setUser(user);
        surat.setStatus(Surat.StatusSurat.PENDING);
        surat.setTglDiajukan(LocalDateTime.now());

        return suratRepository.save(surat);
    }

    private Surat.JenisSurat resolveJenisSurat(String rawJenisSurat) {
        if (rawJenisSurat == null || rawJenisSurat.isBlank()) {
            throw new IllegalArgumentException(JENIS_SURAT_WAJIB_DIISI);
        }

        String normalized = rawJenisSurat.trim().toUpperCase(Locale.ROOT);
        if (normalized.contains("SKU") || normalized.contains("USAHA")) {
            return Surat.JenisSurat.SKU;
        }
        if (normalized.contains("SKTM") || normalized.contains("TIDAK MAMPU")) {
            return Surat.JenisSurat.SKTM;
        }
        if (normalized.contains("SKD") || normalized.contains("DOMISILI")) {
            return Surat.JenisSurat.SKD;
        }

        try {
            return Surat.JenisSurat.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Jenis surat tidak dikenali: " + rawJenisSurat);
        }
    }

    public Surat updateStatus(Long id, Surat.StatusSurat status, String alasanDitolak) {
        Surat surat = getSuratById(id);

        surat.setStatus(status);

        if (status == Surat.StatusSurat.REJECTED || status == Surat.StatusSurat.DITOLAK) {
            surat.setAlasanDitolak(alasanDitolak);
        }

        if (status == Surat.StatusSurat.SELESAI || status == Surat.StatusSurat.PROSES) {
            surat.setTglDisetujui(LocalDateTime.now());
        }

        return suratRepository.save(surat);
    }

    public void deleteSurat(Long id) {
        Surat surat = getSuratById(id);
        suratRepository.delete(surat);
    }
}