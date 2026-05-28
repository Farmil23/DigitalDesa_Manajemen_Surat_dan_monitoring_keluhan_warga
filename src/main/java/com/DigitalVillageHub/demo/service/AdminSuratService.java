package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.dto.SuratDetailResponse;
import com.DigitalVillageHub.demo.dto.VerifikasiSuratRequest;
import com.DigitalVillageHub.demo.dto.WargaPendukungDTO;
import com.DigitalVillageHub.demo.model.entity.Surat;
import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.persistence.SuratRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminSuratService {

    private final SuratRepository suratRepository;

    @Transactional(readOnly = true)
    public SuratDetailResponse getSuratDetailWithWarga(Long suratId) {
        Surat surat = suratRepository.findById(suratId)
                .orElseThrow(() -> new RuntimeException("Surat tidak ditemukan"));

        return mapToDetailResponse(surat, surat.getUser());
    }

    @Transactional
    public SuratDetailResponse prosesVerifikasiSurat(Long suratId, VerifikasiSuratRequest request) {
        Surat surat = suratRepository.findById(suratId)
                .orElseThrow(() -> new RuntimeException("Surat tidak ditemukan"));

        String status = normalizeStatus(request.getStatus());
        if (!"SELESAI".equals(status) && !"DITOLAK".equals(status)) {
            throw new RuntimeException("Status verifikasi harus SELESAI atau DITOLAK");
        }

        if ("DITOLAK".equals(status)) {
            if (request.getAlasanDitolak() == null || request.getAlasanDitolak().isBlank()) {
                throw new RuntimeException("Alasan penolakan wajib diisi saat surat ditolak");
            }

            surat.setStatus(Surat.StatusSurat.DITOLAK);
            surat.setAlasanDitolak(request.getAlasanDitolak().trim());
            surat.setTglDisetujui(null);
        } else {
            surat.setStatus(Surat.StatusSurat.SELESAI);
            surat.setAlasanDitolak(null);
            surat.setTglDisetujui(LocalDateTime.now());

            MultipartFile file = request.getFile();
            if (file != null && !file.isEmpty()) {
                surat.setDokumenUrl(storePdfFile(surat, file));
            }
        }

        Surat saved = suratRepository.save(surat);
        return mapToDetailResponse(saved, saved.getUser());
    }

    private SuratDetailResponse mapToDetailResponse(Surat surat, User user) {
        WargaPendukungDTO warga = null;
        if (user != null) {
            warga = WargaPendukungDTO.builder()
                    .id(user.getId())
                    .nik(user.getNik())
                    .namaLengkap(user.getNamaLengkap())
                    .noKk(user.getNoKk())
                    .rt(user.getRt())
                    .rw(user.getRw())
                    .statusDomisili(user.getStatusTinggal())
                    .alamat(user.getAlamat())
                    .statusAkun(user.getStatusAkun())
                    .build();
        }

        return SuratDetailResponse.builder()
                .id(surat.getId())
                .noSurat(surat.getNoSurat())
                .jenisSurat(surat.getJenisSurat() != null ? surat.getJenisSurat().name() : null)
                .keperluan(surat.getKeperluan())
                .status(surat.getStatus() != null ? surat.getStatus().name() : null)
                .alasanDitolak(surat.getAlasanDitolak())
                .tglDiajukan(surat.getTglDiajukan())
                .tglDisetujui(surat.getTglDisetujui())
                .dokumenUrl(surat.getDokumenUrl())
                .warga(warga)
                .build();
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            return null;
        }

        String trimmed = status.trim().toUpperCase();
        if ("REJECTED".equals(trimmed)) {
            return "DITOLAK";
        }
        return trimmed;
    }

    private String storePdfFile(Surat surat, MultipartFile file) {
        if (file.getContentType() != null && !"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new RuntimeException("Berkas surat harus berformat PDF");
        }

        try {
            Path uploadDir = Paths.get("uploads", "surat");
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String safeOriginal = originalName == null || originalName.isBlank()
                    ? "surat.pdf"
                    : originalName.replace("\\", "_").replace("/", "_").replace(":", "_");

            if (!safeOriginal.toLowerCase().endsWith(".pdf")) {
                safeOriginal = safeOriginal + ".pdf";
            }

            String fileName = "surat-" + surat.getId() + "-" + System.currentTimeMillis() + "-" + safeOriginal;
            Path target = uploadDir.resolve(fileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/surat/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Gagal menyimpan file PDF surat");
        }
    }
}