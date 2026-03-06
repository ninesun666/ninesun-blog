package com.ninesun.blog.controller;

import com.ninesun.blog.dto.AuthResponse;
import com.ninesun.blog.service.OAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/oauth")
public class OAuthController {

    private final OAuthService oAuthService;

    public OAuthController(OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @GetMapping("/github")
    public ResponseEntity<Map<String, String>> githubAuth() {
        String authUrl = oAuthService.getGithubAuthUrl();
        return ResponseEntity.ok(Map.of("url", authUrl));
    }

    @GetMapping("/github/callback")
    public ResponseEntity<AuthResponse> githubCallback(@RequestParam String code) {
        AuthResponse response = oAuthService.handleGithubCallback(code);
        return ResponseEntity.ok(response);
    }
}
