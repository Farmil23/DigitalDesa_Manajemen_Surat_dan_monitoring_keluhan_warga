package com.DigitalVillageHub.demo.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "keluarga")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Keluarga {

    @Id
    @JsonProperty("no_kk")
    @Column(name = "no_kk", length = 16)
    private String noKk;

    @JsonProperty("alamat_kk")
    @Column(name = "alamat_kk", columnDefinition = "TEXT")
    private String alamatKk;

    @JsonIgnore
    @OneToMany(mappedBy = "keluarga")
    private List<User> anggotaKeluarga;
}