package com.ninesun.blog.service;

import com.ninesun.blog.dto.LikeDTO;
import com.ninesun.blog.entity.Article;
import com.ninesun.blog.entity.Like;
import com.ninesun.blog.entity.User;
import com.ninesun.blog.repository.ArticleRepository;
import com.ninesun.blog.repository.LikeRepository;
import com.ninesun.blog.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public LikeDTO getLikeInfo(Long articleId, HttpServletRequest request) {
        long count = likeRepository.countByArticleId(articleId);
        boolean liked = isLikedByCurrentClient(articleId, request);
        return new LikeDTO(articleId, count, liked);
    }

    @Transactional
    public LikeDTO toggleLike(Long articleId, HttpServletRequest request) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));

        String clientIp = getClientIp(request);
        
        // Check if already liked
        Like existingLike = likeRepository.findByArticleIdAndIp(articleId, clientIp).orElse(null);
        
        if (existingLike != null) {
            // Unlike - remove the like
            likeRepository.delete(existingLike);
        } else {
            // Like - create new
            Like like = new Like();
            like.setArticle(article);
            like.setIp(clientIp);
            
            // If user is authenticated, link to user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                User user = userRepository.findByUsername(username).orElse(null);
                like.setUser(user);
            }
            
            likeRepository.save(like);
        }
        
        return getLikeInfo(articleId, request);
    }

    private boolean isLikedByCurrentClient(Long articleId, HttpServletRequest request) {
        String clientIp = getClientIp(request);
        return likeRepository.existsByArticleIdAndIp(articleId, clientIp);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
