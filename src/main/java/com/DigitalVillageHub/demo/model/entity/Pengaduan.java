package com.DigitalVillageHub.demo.model.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pengaduan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "warga")
@EqualsAndHashCode(exclude = "warga")
public class Pengaduan {

    public enum PrioritasPengaduan {
        RENDAH,
        SEDANG,
        TINGGI,
        DARURAT
    }

    public enum StatusPengaduan {
        PENDING,
        DITUGASKAN,
        DIPROSES,
        SELESAI,
        DITOLAK
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kode_pengaduan", nullable = false, unique = true, length = 50)
    private String kodePengaduan;

    @Column(nullable = false, length = 150)
    private String judul;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String deskripsi;

    @Column(nullable = false, length = 100)
    private String kategori;

    @Column(length = 255)
    private String lokasi;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrioritasPengaduan prioritas;

    @JsonProperty("foto_bukti")
    @Column(name = "foto_bukti", columnDefinition = "TEXT")
    private String fotoBukti;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusPengaduan status;

    @JsonProperty("alasan_ditolak")
    @Column(name = "alasan_ditolak", columnDefinition = "TEXT")
    private String alasanDitolak;

    @JsonProperty("tanggal_diproses")
    @Column(name = "tanggal_diproses")
    private LocalDateTime tanggalDiproses;

    @JsonProperty("tanggal_selesai")
    @Column(name = "tanggal_selesai")
    private LocalDateTime tanggalSelesai;

    @JsonProperty("created_at")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warga_id", nullable = false)
    private User warga;

    @PrePersist
    public void prePersist() {
        if (kodePengaduan == null || kodePengaduan.isBlank()) {
            kodePengaduan = generateKodePengaduan();
        }
        if (prioritas == null) {
            prioritas = PrioritasPengaduan.SEDANG;
        }
        if (status == null) {
            status = StatusPengaduan.PENDING;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = createdAt;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private String generateKodePengaduan() {
        return "PGD-" + LocalDateTime.now().toLocalDate().toString().replace("-", "")
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}