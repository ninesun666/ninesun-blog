package com.ninesun.blog.dto;

import java.time.LocalDateTime;
import java.util.Set;

public record ArticleDTO(
    Long id,
    String title,
    String slug,
    String summary,
    String content,
    String coverImage,
    CategoryDTO category,
    Set<TagDTO> tags,
    Integer viewCount,
    Integer likeCount,
    Integer commentCount,
    String status,
    Boolean allowComment,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public record CategoryDTO(Long id, String name, String slug) {}
    public record TagDTO(Long id, String name, String slug) {}
}
