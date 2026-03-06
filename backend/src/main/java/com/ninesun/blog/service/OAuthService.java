package com.ninesun.blog.service;

import com.ninesun.blog.entity.User;
import com.ninesun.blog.repository.UserRepository;
import com.ninesun.blog.security.JwtTokenProvider;
import com.ninesun.blog.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OAuthService {

    private final WebClient webClient;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${github.client-id:}")
    private String githubClientId;

    @Value("${github.client-secret:}")
    private String githubClientSecret;

    @Value("${app.site-url:http://localhost:8999}")
    private String siteUrl;

    public OAuthService(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.webClient = WebClient.create();
    }

    public String getGithubAuthUrl() {
        String redirectUri = siteUrl + "/auth/github/callback";
        return String.format(
            "https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email",
            githubClientId, redirectUri
        );
    }

    public AuthResponse handleGithubCallback(String code) {
        // Exchange code for access token
        Map<String, String> tokenResponse = webClient.post()
            .uri("https://github.com/login/oauth/access_token")
            .header("Accept", "application/json")
            .bodyValue(Map.of(
                "client_id", githubClientId,
                "client_secret", githubClientSecret,
                "code", code
            ))
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                @SuppressWarnings("unchecked")
                Map<String, String> result = (Map<String, String>) response;
                return result;
            })
            .block();

        if (tokenResponse == null || tokenResponse.containsKey("error")) {
            throw new RuntimeException("Failed to get GitHub access token");
        }

        String accessToken = tokenResponse.get("access_token");

        // Get user info from GitHub
        Map<String, Object> userInfo = webClient.get()
            .uri("https://api.github.com/user")
            .header("Authorization", "Bearer " + accessToken)
            .header("Accept", "application/json")
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        if (userInfo == null) {
            throw new RuntimeException("Failed to get GitHub user info");
        }

        String githubId = String.valueOf(userInfo.get("id"));
        String username = (String) userInfo.get("login");
        String email = (String) userInfo.get("email");
        String avatarUrl = (String) userInfo.get("avatar_url");
        String name = (String) userInfo.get("name");

        // If email is null, try to get primary email
        if (email == null) {
            email = getPrimaryEmail(accessToken);
        }

        // Find or create user
        Optional<User> existingUser = userRepository.findByGithubId(githubId);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update user info
            user.setAvatarUrl(avatarUrl);
            if (name != null) user.setNickname(name);
            user = userRepository.save(user);
        } else {
            // Check if email already exists
            Optional<User> userByEmail = email != null ? userRepository.findByEmail(email) : Optional.empty();
            
            if (userByEmail.isPresent()) {
                // Link GitHub account to existing user
                user = userByEmail.get();
                user.setGithubId(githubId);
                user.setAvatarUrl(avatarUrl);
                user = userRepository.save(user);
            } else {
                // Create new user
                user = new User();
                user.setGithubId(githubId);
                user.setUsername("gh_" + githubId);
                user.setEmail(email != null ? email : "gh_" + githubId + "@github.placeholder");
                user.setNickname(name != null ? name : username);
                user.setAvatarUrl(avatarUrl);
                user.setPassword(UUID.randomUUID().toString()); // Random password for OAuth users
                user.setRole(User.UserRole.USER);
                user = userRepository.save(user);
            }
        }

        // Generate JWT token
        String jwtToken = jwtTokenProvider.generateToken(user.getUsername());

        return new AuthResponse(
            jwtToken,
            "Bearer",
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getNickname(),
            user.getAvatar(),
            user.getRole().name()
        );
    }

    private String getPrimaryEmail(String accessToken) {
        try {
            var emails = webClient.get()
                .uri("https://api.github.com/user/emails")
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept", "application/json")
                .retrieve()
                .bodyToMono(java.util.List.class)
                .block();

            if (emails != null) {
                for (Object obj : emails) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> emailInfo = (Map<String, Object>) obj;
                    Boolean primary = (Boolean) emailInfo.get("primary");
                    if (primary != null && primary) {
                        return (String) emailInfo.get("email");
                    }
                }
            }
        } catch (Exception e) {
            // Ignore email fetch errors
        }
        return null;
    }
}
