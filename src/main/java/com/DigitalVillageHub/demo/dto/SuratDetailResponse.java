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
public class SuratDetailResponse {

    private Long id;

    @JsonProperty("no_surat")
    private String noSurat;

    @JsonProperty("jenis_surat")
    private String jenisSurat;

    private String keperluan;

    private String status;

    @JsonProperty("alasan_ditolak")
    private String alasanDitolak;

    @JsonProperty("tgl_diajukan")
    private LocalDateTime tglDiajukan;

    @JsonProperty("tgl_disetujui")
    private LocalDateTime tglDisetujui;

    @JsonProperty("dokumen_url")
    private String dokumenUrl;

    private WargaPendukungDTO warga;
}