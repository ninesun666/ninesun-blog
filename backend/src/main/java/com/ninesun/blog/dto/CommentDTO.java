package com.ninesun.blog.dto;

import com.ninesun.blog.entity.Comment;

import java.time.LocalDateTime;
import java.util.List;

public record CommentDTO(
        Long id,
        Long articleId,
        String content,
        Long parentId,
        Long userId,
        String nickname,
        String email,
        String status,
        LocalDateTime createdAt,
        List<CommentDTO> replies
) {
    public static CommentDTO from(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getArticle().getId(),
                comment.getContent(),
                comment.getParent() != null ? comment.getParent().getId() : null,
                comment.getUser() != null ? comment.getUser().getId() : null,
                comment.getNickname(),
                comment.getEmail(),
                comment.getStatus().name(),
                comment.getCreatedAt(),
                null
        );
    }
}
