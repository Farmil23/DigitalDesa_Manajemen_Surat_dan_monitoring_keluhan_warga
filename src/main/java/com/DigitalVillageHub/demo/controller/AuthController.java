package com.DigitalVillageHub.demo.controller;

import com.DigitalVillageHub.demo.model.dto.LoginRequest;
import com.DigitalVillageHub.demo.model.dto.OnboardingRequestDTO;
import com.DigitalVillageHub.demo.model.dto.RegisterRequest;
import com.DigitalVillageHub.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // <-- Diperluas agar aman di kedua port
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(
            Authentication authentication,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        String username = resolveUsername(authentication, authorization);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Tidak terautentikasi. Silakan login ulang."
            ));
        }

        return ResponseEntity.ok(authService.getProfile(username));
    }

    @PostMapping(value = "/onboarding", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitOnboarding(
            Authentication authentication,
            @ModelAttribute OnboardingRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        String username = resolveUsername(authentication, authorization);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Tidak terautentikasi. Silakan login ulang."
            ));
        }

        return ResponseEntity.ok(authService.submitOnboarding(username, request));
    }

    private String resolveUsername(Authentication authentication, String authorization) {
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            return authentication.getName();
        }

        Long userId = parseDevTokenUserId(authorization);
        if (userId == null) {
            return null;
        }

        return String.valueOf(userId);
    }

    private Long parseDevTokenUserId(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return null;
        }
        String trimmed = authorization.trim();
        if (!trimmed.startsWith("Bearer ")) {
            return null;
        }
        String token = trimmed.substring("Bearer ".length());
        if (!token.startsWith("DEV-TOKEN-")) {
            return null;
        }
        String idPart = token.substring("DEV-TOKEN-".length());
        try {
            return Long.parseLong(idPart);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}