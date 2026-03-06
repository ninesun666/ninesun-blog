package com.ninesun.blog.dto;

import com.ninesun.blog.entity.User;

import java.time.LocalDateTime;

public record UserDTO(
        Long id,
        String username,
        String email,
        String nickname,
        String avatar,
        String role,
        Boolean enabled,
        LocalDateTime createdAt
) {
    public static UserDTO from(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getNickname(),
                user.getAvatar(),
                user.getRole().name(),
                user.getEnabled(),
                user.getCreatedAt()
        );
    }
}
