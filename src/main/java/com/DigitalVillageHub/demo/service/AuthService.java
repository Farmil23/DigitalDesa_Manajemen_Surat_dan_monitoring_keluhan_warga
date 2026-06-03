package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.model.dto.AuthResponse;
import com.DigitalVillageHub.demo.model.dto.LoginRequest;
import com.DigitalVillageHub.demo.model.dto.OnboardingRequestDTO;
import com.DigitalVillageHub.demo.model.dto.RegisterRequest;
import com.DigitalVillageHub.demo.model.entity.Keluarga;
import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.persistence.KeluargaRepository;
import com.DigitalVillageHub.demo.persistence.UserRepository;
import com.DigitalVillageHub.demo.model.enums.StatusAkun;
import com.DigitalVillageHub.demo.model.enums.StatusHubungan;
import com.DigitalVillageHub.demo.model.enums.StatusTinggal;
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
    private final com.DigitalVillageHub.demo.config.JwtUtil jwtUtil;

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
                .statusAkun(StatusAkun.INCOMPLETE)
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

        StatusAkun statusAkun = user.getStatusAkun();
        if (statusAkun == StatusAkun.REJECTED_ADMIN) {
            throw new RuntimeException("Pendaftaran Anda ditolak Admin RT/RW. Silakan hubungi Admin untuk informasi lebih lanjut.");
        }

        String jwtToken = jwtUtil.generateToken(user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .success(true)
                .message("Login Berhasil!")
                .token(jwtToken)
                .user(Map.of(
                        "id", user.getId(),
                        "nik", user.getNik(),
                        "nama_lengkap", user.getNamaLengkap(),
                        "username", user.getUsername(),
                        "role", user.getRole().name(),
                        "status_akun", user.getStatusAkun(),
                        "status_tinggal", user.getStatusTinggal() != null ? user.getStatusTinggal().name() : "TETAP",
                        "rt", user.getRt() != null ? user.getRt() : "",
                        "rw", user.getRw() != null ? user.getRw() : "",
                        "alamat", user.getAlamat() != null ? user.getAlamat() : ""
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
        data.put("status_hubungan", user.getStatusHubungan() != null ? user.getStatusHubungan().getLabel() : null);
        data.put("status_tinggal", user.getStatusTinggal() != null ? user.getStatusTinggal().name() : null);
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
        user.setStatusHubungan(StatusHubungan.fromString(statusHubungan));
        user.setStatusTinggal(StatusTinggal.valueOf(statusTinggal.toUpperCase()));
        user.setAlamat(request.getAlamat().trim()); 
        user.setRt(request.getRt().trim());         
        user.setRw(request.getRw().trim());         
        user.setFotoKtp(storedPath);
        user.setStatusAkun(StatusAkun.PENDING_VERIFICATION);

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
        String contentType = evidence.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("application/pdf"))) {
            throw new RuntimeException("Tipe file tidak didukung. Harap unggah JPEG, PNG, atau PDF.");
        }

        String originalName = evidence.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException("Nama file tidak valid");
        }

        String lowerCaseName = originalName.toLowerCase();
        if (!lowerCaseName.endsWith(".jpg") && !lowerCaseName.endsWith(".jpeg") && !lowerCaseName.endsWith(".png") && !lowerCaseName.endsWith(".pdf")) {
            throw new RuntimeException("Ekstensi file tidak diizinkan. Harap unggah .jpg, .jpeg, .png, atau .pdf.");
        }

        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalName.substring(dotIndex);
        } else {
            throw new RuntimeException("Ekstensi file tidak ditemukan");
        }

        try {
            Path uploadDir = Paths.get("uploads", "ktp");
            Files.createDirectories(uploadDir);

            String fileName = "ktp_" + java.util.UUID.randomUUID().toString() + extension;
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