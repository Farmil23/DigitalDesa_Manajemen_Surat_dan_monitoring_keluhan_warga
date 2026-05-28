package com.DigitalVillageHub.demo.controller;

import com.DigitalVillageHub.demo.model.entity.Report;
import com.DigitalVillageHub.demo.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<?> getAllReports() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", reportService.getAllReports()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", reportService.getReportById(id)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReportsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", reportService.getReportsByUserId(userId)
        ));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getReportsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", reportService.getReportsByStatus(status)
        ));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createReport(
            @PathVariable Long userId,
            @RequestBody Report report
    ) {
        try {
            return ResponseEntity.status(201).body(Map.of(
                    "success", true,
                    "message", "Laporan berhasil dibuat",
                    "data", reportService.createReport(userId, report)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReport(
            @PathVariable Long id,
            @RequestBody Report report
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Laporan berhasil diperbarui",
                    "data", reportService.updateReport(id, report)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Status laporan berhasil diperbarui",
                    "data", reportService.updateStatus(id, request.get("status"))
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        try {
            reportService.deleteReport(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Laporan berhasil dihapus"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}