package com.DigitalVillageHub.demo.config;

import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.persistence.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DevTokenAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Jika tidak ada header Authorization, lanjutkan saja (endpoint publik akan lolos, sisanya diblokir oleh SecurityConfig)
        if (authHeader == null || !authHeader.startsWith("Bearer DEV-TOKEN-")) {
            filterChain.doFilter(request, response);
            return;
        }

        String idPart = authHeader.substring("Bearer DEV-TOKEN-".length());
        Long userId;
        try {
            userId = Long.parseLong(idPart);
        } catch (NumberFormatException e) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        User user = optionalUser.get();
        String springRole = "ROLE_" + user.getRole().name(); // ROLE_WARGA atau ROLE_ADMIN

        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                String.valueOf(user.getId()),    // principal di-set sebagai userId (String)
                null,                            // tidak ada credentials
                List.of(new SimpleGrantedAuthority(springRole))
            );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }
}
