package com.campusevents.config;

import com.campusevents.security.AuthTokenFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig — updated to permit the new OTP endpoints.
 * All other rules are preserved.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final AuthTokenFilter authTokenFilter;

    public SecurityConfig(AuthTokenFilter authTokenFilter) {
        this.authTokenFilter = authTokenFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth

                // ── Swagger ────────────────────────────────────────────────
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()

                // ── Static files (certificate PDFs, event images, QR codes)
                .requestMatchers("/uploads/**").permitAll()

                // ── Public auth endpoints ──────────────────────────────────
                .requestMatchers(
                    "/api/auth/signin",
                    "/api/auth/signup",
                    "/api/auth/google",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/auth/send-otp",       // Feature 1
                    "/api/auth/verify-otp",      // Feature 1
                    "/api/auth/resend-otp"       // Feature 1
                ).permitAll()

                // ── Public event listing & dashboard stats ─────────────
                .requestMatchers(
                    "/api/dashboard/public",
                    "/api/events/approved",
                    "/api/events/search",
                    "/api/events/filter",
                    "/api/events/categories",
                    "/api/events/category/**",
                    "/api/events/departments"
                ).permitAll()

                // ── Everything else requires a valid JWT ───────────────────
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                authTokenFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
