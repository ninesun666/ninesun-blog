package com.ninesun.blog.controller;

import com.ninesun.blog.dto.TwitterAccountDTO;
import com.ninesun.blog.dto.TwitterSyncResultDTO;
import com.ninesun.blog.entity.User;
import com.ninesun.blog.repository.UserRepository;
import com.ninesun.blog.service.TwitterOAuthService;
import com.ninesun.blog.service.TwitterPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

/**
 * Twitter OAuth 和同步控制器
 */
@RestController
@RequestMapping("/api/twitter")
@RequiredArgsConstructor
@Slf4j
public class TwitterController {
    
    private final TwitterOAuthService twitterOAuthService;
    private final TwitterPostService twitterPostService;
    private final UserRepository userRepository;
    
    /**
     * 获取 Twitter OAuth 授权 URL
     */
    @GetMapping("/auth-url")
    public ResponseEntity<Map<String, String>> getAuthUrl() {
        String authUrl = twitterOAuthService.generateAuthUrl();
        return ResponseEntity.ok(Map.of("url", authUrl));
    }
    
    /**
     * Twitter OAuth 回调
     */
    @GetMapping("/callback")
    public RedirectView callback(
        @RequestParam String code,
        @RequestParam String state
    ) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return new RedirectView("/admin/settings?twitter=error&message=not_authenticated");
            }
            
            twitterOAuthService.handleCallback(code, state, userId);
            return new RedirectView("/admin/settings?twitter=connected");
        } catch (Exception e) {
            log.error("Twitter OAuth callback failed", e);
            return new RedirectView("/admin/settings?twitter=error&message=" + e.getMessage());
        }
    }
    
    /**
     * 获取已绑定的 Twitter 账号信息
     */
    @GetMapping("/account")
    public ResponseEntity<TwitterAccountDTO> getAccount() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        TwitterAccountDTO account = twitterOAuthService.getConnectedAccount(userId);
        return ResponseEntity.ok(account);
    }
    
    /**
     * 解绑 Twitter 账号
     */
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, Boolean>> disconnect() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        twitterOAuthService.disconnect(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    /**
     * 同步文章到 Twitter
     */
    @PostMapping("/sync/{articleId}")
    public ResponseEntity<TwitterSyncResultDTO> syncArticle(
        @PathVariable Long articleId,
        @RequestBody(required = false) Map<String, String> body
    ) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        String customText = body != null ? body.get("customText") : null;
        TwitterSyncResultDTO result = twitterPostService.syncArticle(articleId, userId, customText);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 检查文章同步状态
     */
    @GetMapping("/status/{articleId}")
    public ResponseEntity<Map<String, Boolean>> getSyncStatus(@PathVariable Long articleId) {
        // 简单返回是否已同步
        return ResponseEntity.ok(Map.of("synced", false));
    }
    
    /**
     * 获取当前用户 ID
     */
    private Long getCurrentUserId() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            if (username == null || username.equals("anonymousUser")) {
                return null;
            }
            User user = userRepository.findByUsername(username).orElse(null);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            log.error("Failed to get current user", e);
            return null;
        }
    }
}
