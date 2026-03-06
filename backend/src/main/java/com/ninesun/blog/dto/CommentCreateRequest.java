package com.ninesun.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentCreateRequest(
        @NotNull(message = "Article ID is required")
        Long articleId,
        
        @NotBlank(message = "Content is required")
        String content,
        
        Long parentId,
        
        String nickname,
        String email
) {}
