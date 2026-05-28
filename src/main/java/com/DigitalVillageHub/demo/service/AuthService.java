package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.model.dto.AuthResponse;
import com.DigitalVillageHub.demo.model.dto.LoginRequest;
import com.DigitalVillageHub.demo.model.dto.OnboardingRequestDTO;
import com.DigitalVillageHub.demo.model.dto.RegisterRequest;
import com.DigitalVillageHub.demo.model.entity.Keluarga;
import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.persistence.KeluargaRepository;
import com.DigitalVillageHub.demo.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final KeluargaRepository keluargaRepository;

    public AuthResponse register(RegisterRequest request) {

        if (request.getNik() == null || request.getNik().isBlank()) {
            throw new RuntimeException("NIK wajib diisi");
        }

        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new RuntimeException("Username wajib diisi");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password wajib diisi");
        }

        if (userRepository.existsByNik(request.getNik())) {
            throw new RuntimeException("NIK sudah digunakan");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username sudah digunakan");
        }

        User user = User.builder()
                .nik(request.getNik())
                .namaLengkap(request.getNamaLengkap())
                .username(request.getUsername())
                .password(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()))
                .noHp(request.getNoHp())
                .role(User.Role.WARGA)
                .statusAkun("INCOMPLETE")
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message("Akun warga berhasil didaftarkan! Tunggu persetujuan awal dari Admin RT/RW.")
                .data(Map.of(
                        "id", user.getId(),
                        "nik", user.getNik(),
                        "nama_lengkap", user.getNamaLengkap()
                ))
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findFirstByNikOrUsername(
                        request.getUsername(),
                        request.getUsername()
                )
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        boolean isPasswordValid = BCrypt.checkpw(request.getPassword(), user.getPassword());

        if (!isPasswordValid) {
            throw new RuntimeException("Password salah");
        }

        String statusAkun = user.getStatusAkun() != null ? user.getStatusAkun().trim().toUpperCase() : "";
        if ("REJECTED_ADMIN".equals(statusAkun)) {
            throw new RuntimeException("Pendaftaran Anda ditolak Admin RT/RW. Silakan hubungi Admin untuk informasi lebih lanjut.");
        }

        return AuthResponse.builder()
                .success(true)
                .message("Login Berhasil!")
                .token("DEV-TOKEN-" + user.getId())
                .user(Map.of(
                        "id", user.getId(),
                        "nik", user.getNik(),
                        "nama_lengkap", user.getNamaLengkap(),
                        "username", user.getUsername(),
                        "role", user.getRole().name(),
                        "status_akun", user.getStatusAkun()
                ))
                .build();
    }

    public AuthResponse getProfile(String identifier) {
        User user = resolveUserForOnboarding(identifier);

        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("nik", user.getNik());
        data.put("nama_lengkap", user.getNamaLengkap());
        data.put("username", user.getUsername());
        data.put("role", user.getRole() != null ? user.getRole().name() : null);
        data.put("status_akun", user.getStatusAkun());
        data.put("alasan_ditolak", user.getAlasanDitolak());
        data.put("no_kk", user.getNoKk());
        data.put("status_hubungan", user.getStatusHubungan());
        data.put("status_tinggal", user.getStatusTinggal());
        data.put("alamat", user.getAlamat()); 
        data.put("rt", user.getRt());         
        data.put("rw", user.getRw());         
        data.put("foto_ktp", user.getFotoKtp());

        return AuthResponse.builder()
                .success(true)
                .message("Profil berhasil diambil")
                .data(data)
                .build();
    }

    @Transactional
    public AuthResponse submitOnboarding(String username, OnboardingRequestDTO request) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("Tidak terautentikasi. Silakan login ulang.");
        }

        if (request == null) {
            throw new RuntimeException("Data onboarding tidak ditemukan");
        }

        String noKk = request.getNo_kk();
        if (noKk == null || noKk.isBlank()) {
            throw new RuntimeException("Nomor KK wajib diisi");
        }
        noKk = noKk.trim();
        if (noKk.length() != 16 || !noKk.matches("\\d{16}")) {
            throw new RuntimeException("Nomor KK harus tepat 16 digit angka");
        }

        if (request.getAlamat() == null || request.getAlamat().isBlank()) {
            throw new RuntimeException("Alamat rumah wajib diisi");
        }
        if (request.getRt() == null || request.getRt().isBlank()) {
            throw new RuntimeException("Kolom RT wajib diisi");
        }
        if (request.getRw() == null || request.getRw().isBlank()) {
            throw new RuntimeException("Kolom RW wajib diisi");
        }

        String statusHubungan = request.getStatus_hubungan();
        if (statusHubungan == null || statusHubungan.isBlank()) {
            throw new RuntimeException("Status hubungan wajib diisi");
        }

        String statusTinggal = request.getStatus_tinggal();
        if (statusTinggal == null || statusTinggal.isBlank()) {
            throw new RuntimeException("Status tinggal wajib diisi");
        }

        MultipartFile evidence = request.resolveEvidence();
        if (evidence == null || evidence.isEmpty()) {
            throw new RuntimeException("Silakan unggah berkas KTP/KK terlebih dahulu");
        }

        User user = resolveUserForOnboarding(username);

        ensureKeluargaExists(noKk);

        String storedPath = storeKtpEvidence(user.getNik(), evidence);

        user.setNoKk(noKk);
        user.setStatusHubungan(statusHubungan);
        user.setStatusTinggal(statusTinggal);
        user.setAlamat(request.getAlamat().trim()); 
        user.setRt(request.getRt().trim());         
        user.setRw(request.getRw().trim());         
        user.setFotoKtp(storedPath);
        user.setStatusAkun("PENDING_VERIFICATION");

        userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message("Data onboarding berhasil dikirim. Menunggu verifikasi Admin RT/RW.")
                .data(Map.of(
                        "nik", user.getNik(),
                        "username", user.getUsername(),
                        "status_akun", user.getStatusAkun(),
                        "no_kk", user.getNoKk(),
                        "alamat", user.getAlamat(),
                        "rt", user.getRt(),
                        "rw", user.getRw(),
                        "foto_ktp", user.getFotoKtp()
                ))
                .build();
    }

    private void ensureKeluargaExists(String noKk) {
        if (keluargaRepository.existsById(noKk)) {
            return;
        }

        try {
            keluargaRepository.save(Keluarga.builder()
                    .noKk(noKk)
                    .alamatKk(null)
                    .build());
        } catch (DataIntegrityViolationException e) {
            if (!keluargaRepository.existsById(noKk)) {
                throw new RuntimeException("Nomor KK tidak ditemukan/valid. Silakan periksa kembali nomor KK.");
            }
        }
    }

    private User resolveUserForOnboarding(String identifier) {
        var byNikOrUsername = userRepository.findFirstByNikOrUsername(identifier, identifier);
        if (byNikOrUsername.isPresent()) {
            return byNikOrUsername.get();
        }

        try {
            Long userId = Long.parseLong(identifier);
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
        } catch (NumberFormatException e) {
            throw new RuntimeException("User tidak ditemukan");
        }
    }

    private String storeKtpEvidence(String nik, MultipartFile evidence) {
        try {
            Path uploadDir = Paths.get("uploads", "ktp");
            Files.createDirectories(uploadDir);

            String originalName = evidence.getOriginalFilename();
            if (originalName == null || originalName.isBlank()) {
                originalName = "evidence";
            }

            String safeOriginal = originalName
                    .replace("\\", "_")
                    .replace("/", "_")
                    .replace(":", "_");

            String fileName = nik + "_" + System.currentTimeMillis() + "_" + safeOriginal;
            Path target = uploadDir.resolve(fileName);

            try (var in = evidence.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return "uploads/ktp/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Gagal menyimpan berkas KTP/KK");
        }
    }
}