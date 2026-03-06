package com.ninesun.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TagCreateRequest(
    @NotBlank(message = "名称不能为空")
    @Size(max = 50, message = "名称最多50字符")
    String name,
    
    String slug
) {}
