package com.DigitalVillageHub.demo.model.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class OnboardingRequestDTO {

    /**
     * Mengikuti nama field form-data dari frontend.
     */
    private String no_kk;

    private String status_hubungan;

    private String status_tinggal;

    // ─── DATA SPASIAL WILAYAH (WAJIB ADA BIAR AUTSERVICE GA MERAH) ───
    private String alamat;

    private String rt;

    private String rw;

    /**
     * Sesuai spesifikasi: field evidence.
     */
    private MultipartFile evidence;

    /**
     * Kompatibilitas dengan implementasi UI yang sudah ada (WargaOnboarding.tsx).
     */
    private MultipartFile foto_ktp;

    public MultipartFile resolveEvidence() {
        if (evidence != null && !evidence.isEmpty()) {
            return evidence;
        }
        if (foto_ktp != null && !foto_ktp.isEmpty()) {
            return foto_ktp;
        }
        return null;
    }
}