package com.DigitalVillageHub.demo.model.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "finances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Finance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // Menyimpan data "PEMASUKAN" atau "PENGELUARAN" / "INCOME" atau "EXPENSE"

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String category;

    private String recipient;

    @JsonProperty("evidence_url")
    @Column(name = "evidence_url")
    private String evidenceUrl;

    @JsonProperty("current_balance")
    @Column(name = "current_balance", precision = 15, scale = 2)
    private BigDecimal currentBalance;

    @JsonProperty("transaction_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy") // FIX: Menyelaraskan format dari kalender web (24/05/2026)
    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    @JsonProperty("created_at")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }
    }
}