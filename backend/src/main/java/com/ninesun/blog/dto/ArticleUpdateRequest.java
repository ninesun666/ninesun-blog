package com.ninesun.blog.dto;

import jakarta.validation.constraints.Size;
import java.util.Set;

public record ArticleUpdateRequest(
    @Size(max = 200, message = "标题最多200字符")
    String title,
    
    String slug,
    
    @Size(max = 500, message = "摘要最多500字符")
    String summary,
    
    String content,
    
    String coverImage,
    
    Long categoryId,
    
    Set<Long> tagIds,
    
    String status,
    
    Boolean allowComment
) {}
