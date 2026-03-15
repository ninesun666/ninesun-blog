package com.ninesun.blog.dto;

import java.time.LocalDateTime;

/**
 * Twitter 账号信息 DTO
 */
public record TwitterAccountDTO(
    boolean connected,
    String username,
    String platformUserId,
    LocalDateTime connectedAt
) {
    public static TwitterAccountDTO notConnected() {
        return new TwitterAccountDTO(false, null, null, null);
    }
}
