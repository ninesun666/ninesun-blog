package com.ninesun.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(
    @NotBlank(message = "名称不能为空")
    @Size(max = 50, message = "名称最多50字符")
    String name,
    
    String slug,
    
    @Size(max = 500, message = "描述最多500字符")
    String description,
    
    String icon,
    
    Integer sortOrder
) {}
