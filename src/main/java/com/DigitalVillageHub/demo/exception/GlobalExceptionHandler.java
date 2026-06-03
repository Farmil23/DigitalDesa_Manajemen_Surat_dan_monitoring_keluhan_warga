package com.DigitalVillageHub.demo.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxUploadSize(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(Map.of(
                "success", false,
                "message", "Ukuran file terlalu besar. Silakan unggah gambar maksimal 10MB."
        ));
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<?> handleMultipart(MultipartException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Gagal memproses upload berkas. Pastikan format file benar dan coba lagi."
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", e.getMessage() != null ? e.getMessage() : "Terjadi kesalahan pada server"
        ));
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<?> handleNoResourceFound(org.springframework.web.servlet.resource.NoResourceFoundException e, jakarta.servlet.http.HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri != null && uri.startsWith("/api/")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Endpoint API tidak ditemukan: " + uri
            ));
        }

        try {
            org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("static/index.html");
            if (!resource.exists()) {
                resource = new org.springframework.core.io.ClassPathResource("public/index.html");
            }
            if (resource.exists()) {
                String html = org.springframework.util.StreamUtils.copyToString(resource.getInputStream(), java.nio.charset.StandardCharsets.UTF_8);
                return ResponseEntity.ok().contentType(org.springframework.http.MediaType.TEXT_HTML).body(html);
            }
        } catch (java.io.IOException ex) {
            // Ignore
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Route tidak ditemukan: " + uri
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        log.error("Unhandled exception", e);

        String detail = e.getClass().getSimpleName();
        if (e.getMessage() != null && !e.getMessage().isBlank()) {
            detail = detail + ": " + e.getMessage();
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Kesalahan sistem internal",
                "detail", detail
        ));
    }
}
