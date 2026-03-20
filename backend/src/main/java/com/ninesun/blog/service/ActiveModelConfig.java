package com.ninesun.blog.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 当前激活的模型配置
 * 用于动态获取 AI 服务所需的配置信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveModelConfig {
    private String provider; // 'openai', 'azure', etc.
    private String providerName;
    private String modelName;
    private String displayName;
    private String type; // 'chat' | 'embedding' | 'tts' | 'stt'
    
    // API 配置
    private String apiKey;
    private String baseUrl;
    private String endpoint; // Azure 专用
    private String apiVersion; // Azure 专用
    
    // 模型参数
    private Map<String, Object> parameters;
    
    // 便捷方法
    public String getFullApiUrl() {
        if ("azure".equals(provider) && endpoint != null) {
            return endpoint + "/openai/deployments/" + modelName + "/chat/completions?api-version=" + apiVersion;
        }
        return baseUrl;
    }
    
    public Double getTemperature() {
        if (parameters != null && parameters.containsKey("temperature")) {
            return Double.valueOf(parameters.get("temperature").toString());
        }
        return 0.7;
    }
    
    public Integer getMaxTokens() {
        if (parameters != null && parameters.containsKey("max_tokens")) {
            return Integer.valueOf(parameters.get("max_tokens").toString());
        }
        return 2000;
    }
    
    public Double getTopP() {
        if (parameters != null && parameters.containsKey("top_p")) {
            return Double.valueOf(parameters.get("top_p").toString());
        }
        return 1.0;
    }
}
