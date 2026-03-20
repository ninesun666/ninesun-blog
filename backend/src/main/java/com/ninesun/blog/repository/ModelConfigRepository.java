package com.ninesun.blog.repository;

import com.ninesun.blog.entity.ModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelConfigRepository extends JpaRepository<ModelConfig, Long> {

    List<ModelConfig> findByProviderId(Long providerId);

    List<ModelConfig> findByProviderIdAndType(Long providerId, String type);

    List<ModelConfig> findByProviderIdAndEnabledTrue(Long providerId);

    List<ModelConfig> findByTypeAndEnabledTrue(String type);

    Optional<ModelConfig> findByProviderIdAndModelNameAndType(Long providerId, String modelName, String type);

    Optional<ModelConfig> findByIsDefaultTrueAndType(String type);

    List<ModelConfig> findByTypeAndIsDefaultTrue(String type);

    boolean existsByProviderIdAndModelNameAndType(Long providerId, String modelName, String type);
}
