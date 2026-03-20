package com.ninesun.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "model_providers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String provider; // 'openai', 'azure', 'anthropic', 'gemini', 'ollama', 'siliconflow'

    @Column(nullable = false, length = 100)
    private String name; // 显示名称

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean enabled = false;

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String config; // JSON 配置参数

    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String models; // 支持的模型列表

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // 提供商类型常量
    public static final String PROVIDER_OPENAI = "openai";
    public static final String PROVIDER_AZURE = "azure";
    public static final String PROVIDER_ANTHROPIC = "anthropic";
    public static final String PROVIDER_GEMINI = "gemini";
    public static final String PROVIDER_OLLAMA = "ollama";
    public static final String PROVIDER_SILICONFLOW = "siliconflow";

    // 检查是否配置了 API Key
    public boolean hasApiKey() {
        if (config == null || config.isEmpty()) {
            return false;
        }
        // 简单检查 config 中是否包含 api_key 且不为空
        return config.contains("api_key") && !config.contains("\"api_key\":\"\"") && !config.contains("\"api_key\": null");
    }
}