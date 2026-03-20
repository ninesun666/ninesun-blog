package com.ninesun.blog.controller;

import com.ninesun.blog.dto.ModelConfigDTO;
import com.ninesun.blog.dto.ModelProviderDTO;
import com.ninesun.blog.service.ModelProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/models")
@RequiredArgsConstructor
public class ModelConfigController {

    private final ModelProviderService modelProviderService;

    // ========== 提供商管理 ==========

    @GetMapping("/providers")
    public ResponseEntity<List<ModelProviderDTO>> getAllProviders() {
        return ResponseEntity.ok(modelProviderService.getAllProviders());
    }

    @GetMapping("/providers/enabled")
    public ResponseEntity<List<ModelProviderDTO>> getEnabledProviders() {
        return ResponseEntity.ok(modelProviderService.getEnabledProviders());
    }

    @GetMapping("/providers/{id}")
    public ResponseEntity<ModelProviderDTO> getProvider(@PathVariable Long id) {
        return ResponseEntity.ok(modelProviderService.getProvider(id));
    }

    @PutMapping("/providers/{id}")
    public ResponseEntity<ModelProviderDTO> updateProvider(
            @PathVariable Long id,
            @RequestBody @Valid ModelProviderDTO dto) {
        return ResponseEntity.ok(modelProviderService.updateProvider(id, dto));
    }

    @PutMapping("/providers/{id}/config")
    public ResponseEntity<ModelProviderDTO> updateProviderConfig(
            @PathVariable Long id,
            @RequestBody Map<String, Object> config) {
        return ResponseEntity.ok(modelProviderService.updateProviderConfig(id, config));
    }

    @PostMapping("/providers/{id}/toggle")
    public ResponseEntity<Void> toggleProvider(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        modelProviderService.toggleProvider(id, enabled);
        return ResponseEntity.ok().build();
    }

    // ========== 模型配置管理 ==========

    @GetMapping("/providers/{providerId}/configs")
    public ResponseEntity<List<ModelConfigDTO>> getConfigsByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(modelProviderService.getConfigsByProvider(providerId));
    }

    @GetMapping("/configs/type/{type}")
    public ResponseEntity<List<ModelConfigDTO>> getConfigsByType(@PathVariable String type) {
        return ResponseEntity.ok(modelProviderService.getConfigsByType(type));
    }

    @GetMapping("/configs/default/{type}")
    public ResponseEntity<ModelConfigDTO> getDefaultConfig(@PathVariable String type) {
        return ResponseEntity.ok(modelProviderService.getDefaultConfig(type));
    }

    @PostMapping("/providers/{providerId}/configs")
    public ResponseEntity<ModelConfigDTO> createConfig(
            @PathVariable Long providerId,
            @RequestBody @Valid ModelConfigDTO dto) {
        return ResponseEntity.ok(modelProviderService.createConfig(providerId, dto));
    }

    @PutMapping("/configs/{configId}")
    public ResponseEntity<ModelConfigDTO> updateConfig(
            @PathVariable Long configId,
            @RequestBody @Valid ModelConfigDTO dto) {
        return ResponseEntity.ok(modelProviderService.updateConfig(configId, dto));
    }

    @DeleteMapping("/configs/{configId}")
    public ResponseEntity<Void> deleteConfig(@PathVariable Long configId) {
        modelProviderService.deleteConfig(configId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/configs/{configId}/set-default")
    public ResponseEntity<Void> setDefaultConfig(@PathVariable Long configId) {
        modelProviderService.setDefaultConfig(configId);
        return ResponseEntity.ok().build();
    }

    // ========== 当前配置查询（用于 AI 服务） ==========

    @GetMapping("/active/chat")
    public ResponseEntity<Map<String, Object>> getActiveChatConfig() {
        var config = modelProviderService.getActiveChatConfig();
        return ResponseEntity.ok(Map.of(
                "provider", config.getProvider(),
                "providerName", config.getProviderName(),
                "modelName", config.getModelName(),
                "displayName", config.getDisplayName(),
                "baseUrl", config.getBaseUrl(),
                "parameters", config.getParameters()
        ));
    }

    @GetMapping("/active/embedding")
    public ResponseEntity<Map<String, Object>> getActiveEmbeddingConfig() {
        var config = modelProviderService.getActiveEmbeddingConfig();
        return ResponseEntity.ok(Map.of(
                "provider", config.getProvider(),
                "providerName", config.getProviderName(),
                "modelName", config.getModelName(),
                "displayName", config.getDisplayName(),
                "baseUrl", config.getBaseUrl(),
                "parameters", config.getParameters()
        ));
    }
}
