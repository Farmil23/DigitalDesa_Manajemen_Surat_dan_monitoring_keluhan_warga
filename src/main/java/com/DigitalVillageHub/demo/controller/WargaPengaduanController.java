package com.DigitalVillageHub.demo.controller;

import com.DigitalVillageHub.demo.dto.PengaduanResponseDTO;
import com.DigitalVillageHub.demo.model.dto.AjukanPengaduanRequestDTO;
import com.DigitalVillageHub.demo.service.PengaduanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/warga/pengaduan")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WargaPengaduanController {

    private static final String SUCCESS = "success";
    private static final String MESSAGE = "message";
    private static final String DATA = "data";

    private final PengaduanService pengaduanService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> ajukanLaporan(
            @RequestBody AjukanPengaduanRequestDTO request,
            Authentication authentication
    ) {
        try {
            // OTOMATISASI NIK: Jika frontend tidak mengirim NIK, ambil dari data login (Authentication)
            if ((request.getNik() == null || request.getNik().isBlank()) && authentication != null) {
                request.setNik(authentication.getName());
            }

            PengaduanResponseDTO data = pengaduanService.ajukanLaporan(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                        SUCCESS, true,
                        MESSAGE, "Pengaduan berhasil diajukan",
                        DATA, data
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                        SUCCESS, false,
                        MESSAGE, e.getMessage()
            ));
        }
    }

    @GetMapping("/riwayat")
    public ResponseEntity<Map<String, Object>> riwayatPengaduan(
            Authentication authentication,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            String principal = resolvePrincipal(authentication, authorization);
            if (principal == null || principal.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        SUCCESS, false,
                        MESSAGE, "Tidak terautentikasi. Silakan login ulang."
                ));
            }

            return ResponseEntity.ok(Map.of(
                    SUCCESS, true,
                    DATA, pengaduanService.getRiwayatWargaByPrincipal(principal)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    SUCCESS, false,
                    MESSAGE, e.getMessage()
            ));
        }
    }

    private String resolvePrincipal(Authentication authentication, String authorization) {
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            return authentication.getName();
        }

        if (authorization == null || authorization.isBlank()) {
            return null;
        }

        String trimmed = authorization.trim();
        if (!trimmed.startsWith("Bearer ")) {
            return null;
        }

        String token = trimmed.substring("Bearer ".length());
        if (!token.startsWith("DEV-TOKEN-")) {
            return null;
        }

        String idPart = token.substring("DEV-TOKEN-".length());
        try {
            Long.parseLong(idPart);
            return idPart;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}