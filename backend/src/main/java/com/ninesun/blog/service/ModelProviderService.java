package com.ninesun.blog.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ninesun.blog.dto.ModelConfigDTO;
import com.ninesun.blog.dto.ModelProviderDTO;
import com.ninesun.blog.entity.ModelConfig;
import com.ninesun.blog.entity.ModelProvider;
import com.ninesun.blog.repository.ModelConfigRepository;
import com.ninesun.blog.repository.ModelProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModelProviderService {

    private final ModelProviderRepository providerRepository;
    private final ModelConfigRepository configRepository;
    private final ObjectMapper objectMapper;

    // ========== 提供商管理 ==========

    public List<ModelProviderDTO> getAllProviders() {
        return providerRepository.findAll().stream()
                .map(this::convertToProviderDTO)
                .collect(Collectors.toList());
    }

    public List<ModelProviderDTO> getEnabledProviders() {
        return providerRepository.findByEnabledTrueOrderByPriorityAsc().stream()
                .map(this::convertToProviderDTO)
                .collect(Collectors.toList());
    }

    public ModelProviderDTO getProvider(Long id) {
        ModelProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("提供商不存在"));
        return convertToProviderDTO(provider);
    }

    public ModelProviderDTO getProviderByName(String provider) {
        ModelProvider modelProvider = providerRepository.findByProvider(provider)
                .orElseThrow(() -> new IllegalArgumentException("提供商不存在"));
        return convertToProviderDTO(modelProvider);
    }

    @Transactional
    public ModelProviderDTO updateProvider(Long id, ModelProviderDTO dto) {
        ModelProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("提供商不存在"));

        provider.setName(dto.getName());
        provider.setDescription(dto.getDescription());
        provider.setEnabled(dto.getEnabled());
        provider.setPriority(dto.getPriority());
        
        if (dto.getConfig() != null) {
            try {
                provider.setConfig(objectMapper.writeValueAsString(dto.getConfig()));
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("配置格式错误");
            }
        }

        ModelProvider saved = providerRepository.save(provider);
        return convertToProviderDTO(saved);
    }

    @Transactional
    public ModelProviderDTO updateProviderConfig(Long id, Map<String, Object> config) {
        ModelProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("提供商不存在"));

        try {
            provider.setConfig(objectMapper.writeValueAsString(config));
            ModelProvider saved = providerRepository.save(provider);
            return convertToProviderDTO(saved);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("配置格式错误");
        }
    }

    @Transactional
    public void toggleProvider(Long id, boolean enabled) {
        ModelProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("提供商不存在"));
        provider.setEnabled(enabled);
        providerRepository.save(provider);
    }

    // ========== 模型配置管理 ==========

    public List<ModelConfigDTO> getConfigsByProvider(Long providerId) {
        return configRepository.findByProviderId(providerId).stream()
                .map(this::convertToConfigDTO)
                .collect(Collectors.toList());
    }

    public List<ModelConfigDTO> getConfigsByType(String type) {
        return configRepository.findByTypeAndEnabledTrue(type).stream()
                .map(this::convertToConfigDTO)
                .collect(Collectors.toList());
    }

    public ModelConfigDTO getDefaultConfig(String type) {
        ModelConfig config = configRepository.findByIsDefaultTrueAndType(type)
                .orElseThrow(() -> new IllegalArgumentException("没有默认的 " + type + " 模型配置"));
        return convertToConfigDTO(config);
    }

    @Transactional
    public ModelConfigDTO createConfig(Long providerId, ModelConfigDTO dto) {
        ModelProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("提供商不存在"));

        // 检查是否已存在
        if (configRepository.existsByProviderIdAndModelNameAndType(
                providerId, dto.getModelName(), dto.getType())) {
            throw new IllegalArgumentException("该模型配置已存在");
        }

        ModelConfig config = new ModelConfig();
        config.setProvider(provider);
        config.setModelName(dto.getModelName());
        config.setDisplayName(dto.getDisplayName());
        config.setType(dto.getType());
        config.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);
        
        if (dto.getIsDefault() != null && dto.getIsDefault()) {
            // 取消同类型的其他默认配置
            clearDefaultConfig(dto.getType());
            config.setIsDefault(true);
        }

        try {
            config.setParameters(objectMapper.writeValueAsString(dto.getParameters()));
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("参数格式错误");
        }

        ModelConfig saved = configRepository.save(config);
        return convertToConfigDTO(saved);
    }

    @Transactional
    public ModelConfigDTO updateConfig(Long configId, ModelConfigDTO dto) {
        ModelConfig config = configRepository.findById(configId)
                .orElseThrow(() -> new IllegalArgumentException("配置不存在"));

        config.setDisplayName(dto.getDisplayName());
        config.setEnabled(dto.getEnabled());

        if (dto.getIsDefault() != null && dto.getIsDefault() && !config.getIsDefault()) {
            clearDefaultConfig(config.getType());
            config.setIsDefault(true);
        } else if (dto.getIsDefault() != null) {
            config.setIsDefault(dto.getIsDefault());
        }

        if (dto.getParameters() != null) {
            try {
                config.setParameters(objectMapper.writeValueAsString(dto.getParameters()));
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("参数格式错误");
            }
        }

        ModelConfig saved = configRepository.save(config);
        return convertToConfigDTO(saved);
    }

    @Transactional
    public void deleteConfig(Long configId) {
        configRepository.deleteById(configId);
    }

    @Transactional
    public void setDefaultConfig(Long configId) {
        ModelConfig config = configRepository.findById(configId)
                .orElseThrow(() -> new IllegalArgumentException("配置不存在"));

        clearDefaultConfig(config.getType());
        config.setIsDefault(true);
        configRepository.save(config);
    }

    // ========== 获取当前使用的模型配置 ==========

    public ActiveModelConfig getActiveChatConfig() {
        return getActiveConfig(ModelConfig.TYPE_CHAT);
    }

    public ActiveModelConfig getActiveEmbeddingConfig() {
        return getActiveConfig(ModelConfig.TYPE_EMBEDDING);
    }

    private ActiveModelConfig getActiveConfig(String type) {
        // 1. 先找默认配置
        Optional<ModelConfig> defaultConfig = configRepository.findByIsDefaultTrueAndType(type);
        
        if (defaultConfig.isPresent() && defaultConfig.get().getEnabled()) {
            ModelConfig config = defaultConfig.get();
            ModelProvider provider = config.getProvider();
            if (provider.getEnabled()) {
                return buildActiveConfig(provider, config);
            }
        }

        // 2. 找第一个启用的配置
        List<ModelConfig> configs = configRepository.findByTypeAndEnabledTrue(type);
        for (ModelConfig config : configs) {
            ModelProvider provider = config.getProvider();
            if (provider.getEnabled()) {
                return buildActiveConfig(provider, config);
            }
        }

        throw new IllegalStateException("没有可用的 " + type + " 模型配置");
    }

    private ActiveModelConfig buildActiveConfig(ModelProvider provider, ModelConfig config) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(provider.getConfig(), Map.class);
            Map<String, Object> paramsMap = objectMapper.readValue(config.getParameters(), Map.class);

            return ActiveModelConfig.builder()
                    .provider(provider.getProvider())
                    .providerName(provider.getName())
                    .modelName(config.getModelName())
                    .displayName(config.getDisplayName())
                    .type(config.getType())
                    .apiKey((String) configMap.get("api_key"))
                    .baseUrl((String) configMap.get("base_url"))
                    .endpoint((String) configMap.get("endpoint"))
                    .apiVersion((String) configMap.get("api_version"))
                    .parameters(paramsMap)
                    .build();
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("解析配置失败");
        }
    }

    // ========== 辅助方法 ==========

    private void clearDefaultConfig(String type) {
        List<ModelConfig> defaults = configRepository.findByTypeAndIsDefaultTrue(type);
        for (ModelConfig c : defaults) {
            c.setIsDefault(false);
        }
        configRepository.saveAll(defaults);
    }

    private ModelProviderDTO convertToProviderDTO(ModelProvider provider) {
        try {
            Map<String, Object> config = provider.getConfig() != null 
                    ? objectMapper.readValue(provider.getConfig(), Map.class) 
                    : null;
            List<Map<String, Object>> models = provider.getModels() != null
                    ? objectMapper.readValue(provider.getModels(), List.class)
                    : null;

            return ModelProviderDTO.builder()
                    .id(provider.getId())
                    .provider(provider.getProvider())
                    .name(provider.getName())
                    .description(provider.getDescription())
                    .enabled(provider.getEnabled())
                    .priority(provider.getPriority())
                    .config(config)
                    .models(models)
                    .createdAt(provider.getCreatedAt())
                    .updatedAt(provider.getUpdatedAt())
                    .build();
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("解析提供商配置失败");
        }
    }

    private ModelConfigDTO convertToConfigDTO(ModelConfig config) {
        try {
            Map<String, Object> parameters = config.getParameters() != null
                    ? objectMapper.readValue(config.getParameters(), Map.class)
                    : null;

            return ModelConfigDTO.builder()
                    .id(config.getId())
                    .providerId(config.getProvider().getId())
                    .providerName(config.getProvider().getName())
                    .modelName(config.getModelName())
                    .displayName(config.getDisplayName())
                    .type(config.getType())
                    .enabled(config.getEnabled())
                    .isDefault(config.getIsDefault())
                    .parameters(parameters)
                    .createdAt(config.getCreatedAt())
                    .updatedAt(config.getUpdatedAt())
                    .build();
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("解析模型配置失败");
        }
    }
}
