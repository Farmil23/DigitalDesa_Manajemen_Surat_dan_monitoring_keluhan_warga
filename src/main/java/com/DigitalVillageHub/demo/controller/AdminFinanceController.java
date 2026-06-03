package com.DigitalVillageHub.demo.controller;

import com.DigitalVillageHub.demo.model.entity.Finance;
import com.DigitalVillageHub.demo.service.AdminFinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/finance")
@RequiredArgsConstructor
public class AdminFinanceController {

    private final AdminFinanceService adminFinanceService;

    @GetMapping
    public ResponseEntity<?> getFinanceSummary() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", adminFinanceService.getFinanceSummary());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("data", adminFinanceService.getAllTransactions());
        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createTransaction(@RequestBody Finance finance) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Transaksi berhasil ditambahkan");
        response.put("data", adminFinanceService.createTransaction(finance, null));
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTransactionMultipart(
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("category") String category,
            @RequestParam(value = "recipient", required = false) String recipient,
            @RequestParam(value = "transaction_date", required = false) String transactionDate,
            @RequestPart(value = "evidence", required = false) MultipartFile evidence
    ) {
        Finance finance = new Finance();
        finance.setTitle(title);
        finance.setType(type);
        finance.setAmount(amount);
        finance.setCategory(category);
        finance.setRecipient(recipient);
        finance.setTransactionDate(parseTransactionDate(transactionDate));

        // evidence file belum diproses di sisi backend saat ini; request tetap diterima.
        // Jika diperlukan, evidence bisa disimpan dan di-set ke finance.setEvidenceUrl(...)

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Transaksi berhasil ditambahkan");
        response.put("data", adminFinanceService.createTransaction(finance, evidence));
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @RequestBody Finance finance
    ) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Transaksi berhasil diperbarui");
        response.put("data", adminFinanceService.updateTransaction(id, finance, null));
        return ResponseEntity.ok(response);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateTransactionMultipart(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("category") String category,
            @RequestParam(value = "recipient", required = false) String recipient,
            @RequestParam(value = "transaction_date", required = false) String transactionDate,
            @RequestPart(value = "evidence", required = false) MultipartFile evidence
    ) {
        Finance finance = new Finance();
        finance.setTitle(title);
        finance.setType(type);
        finance.setAmount(amount);
        finance.setCategory(category);
        finance.setRecipient(recipient);
        finance.setTransactionDate(parseTransactionDate(transactionDate));

        // evidence file belum diproses di sisi backend saat ini.

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Transaksi berhasil diperbarui");
        response.put("data", adminFinanceService.updateTransaction(id, finance, evidence));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        adminFinanceService.deleteTransaction(id);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Transaksi berhasil dihapus");
        return ResponseEntity.ok(response);
    }

    private LocalDate parseTransactionDate(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }

        // Frontend <input type="date"> menghasilkan yyyy-MM-dd.
        // Tetap dukung dd/MM/yyyy jika ada input manual / legacy.
        String trimmed = raw.trim();
        try {
            return LocalDate.parse(trimmed, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ignored) {
            // fallback
        }
        try {
            return LocalDate.parse(trimmed, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Format tanggal tidak valid. Gunakan yyyy-MM-dd atau dd/MM/yyyy");
        }
    }
}