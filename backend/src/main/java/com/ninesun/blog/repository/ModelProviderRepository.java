package com.ninesun.blog.repository;

import com.ninesun.blog.entity.ModelProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelProviderRepository extends JpaRepository<ModelProvider, Long> {

    Optional<ModelProvider> findByProvider(String provider);

    List<ModelProvider> findByEnabledTrueOrderByPriorityAsc();

    boolean existsByProvider(String provider);
}
