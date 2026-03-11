package com.ninesun.blog.config;

import com.ninesun.blog.service.VisitLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class VisitLogInterceptor implements HandlerInterceptor {
    
    private final VisitLogService visitLogService;
    
    // 排除的路径模式
    private static final Set<String> EXCLUDED_PATHS = Set.of(
        "/api/admin",
        "/api/auth",
        "/api/health",
        "/favicon.ico",
        "/robots.txt"
    );
    
    // 静态资源模式
    private static final Pattern STATIC_RESOURCES = Pattern.compile(
        ".*\\.(css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$"
    );
    
    // 爬虫UA关键词
    private static final Set<String> BOT_KEYWORDS = Set.of(
        "bot", "crawler", "spider", "scraper", "crawling",
        "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
        "yandexbot", "sogou", "exabot", "facebot", "facebookexternalhit"
    );
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                 Object handler, Exception ex) {
        String path = request.getRequestURI();
        
        // 排除不需要记录的路径
        if (shouldExclude(path, request.getHeader("User-Agent"))) {
            return;
        }
        
        // 获取真实IP
        String ip = getClientIp(request);
        
        // 获取当前登录用户ID
        Long userId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            try {
                userId = Long.parseLong(auth.getName());
            } catch (NumberFormatException ignored) {
                // 用户名不是数字ID，忽略
            }
        }
        
        // 异步记录访问
        Long articleId = extractArticleId(path);
        visitLogService.logVisit(ip, request.getHeader("User-Agent"), path, articleId, userId);
    }
    
    private boolean shouldExclude(String path, String userAgent) {
        // 排除特定路径前缀
        for (String excluded : EXCLUDED_PATHS) {
            if (path.startsWith(excluded)) {
                return true;
            }
        }
        
        // 排除静态资源
        if (STATIC_RESOURCES.matcher(path).matches()) {
            return true;
        }
        
        // 排除爬虫
        if (userAgent != null) {
            String uaLower = userAgent.toLowerCase();
            for (String bot : BOT_KEYWORDS) {
                if (uaLower.contains(bot)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // 多个代理时取第一个IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip;
    }
    
    private Long extractArticleId(String path) {
        // 如果是文章页面，尝试提取文章ID
        // 这里简单处理，实际可以从请求属性中获取
        return null;
    }
}
