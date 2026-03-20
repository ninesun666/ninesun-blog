package com.ninesun.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelProviderDTO {
    private Long id;
    private String provider; // 'openai', 'azure', 'anthropic', etc.
    private String name;
    private String description;
    private Boolean enabled;
    private Integer priority;
    private Map<String, Object> config;
    private List<Map<String, Object>> models;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
