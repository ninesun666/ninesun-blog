package com.ninesun.blog.controller;

import com.ninesun.blog.dto.SiteSettingsDTO;
import com.ninesun.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 公开的站点设置接口
 * 用于前端页脚展示站点信息
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final UserService userService;

    /**
     * 公开的站点设置接口（无需认证）
     * 用于前端页脚展示
     */
    @GetMapping("/public")
    public ResponseEntity<SiteSettingsDTO> getPublicSiteSettings() {
        return ResponseEntity.ok(userService.getSiteSettings());
    }
}
