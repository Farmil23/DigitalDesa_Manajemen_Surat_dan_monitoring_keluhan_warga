package com.DigitalVillageHub.demo.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AjukanPengaduanRequestDTO {

    @JsonProperty("nik")
    private String nik;

    @JsonProperty("judul")
    private String judul;

    @JsonProperty("kategori")
    private String kategori;

    @JsonProperty("deskripsi")
    private String deskripsi;

    @JsonProperty("lokasi")
    private String lokasi;

    @JsonProperty("prioritas")
    private String prioritas;

    @JsonProperty("foto_bukti")
    private String fotoBukti;
}