package com.DigitalVillageHub.demo.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RegisterRequest {

    private String nik;

    @JsonProperty("nama_lengkap")
    private String namaLengkap;

    private String username;
    private String password;

    @JsonProperty("no_hp")
    private String noHp;
}