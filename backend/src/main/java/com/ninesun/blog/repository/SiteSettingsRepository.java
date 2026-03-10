package com.ninesun.blog.repository;

import com.ninesun.blog.entity.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {
    
    /**
     * 获取站点设置（单例模式）
     */
    default SiteSettings getOrCreate() {
        return findById(1L).orElseGet(() -> save(SiteSettings.defaultSettings()));
    }
}
