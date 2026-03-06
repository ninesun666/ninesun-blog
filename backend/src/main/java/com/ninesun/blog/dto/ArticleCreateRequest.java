package com.ninesun.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record ArticleCreateRequest(
    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题最多200字符")
    String title,
    
    String slug,
    
    @Size(max = 500, message = "摘要最多500字符")
    String summary,
    
    @NotBlank(message = "内容不能为空")
    String content,
    
    String coverImage,
    
    Long categoryId,
    
    Set<Long> tagIds,
    
    String status,
    
    Boolean allowComment
) {}
