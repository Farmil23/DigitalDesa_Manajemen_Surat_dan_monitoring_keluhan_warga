package com.DigitalVillageHub.demo.controller;

import com.DigitalVillageHub.demo.model.entity.Finance;
import com.DigitalVillageHub.demo.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/finances")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping
    public ResponseEntity<?> getAllFinances() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", financeService.getAllFinances()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFinanceById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", financeService.getFinanceById(id)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<?> getFinancesByType(@PathVariable String type) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", financeService.getFinancesByType(type)
        ));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getFinancesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", financeService.getFinancesByCategory(category)
        ));
    }

    @PostMapping
    public ResponseEntity<?> createFinance(@RequestBody Finance finance) {
        try {
            return ResponseEntity.status(201).body(Map.of(
                    "success", true,
                    "message", "Data keuangan berhasil dibuat",
                    "data", financeService.createFinance(finance)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFinance(
            @PathVariable Long id,
            @RequestBody Finance finance
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Data keuangan berhasil diperbarui",
                    "data", financeService.updateFinance(id, finance)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFinance(@PathVariable Long id) {
        try {
            financeService.deleteFinance(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Data keuangan berhasil dihapus"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}