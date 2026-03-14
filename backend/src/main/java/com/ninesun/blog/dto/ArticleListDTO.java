package com.ninesun.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 文章列表简化 DTO（用于侧边栏目录）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleListDTO {
    private Long id;
    private String title;
    private String slug;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private LocalDate createdAt;
}
