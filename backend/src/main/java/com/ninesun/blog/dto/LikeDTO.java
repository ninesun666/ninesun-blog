package com.ninesun.blog.dto;

public record LikeDTO(
        Long articleId,
        long count,
        boolean liked
) {}
