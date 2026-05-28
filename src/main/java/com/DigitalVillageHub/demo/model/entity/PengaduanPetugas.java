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

@Entity
@Table(name = "pengaduan_petugas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"pengaduan", "petugas"})
@EqualsAndHashCode(exclude = {"pengaduan", "petugas"})
public class PengaduanPetugas {

    public enum StatusPenugasan {
        DITUGASKAN,
        DIKERJAKAN,
        SELESAI
    }

    @EmbeddedId
    private PengaduanPetugasId id;

    @MapsId("pengaduanId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pengaduan_id", nullable = false)
    private Pengaduan pengaduan;

    @MapsId("petugasId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "petugas_id", nullable = false)
    private User petugas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPenugasan status;

    @Column(columnDefinition = "TEXT")
    private String catatan;

    @JsonProperty("assigned_at")
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @JsonProperty("created_at")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = PengaduanPetugasId.builder().build();
        }
        if (status == null) {
            status = StatusPenugasan.DITUGASKAN;
        }
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
        if (createdAt == null) {
            createdAt = assignedAt;
        }
        if (updatedAt == null) {
            updatedAt = assignedAt;
        }
        if (pengaduan != null) {
            id.setPengaduanId(pengaduan.getId());
        }
        if (petugas != null) {
            id.setPetugasId(petugas.getId());
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}