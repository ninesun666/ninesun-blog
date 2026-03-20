package com.ninesun.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "model_configs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"provider_id", "model_name", "type"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private ModelProvider provider;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName; // 模型标识名

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName; // 显示名称

    @Column(nullable = false, length = 20)
    private String type = "chat"; // 'chat' | 'embedding' | 'tts' | 'stt'

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String parameters; // 模型参数（temperature, max_tokens等）

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // 模型类型常量
    public static final String TYPE_CHAT = "chat";
    public static final String TYPE_EMBEDDING = "embedding";
    public static final String TYPE_TTS = "tts";
    public static final String TYPE_STT = "stt";

    // 获取完整模型标识（用于 API 调用）
    public String getFullModelName() {
        return modelName;
    }
}
