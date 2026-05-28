package com.DigitalVillageHub.demo.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class PengaduanPetugasId implements Serializable {

    @Column(name = "pengaduan_id")
    private Long pengaduanId;

    @Column(name = "petugas_id")
    private Long petugasId;
}