package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.dto.VerifikasiWargaDTO;
import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPendudukService {

    private final UserRepository userRepository;

    public List<User> getAllPenduduk() {
        return userRepository.findAll();
    }

    public List<User> getAllWarga() {
        return userRepository.findByRole(User.Role.WARGA);
    }

    public User getPendudukById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penduduk tidak ditemukan"));
    }

    public User createPenduduk(User request) {
        if (userRepository.existsByNik(request.getNik())) {
            throw new RuntimeException("NIK sudah digunakan");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username sudah digunakan");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            request.setPassword(request.getNik());
        }

        request.setPassword(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));

        if (request.getRole() == null) {
            request.setRole(User.Role.WARGA);
        }

        if (request.getStatusAkun() == null || request.getStatusAkun().isBlank()) {
            request.setStatusAkun("APPROVED");
        }

        return userRepository.save(request);
    }

    public User updatePenduduk(Long id, User request) {
        User user = getPendudukById(id);

        user.setNik(request.getNik());
        user.setNoKk(request.getNoKk());
        user.setNamaLengkap(request.getNamaLengkap());
        user.setUsername(request.getUsername());
        user.setNoHp(request.getNoHp());
        user.setAlamat(request.getAlamat());
        user.setRt(request.getRt());
        user.setRw(request.getRw());
        user.setRole(request.getRole());
        user.setStatusAkun(request.getStatusAkun());
        user.setStatusHubungan(request.getStatusHubungan());
        user.setStatusTinggal(request.getStatusTinggal());
        user.setFotoKtp(request.getFotoKtp());
        user.setAlasanDitolak(request.getAlasanDitolak());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));
        }

        return userRepository.save(user);
    }

    public User verifyPenduduk(Long id, String statusAkun, String alasanDitolak) {
        User user = getPendudukById(id);

        user.setStatusAkun(statusAkun);

        if ("REJECTED".equalsIgnoreCase(statusAkun)) {
            user.setAlasanDitolak(alasanDitolak);
        } else {
            user.setAlasanDitolak(null);
        }

        return userRepository.save(user);
    }

    public User approvePenduduk(Long id) {
        return verifyPenduduk(id, "APPROVED", null);
    }

    public User rejectPenduduk(Long id, String alasanDitolak) {
        return verifyPenduduk(id, "REJECTED", alasanDitolak);
    }

    @Transactional
    public User verifikasiBerkasWarga(Long id, VerifikasiWargaDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warga tidak ditemukan"));

        String statusAkun = dto != null && dto.getStatusAkun() != null
                ? dto.getStatusAkun().trim().toUpperCase()
                : "";

        if (statusAkun.isBlank()) {
            throw new RuntimeException("Status akun wajib diisi");
        }

        if (!"VERIFIED".equals(statusAkun) && !"DATA_REJECTED".equals(statusAkun)) {
            throw new RuntimeException("Status akun tidak valid. Gunakan VERIFIED atau DATA_REJECTED");
        }

        user.setStatusAkun(statusAkun);

        if ("DATA_REJECTED".equals(statusAkun)) {
            user.setAlasanDitolak(dto != null ? dto.getAlasanDitolak() : null);
        } else {
            user.setAlasanDitolak(null);
        }

        return userRepository.save(user);
    }

    public void deletePenduduk(Long id) {
        userRepository.delete(getPendudukById(id));
    }
}