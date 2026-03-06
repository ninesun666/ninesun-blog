package com.ninesun.blog.dto;

import java.time.LocalDateTime;

public record TagDTO(
    Long id,
    String name,
    String slug,
    Long articleCount,
    LocalDateTime createdAt
) {}
