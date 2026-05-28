package com.DigitalVillageHub.demo.dto;

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
public class WargaPendukungDTO {

    private Long id;

    private String nik;

    private String namaLengkap;

    private String noKk;

    private String rt;

    private String rw;

    private String statusDomisili;

    private String alamat;

    private String statusAkun;
}