package com.DigitalVillageHub.demo.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "wilayah")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wilayah {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rt;

    private String rw;

    @JsonProperty("nama_ketua")
    @Column(name = "nama_ketua")
    private String namaKetua;

    @JsonIgnore
    @OneToMany(mappedBy = "wilayah")
    private List<User> penduduk;
}