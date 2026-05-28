package com.DigitalVillageHub.demo.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AjukanSuratRequestDTO {

    @JsonProperty("nik")
    private String nik;

    @JsonProperty("jenis_surat")
    private String jenisSurat;

    private String keperluan;
}