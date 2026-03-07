package com.ninesun.blog.controller;

import com.ninesun.blog.dto.AuthResponse;
import com.ninesun.blog.dto.LoginRequest;
import com.ninesun.blog.dto.RegisterRequest;
import com.ninesun.blog.dto.UpdateUserRequest;
import com.ninesun.blog.dto.UserDTO;
import com.ninesun.blog.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/password")
    public ResponseEntity<UserDTO> changePassword(@RequestBody ChangePasswordRequest request) {
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(userService.updateUser(user.getId(), new UpdateUserRequest(
                null, null, null, null, request.currentPassword(), request.newPassword()
        )));
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {}

    private final com.ninesun.blog.repository.UserRepository userRepository;
}
