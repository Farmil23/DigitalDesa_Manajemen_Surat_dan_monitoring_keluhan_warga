package com.DigitalVillageHub.demo.model.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "surat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Surat {

    public enum JenisSurat {
        SKD, SKU, SKTM
    }

    public enum StatusSurat {
        PENDING, PROSES, SELESAI, DITOLAK, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("no_surat")
    @Column(name = "no_surat", length = 100)
    private String noSurat;

    @JsonProperty("jenis_surat")
    @Enumerated(EnumType.STRING)
    @Column(name = "jenis_surat", nullable = false)
    private JenisSurat jenisSurat;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String keperluan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSurat status;

    @JsonProperty("alasan_ditolak")
    @Column(name = "alasan_ditolak", columnDefinition = "TEXT")
    private String alasanDitolak;

    @JsonProperty("dokumen_url")
    @Column(name = "dokumen_url", columnDefinition = "TEXT")
    private String dokumenUrl;

    @JsonProperty("token_qr")
    @Column(name = "token_qr")
    private String tokenQr;

    @JsonProperty("tgl_diajukan")
    @Column(name = "tgl_diajukan")
    private LocalDateTime tglDiajukan;

    @JsonProperty("tgl_disetujui")
    @Column(name = "tgl_disetujui")
    private LocalDateTime tglDisetujui;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = StatusSurat.PENDING;
        }
        if (tglDiajukan == null) {
            tglDiajukan = LocalDateTime.now();
        }
    }
}