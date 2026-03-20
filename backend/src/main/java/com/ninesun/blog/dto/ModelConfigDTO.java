package com.ninesun.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelConfigDTO {
    private Long id;
    private Long providerId;
    private String providerName;
    private String modelName;
    private String displayName;
    private String type; // 'chat' | 'embedding' | 'tts' | 'stt'
    private Boolean enabled;
    private Boolean isDefault;
    private Map<String, Object> parameters;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
