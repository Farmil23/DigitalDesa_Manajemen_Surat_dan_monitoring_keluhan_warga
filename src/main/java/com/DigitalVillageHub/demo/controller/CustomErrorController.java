package com.DigitalVillageHub.demo.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<?> handleError(HttpServletRequest request) {
        String originalUri = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        if (originalUri == null) {
            originalUri = (String) request.getAttribute(RequestDispatcher.FORWARD_REQUEST_URI);
        }
        if (originalUri == null) {
            originalUri = request.getRequestURI();
        }

        // Return JSON 404 for API endpoints
        if (originalUri != null && originalUri.startsWith("/api/")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Endpoint API tidak ditemukan: " + originalUri
            ));
        }

        // Serve React index.html manually
        try {
            org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("static/index.html");
            if (!resource.exists()) {
                resource = new org.springframework.core.io.ClassPathResource("public/index.html");
            }
            if (resource.exists()) {
                String html = org.springframework.util.StreamUtils.copyToString(resource.getInputStream(), java.nio.charset.StandardCharsets.UTF_8);
                return ResponseEntity.ok().contentType(org.springframework.http.MediaType.TEXT_HTML).body(html);
            }
        } catch (java.io.IOException e) {
            // Ignore
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body("<h1>404 Not Found</h1><p>Halaman tidak ditemukan dan file React index.html tidak ada di server.</p>");
    }
}
