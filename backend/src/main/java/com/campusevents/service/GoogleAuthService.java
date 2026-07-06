package com.campusevents.service;

import com.campusevents.dto.GoogleUserDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Verifies a Google ID token by calling Google's tokeninfo endpoint.
 * No Firebase / OAuth2 client dependency — pure HTTP verification.
 */
@Service
public class GoogleAuthService {

    private static final String GOOGLE_TOKEN_INFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Validates the Google ID token and returns the user's profile.
     *
     * @param idToken  Raw Google ID token from google.accounts.id callback
     * @return GoogleUserDto with name, email, picture, sub
     * @throws RuntimeException if token is invalid or expired
     */
    public GoogleUserDto verifyToken(String idToken) {

        if (idToken == null || idToken.isBlank()) {
            throw new RuntimeException("Google ID token must not be blank.");
        }

        try {
            String url = GOOGLE_TOKEN_INFO_URL + idToken;
            String response = restTemplate.getForObject(url, String.class);

            if (response == null || response.isBlank()) {
                throw new RuntimeException("Empty response from Google tokeninfo endpoint.");
            }

            JsonNode node = objectMapper.readTree(response);

            // Google returns an error_description field for invalid tokens
            if (node.has("error_description")) {
                throw new RuntimeException(
                    "Invalid Google token: " + node.get("error_description").asText()
                );
            }

            if (node.has("error")) {
                throw new RuntimeException(
                    "Google token error: " + node.get("error").asText()
                );
            }

            GoogleUserDto dto = new GoogleUserDto();
            dto.setSub(node.has("sub") ? node.get("sub").asText() : null);
            dto.setName(node.has("name") ? node.get("name").asText() : "");
            dto.setEmail(node.has("email") ? node.get("email").asText() : null);
            dto.setPicture(node.has("picture") ? node.get("picture").asText() : null);
            dto.setEmailVerified(
                node.has("email_verified") && node.get("email_verified").asBoolean()
            );

            if (dto.getEmail() == null || dto.getEmail().isBlank()) {
                throw new RuntimeException(
                    "Google token did not return a valid email address."
                );
            }

            return dto;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to verify Google token: " + e.getMessage(), e
            );
        }
    }
}
