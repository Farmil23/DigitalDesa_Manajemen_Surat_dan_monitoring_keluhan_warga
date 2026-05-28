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
public class PengaduanResponseDTO {

    private Long id;
    @JsonProperty("kode_pengaduan")
    private String kodePengaduan;
    private String judul;
    private String kategori;
    private String deskripsi;
    private String lokasi;
    private String prioritas;
    private String status;

    @JsonProperty("foto_bukti")
    private String fotoBukti;

    @JsonProperty("alasan_ditolak")
    private String alasanDitolak;

    @JsonProperty("tanggal_diproses")
    private LocalDateTime tanggalDiproses;

    @JsonProperty("tanggal_selesai")
    private LocalDateTime tanggalSelesai;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @JsonProperty("pelapor_id")
    private Long pelaporId;

    @JsonProperty("warga_id")
    private Long wargaId;

    @JsonProperty("pelapor_nik")
    private String pelaporNik;

    @JsonProperty("pelapor_nama")
    private String pelaporNama;

    @JsonProperty("petugas_id")
    private Long petugasId;

    @JsonProperty("petugas_nama")
    private String petugasNama;

    @JsonProperty("catatan_petugas")
    private String catatanPetugas;
}