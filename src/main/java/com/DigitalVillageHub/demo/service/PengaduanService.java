package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.dto.PengaduanPetugasResponseDTO;
import com.DigitalVillageHub.demo.dto.PengaduanResponseDTO;
import com.DigitalVillageHub.demo.model.dto.AjukanPengaduanRequestDTO;
import com.DigitalVillageHub.demo.model.entity.Pengaduan;
import com.DigitalVillageHub.demo.model.entity.PengaduanPetugas;
import com.DigitalVillageHub.demo.model.entity.PengaduanPetugasId;
import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.persistence.PengaduanPetugasRepository;
import com.DigitalVillageHub.demo.persistence.PengaduanRepository;
import com.DigitalVillageHub.demo.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PengaduanService {

    private static final String REQUEST_KOSONG = "Request pengaduan tidak boleh kosong";
    private static final String NIK_WAJIB_DIISI = "NIK warga wajib diisi";
    private static final String JUDUL_WAJIB_DIISI = "Judul pengaduan wajib diisi";
    private static final String KATEGORI_WAJIB_DIISI = "Kategori pengaduan wajib diisi";
    private static final String DESKRIPSI_WAJIB_DIISI = "Deskripsi pengaduan wajib diisi";
    private static final String ENTITY_NOT_FOUND_SUFFIX = " tidak ditemukan";

    private final PengaduanRepository pengaduanRepository;
    private final PengaduanPetugasRepository pengaduanPetugasRepository;
    private final UserRepository userRepository;

    public List<PengaduanResponseDTO> getAllPengaduan() {
        return pengaduanRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public PengaduanResponseDTO ajukanLaporan(AjukanPengaduanRequestDTO dto) {
        try {
            validateAjukanRequest(dto);

            // PERUBAHAN DI SINI:
            // Ganti 2 baris pencarian NIK lama dengan 1 baris pemanggil resolveCurrentUser
            User warga = resolveCurrentUser(dto.getNik());

            Pengaduan.PrioritasPengaduan prioritas = resolvePrioritas(dto.getPrioritas());

            Pengaduan pengaduan = Pengaduan.builder()
                    .kodePengaduan(generateKodePengaduan())
                    .judul(dto.getJudul().trim())
                    .kategori(dto.getKategori().trim())
                    .deskripsi(dto.getDeskripsi().trim())
                    .lokasi(dto.getLokasi() != null ? dto.getLokasi().trim() : null)
                    .prioritas(prioritas)
                    .fotoBukti(dto.getFotoBukti())
                    .status(Pengaduan.StatusPengaduan.PENDING)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .warga(warga) // Warga sudah ketemu lewat resolveCurrentUser
                    .build();

            return toResponseDTO(pengaduanRepository.save(pengaduan));
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Gagal menyimpan pengaduan: " + e.getMessage(), e);
        }
    }
    
    public List<PengaduanResponseDTO> getRiwayatWargaByPrincipal(String principal) {
        User warga = resolveCurrentUser(principal);
        return pengaduanRepository.findByWargaOrderByCreatedAtDesc(warga)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public PengaduanPetugasResponseDTO assignPetugas(Long pengaduanId, Long petugasId, String catatan) {
        try {
            if (pengaduanId == null) {
                throw new IllegalArgumentException("ID pengaduan tidak boleh kosong");
            }

            if (petugasId == null) {
                throw new IllegalArgumentException("ID petugas wajib diisi");
            }

            Pengaduan pengaduan = pengaduanRepository.findById(pengaduanId)
                    .orElseThrow(() -> notFound("Pengaduan", "ID " + pengaduanId));

            User petugas = userRepository.findById(petugasId)
                    .orElseThrow(() -> notFound("Petugas", "ID " + petugasId));

            pengaduan.setStatus(Pengaduan.StatusPengaduan.DITUGASKAN);
            if (pengaduan.getTanggalDiproses() == null) {
                pengaduan.setTanggalDiproses(LocalDateTime.now());
            }
            pengaduanRepository.save(pengaduan);

            PengaduanPetugas assignment = PengaduanPetugas.builder()
                    .id(PengaduanPetugasId.builder()
                            .pengaduanId(pengaduanId)
                            .petugasId(petugasId)
                            .build())
                    .pengaduan(pengaduan)
                    .petugas(petugas)
                    .status(PengaduanPetugas.StatusPenugasan.DITUGASKAN)
                    .catatan(catatan)
                    .assignedAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            return toAssignmentDTO(pengaduanPetugasRepository.save(assignment));
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Gagal menugaskan pengaduan: " + e.getMessage(), e);
        }
    }

    @Transactional
    public PengaduanResponseDTO updateStatus(Long pengaduanId, Pengaduan.StatusPengaduan status, String alasanDitolak) {
        if (pengaduanId == null) {
            throw new IllegalArgumentException("ID pengaduan tidak boleh kosong");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status pengaduan tidak boleh kosong");
        }

        Pengaduan pengaduan = pengaduanRepository.findById(pengaduanId)
            .orElseThrow(() -> notFound("Pengaduan", "ID " + pengaduanId));

        pengaduan.setStatus(status);
        if ((status == Pengaduan.StatusPengaduan.DITUGASKAN || status == Pengaduan.StatusPengaduan.DIPROSES)
                && pengaduan.getTanggalDiproses() == null) {
            pengaduan.setTanggalDiproses(LocalDateTime.now());
        }
        if (status == Pengaduan.StatusPengaduan.SELESAI) {
            if (pengaduan.getTanggalDiproses() == null) {
                pengaduan.setTanggalDiproses(LocalDateTime.now());
            }
            pengaduan.setTanggalSelesai(LocalDateTime.now());
        }
        if (status == Pengaduan.StatusPengaduan.DITOLAK) {
            pengaduan.setAlasanDitolak(alasanDitolak);
        }

        return toResponseDTO(pengaduanRepository.save(pengaduan));
    }

    private void validateAjukanRequest(AjukanPengaduanRequestDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException(REQUEST_KOSONG);
        }
        if (dto.getNik() == null || dto.getNik().isBlank()) {
            throw new IllegalArgumentException(NIK_WAJIB_DIISI);
        }
        if (dto.getJudul() == null || dto.getJudul().isBlank()) {
            throw new IllegalArgumentException(JUDUL_WAJIB_DIISI);
        }
        if (dto.getKategori() == null || dto.getKategori().isBlank()) {
            throw new IllegalArgumentException(KATEGORI_WAJIB_DIISI);
        }
        if (dto.getDeskripsi() == null || dto.getDeskripsi().isBlank()) {
            throw new IllegalArgumentException(DESKRIPSI_WAJIB_DIISI);
        }
    }

    private Pengaduan.PrioritasPengaduan resolvePrioritas(String rawPrioritas) {
        if (rawPrioritas == null || rawPrioritas.isBlank()) {
            return Pengaduan.PrioritasPengaduan.SEDANG;
        }

        String normalized = rawPrioritas.trim().toUpperCase(Locale.ROOT);
        try {
            return Pengaduan.PrioritasPengaduan.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return Pengaduan.PrioritasPengaduan.SEDANG;
        }
    }

    private User resolveCurrentUser(String principal) {
        if (principal == null || principal.isBlank()) {
            throw new IllegalArgumentException("Tidak ada identitas warga yang terautentikasi");
        }

        String trimmed = principal.trim();
        if (trimmed.matches("\\d+")) {
            Long userId = Long.parseLong(trimmed);
            return userRepository.findById(userId)
                    .orElseThrow(() -> notFound("Warga", "ID " + userId));
        }

        return userRepository.findByUsername(trimmed)
                .or(() -> userRepository.findByNik(trimmed))
                .orElseThrow(() -> notFound("Warga", "identitas " + trimmed));
    }

    private IllegalArgumentException notFound(String entityName, String identifier) {
        return new IllegalArgumentException(entityName + " dengan " + identifier + ENTITY_NOT_FOUND_SUFFIX);
    }

    private PengaduanResponseDTO toResponseDTO(Pengaduan pengaduan) {
        User warga = pengaduan.getWarga();

        List<PengaduanPetugas> penugasan = pengaduanPetugasRepository.findByPengaduan_IdOrderByAssignedAtDesc(pengaduan.getId());
        String petugasNama = null;
        Long petugasId = null;
        String catatanPetugas = null;
        if (penugasan != null && !penugasan.isEmpty()) {
            PengaduanPetugas active = penugasan.get(0);
            if (active.getPetugas() != null) {
                petugasNama = active.getPetugas().getNamaLengkap();
                petugasId = active.getPetugas().getId();
            }
            catatanPetugas = active.getCatatan();
        }

        return PengaduanResponseDTO.builder()
                .id(pengaduan.getId())
                .kodePengaduan(pengaduan.getKodePengaduan())
                .judul(pengaduan.getJudul())
                .kategori(pengaduan.getKategori())
                .deskripsi(pengaduan.getDeskripsi())
                .lokasi(pengaduan.getLokasi())
                .prioritas(pengaduan.getPrioritas() != null ? pengaduan.getPrioritas().name() : null)
                .status(pengaduan.getStatus() != null ? pengaduan.getStatus().name() : null)
                .fotoBukti(pengaduan.getFotoBukti())
                .alasanDitolak(pengaduan.getAlasanDitolak())
                .tanggalDiproses(pengaduan.getTanggalDiproses())
                .tanggalSelesai(pengaduan.getTanggalSelesai())
                .createdAt(pengaduan.getCreatedAt())
                .updatedAt(pengaduan.getUpdatedAt())
                .pelaporId(warga != null ? warga.getId() : null)
                .wargaId(warga != null ? warga.getId() : null)
                .pelaporNik(warga != null ? warga.getNik() : null)
                .pelaporNama(warga != null ? warga.getNamaLengkap() : null)
                .petugasId(petugasId)
                .petugasNama(petugasNama)
                .catatanPetugas(catatanPetugas)
                .build();
    }

    private PengaduanPetugasResponseDTO toAssignmentDTO(PengaduanPetugas assignment) {
        User petugas = assignment.getPetugas();
        return PengaduanPetugasResponseDTO.builder()
                .pengaduanId(assignment.getPengaduan() != null ? assignment.getPengaduan().getId() : null)
                .petugasId(petugas != null ? petugas.getId() : null)
                .petugasNama(petugas != null ? petugas.getNamaLengkap() : null)
                .status(assignment.getStatus() != null ? assignment.getStatus().name() : null)
                .catatan(assignment.getCatatan())
                .assignedAt(assignment.getAssignedAt())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .build();
    }

    private String generateKodePengaduan() {
        String tanggal = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String uuid8 = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);
        return "PGD-" + tanggal + uuid8;
    }
}