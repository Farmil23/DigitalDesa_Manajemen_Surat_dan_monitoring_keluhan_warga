package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.model.entity.Finance;
import com.DigitalVillageHub.demo.persistence.FinanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AdminFinanceService {

    private final FinanceRepository financeRepository;

    public Map<String, Object> getFinanceSummary() {
        // Mengambil semua data berurutan berdasarkan id paling baru
        List<Finance> transactions = financeRepository.findAllByOrderByIdDesc();

        // Mengamankan kalkulasi Income (Mendukung tipe Bahasa Indonesia ataupun Bahasa Inggris)
        BigDecimal income = transactions.stream()
                .filter(f -> "INCOME".equalsIgnoreCase(f.getType()) || "PEMASUKAN".equalsIgnoreCase(f.getType()))
                .map(Finance::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Mengamankan kalkulasi Expense 
        BigDecimal expense = transactions.stream()
                .filter(f -> "EXPENSE".equalsIgnoreCase(f.getType()) || "PENGELUARAN".equalsIgnoreCase(f.getType()))
                .map(Finance::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = income.subtract(expense);

        return Map.of(
                "income", income,
                "expense", expense,
                "balance", balance,
                "transactions", transactions
        );
    }

    public List<Finance> getAllTransactions() {
        return financeRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public Finance createTransaction(Finance finance, MultipartFile evidence) {
        String normalizedType = normalizeType(finance.getType());
        if (normalizedType == null) {
            throw new RuntimeException("Tipe transaksi wajib diisi");
        }
        if (!"INCOME".equals(normalizedType) && !"EXPENSE".equals(normalizedType)) {
            throw new RuntimeException("Tipe transaksi tidak valid. Gunakan INCOME/EXPENSE atau Pemasukan/Pengeluaran");
        }
        finance.setType(normalizedType);

        if (finance.getTransactionDate() == null) {
            finance.setTransactionDate(LocalDate.now());
        }

        // Ambil saldo terakhir dari baris database paling atas (Order By ID Desc)
        List<Finance> existingTx = financeRepository.findAllByOrderByIdDesc();
        BigDecimal lastBalance = BigDecimal.ZERO;
        
        if (!existingTx.isEmpty()) {
            Finance newestRecord = existingTx.get(0);
            if (newestRecord.getCurrentBalance() != null) {
                lastBalance = newestRecord.getCurrentBalance();
            }
        }

        // Jalankan kalkulasi current_balance otomatis sebelum masuk ke HeidiSQL
        String currentType = finance.getType();
        BigDecimal txAmount = finance.getAmount() != null ? finance.getAmount() : BigDecimal.ZERO;

        if ("INCOME".equals(currentType)) {
            finance.setCurrentBalance(lastBalance.add(txAmount));
        } else if ("EXPENSE".equals(currentType)) {
            finance.setCurrentBalance(lastBalance.subtract(txAmount));
        } else {
            finance.setCurrentBalance(lastBalance); // Jika tipe tidak dikenal, saldo tetap
        }

        if (evidence != null && !evidence.isEmpty()) {
            finance.setEvidenceUrl(storeFinanceEvidence(evidence));
        }

        return financeRepository.save(finance);
    }

    @Transactional
    public Finance updateTransaction(Long id, Finance request, MultipartFile evidence) {
        Finance finance = financeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Data keuangan tidak ditemukan"));

        if (request.getTitle() != null) {
            finance.setTitle(request.getTitle());
        }

        String normalizedType = normalizeType(request.getType());
        if (normalizedType == null) {
            throw new RuntimeException("Tipe transaksi wajib diisi");
        }
        if (!"INCOME".equals(normalizedType) && !"EXPENSE".equals(normalizedType)) {
            throw new RuntimeException("Tipe transaksi tidak valid. Gunakan INCOME/EXPENSE atau Pemasukan/Pengeluaran");
        }
        finance.setType(normalizedType);

        if (request.getAmount() != null) {
            finance.setAmount(request.getAmount());
        }
        if (request.getCategory() != null) {
            finance.setCategory(request.getCategory());
        }
        if (request.getRecipient() != null) {
            finance.setRecipient(request.getRecipient());
        }
        if (evidence != null && !evidence.isEmpty()) {
            finance.setEvidenceUrl(storeFinanceEvidence(evidence));
        } else if (request.getEvidenceUrl() != null) {
            finance.setEvidenceUrl(request.getEvidenceUrl());
        }
        if (request.getCurrentBalance() != null) {
            finance.setCurrentBalance(request.getCurrentBalance());
        }
        if (request.getTransactionDate() != null) {
            finance.setTransactionDate(request.getTransactionDate());
        }

        return financeRepository.save(finance);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Finance finance = financeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Data keuangan tidak ditemukan"));

        financeRepository.delete(finance);
    }

    private String normalizeType(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        String upper = trimmed.toUpperCase(Locale.ROOT);
        return switch (upper) {
            case "INCOME", "PEMASUKAN" -> "INCOME";
            case "EXPENSE", "PENGELUARAN" -> "EXPENSE";
            default -> upper;
        };
    }

    private String storeFinanceEvidence(MultipartFile evidence) {
        String contentType = evidence.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("application/pdf"))) {
            throw new RuntimeException("Tipe file tidak didukung. Harap unggah JPEG, PNG, atau PDF.");
        }

        String originalName = evidence.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException("Nama file tidak valid");
        }

        String lowerCaseName = originalName.toLowerCase();
        if (!lowerCaseName.endsWith(".jpg") && !lowerCaseName.endsWith(".jpeg") && !lowerCaseName.endsWith(".png") && !lowerCaseName.endsWith(".pdf")) {
            throw new RuntimeException("Ekstensi file tidak diizinkan. Harap unggah .jpg, .jpeg, .png, atau .pdf.");
        }

        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalName.substring(dotIndex);
        } else {
            throw new RuntimeException("Ekstensi file tidak ditemukan");
        }

        try {
            Path uploadDir = Paths.get("uploads", "finance");
            Files.createDirectories(uploadDir);

            String fileName = "finance_" + java.util.UUID.randomUUID().toString() + extension;
            Path target = uploadDir.resolve(fileName);

            try (var in = evidence.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/finance/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Gagal menyimpan berkas kuitansi");
        }
    }
}