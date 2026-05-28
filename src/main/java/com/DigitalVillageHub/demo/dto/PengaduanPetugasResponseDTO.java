package com.DigitalVillageHub.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PengaduanPetugasResponseDTO {

    @JsonProperty("pengaduan_id")
    private Long pengaduanId;

    @JsonProperty("petugas_id")
    private Long petugasId;

    @JsonProperty("petugas_nama")
    private String petugasNama;

    private String status;

    private String catatan;

    @JsonProperty("assigned_at")
    private LocalDateTime assignedAt;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}