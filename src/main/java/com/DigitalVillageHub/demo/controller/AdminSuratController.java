package com.DigitalVillageHub.demo.controller;

import com.DigitalVillageHub.demo.dto.SuratDetailResponse;
import com.DigitalVillageHub.demo.dto.VerifikasiSuratRequest;
import com.DigitalVillageHub.demo.service.AdminSuratService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/surat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminSuratController {

    private final AdminSuratService adminSuratService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetailSurat(@PathVariable Long id) {
        SuratDetailResponse data = adminSuratService.getSuratDetailWithWarga(id);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Detail surat berhasil diambil");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}/verifikasi", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> verifikasiSurat(
            @PathVariable Long id,
            @ModelAttribute VerifikasiSuratRequest request
    ) {
        SuratDetailResponse data = adminSuratService.prosesVerifikasiSurat(id, request);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Verifikasi surat berhasil diproses");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}