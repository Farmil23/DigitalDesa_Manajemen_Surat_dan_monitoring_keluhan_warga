package com.DigitalVillageHub.demo.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private Boolean success;
    private String message;
    private String token;
    private Object user;
    private Object data;
}