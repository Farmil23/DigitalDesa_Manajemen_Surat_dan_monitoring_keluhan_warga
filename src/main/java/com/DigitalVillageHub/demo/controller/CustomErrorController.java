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
    public Object handleError(HttpServletRequest request) {
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
                    "message", "Endpoint tidak ditemukan"
            ));
        }

        // Forward all frontend routes (like /dashboard-warga, /login, dll) to React's index.html
        return "forward:/index.html";
    }
}
