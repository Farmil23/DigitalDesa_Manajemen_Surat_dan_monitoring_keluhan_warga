package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.model.entity.Wilayah;
import com.DigitalVillageHub.demo.persistence.UserRepository;
import com.DigitalVillageHub.demo.persistence.WilayahRepository;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final WilayahRepository wilayahRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getAllWarga() {
        return userRepository.findByRole(User.Role.WARGA);
    }

    public List<User> getUsersByStatusAkun(String statusAkun) {
        return userRepository.findByStatusAkun(statusAkun);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
    }

    public User createUser(User request) {

        if (userRepository.existsByNik(request.getNik())) {
            throw new RuntimeException("NIK sudah digunakan");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username sudah digunakan");
        }

        User user = User.builder()
                .nik(request.getNik())
                .noKk(request.getNoKk())
                .namaLengkap(request.getNamaLengkap())
                .username(request.getUsername())
                .password(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()))
                .noHp(request.getNoHp())
                .alamat(request.getAlamat())
                .rt(request.getRt())
                .rw(request.getRw())
                .role(request.getRole() == null ? User.Role.WARGA : request.getRole())
                .statusAkun(request.getStatusAkun() == null ? "INCOMPLETE" : request.getStatusAkun())
                .statusHubungan(request.getStatusHubungan())
                .statusTinggal(request.getStatusTinggal())
                .fotoKtp(request.getFotoKtp())
                .alasanDitolak(request.getAlasanDitolak())
                .build();

        if (request.getWilayah() != null && request.getWilayah().getId() != null) {
            Wilayah wilayah = wilayahRepository.findById(request.getWilayah().getId())
                    .orElseThrow(() -> new RuntimeException("Wilayah tidak ditemukan"));
            user.setWilayah(wilayah);
        }

        return userRepository.save(user);
    }

    public User updateUser(Long id, User request) {

        User user = getUserById(id);

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

        if (request.getWilayah() != null && request.getWilayah().getId() != null) {
            Wilayah wilayah = wilayahRepository.findById(request.getWilayah().getId())
                    .orElseThrow(() -> new RuntimeException("Wilayah tidak ditemukan"));
            user.setWilayah(wilayah);
        } else {
            user.setWilayah(null);
        }

        return userRepository.save(user);
    }

    public User approveUser(Long id) {
        User user = getUserById(id);
        user.setStatusAkun("APPROVED");
        user.setAlasanDitolak(null);
        return userRepository.save(user);
    }

    public User rejectUser(Long id, String alasanDitolak) {
        User user = getUserById(id);
        user.setStatusAkun("REJECTED");
        user.setAlasanDitolak(alasanDitolak);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}