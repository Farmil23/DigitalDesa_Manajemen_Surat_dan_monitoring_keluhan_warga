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
public class UpdatePengaduanStatusRequestDTO {

    @JsonProperty("status")
    private String status;

    @JsonProperty("alasan_ditolak")
    private String alasanDitolak;
}
