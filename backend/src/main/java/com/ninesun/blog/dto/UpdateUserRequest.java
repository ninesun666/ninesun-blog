package com.ninesun.blog.dto;

import com.ninesun.blog.entity.User;

public record UpdateUserRequest(
        String nickname,
        String avatar,
        User.UserRole role,
        Boolean enabled,
        String currentPassword,
        String newPassword
) {
}
