package com.ninesun.blog.dto;

import com.ninesun.blog.entity.User;

public record AuthResponse(
        String token,
        String tokenType,
        Long id,
        String username,
        String email,
        String nickname,
        String avatar,
        String role
) {
    public static AuthResponse of(String token, User user) {
        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getNickname(),
                user.getAvatar(),
                user.getRole().name()
        );
    }
}
