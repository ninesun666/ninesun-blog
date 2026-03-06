package com.ninesun.blog.dto;

import java.time.LocalDateTime;

public record CategoryDTO(
    Long id,
    String name,
    String slug,
    String description,
    String icon,
    Integer sortOrder,
    Long articleCount,
    LocalDateTime createdAt
) {}
