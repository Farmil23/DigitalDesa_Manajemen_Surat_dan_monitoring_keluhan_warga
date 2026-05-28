package com.DigitalVillageHub.demo.controller;

import com.DigitalVillageHub.demo.dto.VerifikasiWargaDTO;
import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.service.AdminPendudukService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/penduduk")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminPendudukController {

    private final AdminPendudukService adminPendudukService;

    @GetMapping
    public ResponseEntity<?> getAllPenduduk() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", adminPendudukService.getAllPenduduk()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPendudukById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", adminPendudukService.getPendudukById(id)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPenduduk(@RequestBody User request) {
        try {
            User saved = adminPendudukService.createPenduduk(request);

            return ResponseEntity.status(201).body(Map.of(
                    "success", true,
                    "message", "Warga baru bernama " + saved.getNamaLengkap() + " berhasil ditambahkan",
                    "data", saved
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePenduduk(
            @PathVariable Long id,
            @RequestBody User request
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Data penduduk berhasil diperbarui",
                    "data", adminPendudukService.updatePenduduk(id, request)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/verify/{id}")
    public ResponseEntity<?> verifyPenduduk(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        try {
            String status = request.get("status_akun");

            if (status == null || status.isBlank()) {
                status = request.get("status");
            }

            if (status == null || status.isBlank()) {
                throw new RuntimeException("Status akun wajib diisi");
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Status penduduk berhasil diperbarui",
                    "data", adminPendudukService.verifyPenduduk(
                            id,
                            status,
                            request.get("alasan_ditolak")
                    )
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/verifikasi")
    public ResponseEntity<?> verifikasiBerkasWarga(
            @PathVariable Long id,
            @RequestBody VerifikasiWargaDTO dto
    ) {
        try {
            User updated = adminPendudukService.verifikasiBerkasWarga(id, dto);

            HashMap<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Status verifikasi warga berhasil diperbarui");
            response.put("data", updated);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approvePenduduk(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Penduduk berhasil disetujui",
                    "data", adminPendudukService.approvePenduduk(id)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectPenduduk(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Penduduk berhasil ditolak",
                    "data", adminPendudukService.rejectPenduduk(
                            id,
                            request.get("alasan_ditolak")
                    )
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePenduduk(@PathVariable Long id) {
        try {
            adminPendudukService.deletePenduduk(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Data penduduk berhasil dihapus dari sistem"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}