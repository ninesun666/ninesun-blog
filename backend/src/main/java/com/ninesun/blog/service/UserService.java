package com.ninesun.blog.service;

import com.ninesun.blog.dto.*;
import com.ninesun.blog.entity.User;
import com.ninesun.blog.repository.*;
import com.ninesun.blog.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    
    // 站点设置缓存（生产环境应该存数据库）
    private static final ConcurrentHashMap<String, Object> siteSettings = new ConcurrentHashMap<>();
    
    static {
        siteSettings.put("siteName", "NineSun Blog");
        siteSettings.put("siteDescription", "技术博客，分享编程与生活");
        siteSettings.put("siteKeywords", "技术,编程,博客");
        siteSettings.put("footerText", "© 2026 NineSun Blog. All rights reserved.");
        siteSettings.put("socialGithub", "https://github.com");
        siteSettings.put("socialTwitter", "");
        siteSettings.put("socialEmail", "admin@example.com");
        siteSettings.put("allowGuestComment", true);
        siteSettings.put("requireCommentApproval", true);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setNickname(request.nickname() != null ? request.nickname() : request.username());
        user.setRole(User.UserRole.USER);
        user.setEnabled(true);

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername());
        return AuthResponse.of(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.username())
                .or(() -> userRepository.findByEmail(request.username()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = tokenProvider.generateToken(authentication);
        return AuthResponse.of(token, user);
    }

    public UserDTO getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDTO.from(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDTO.from(user);
    }

    @Transactional
    public UserDTO updateUserRole(Long id, User.UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(role);
        return UserDTO.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }
    
    @Transactional
    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (request.nickname() != null) {
            user.setNickname(request.nickname());
        }
        if (request.avatar() != null) {
            user.setAvatar(request.avatar());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
        }
        
        return UserDTO.from(userRepository.save(user));
    }
    
    // ==================== Statistics ====================
    
    public StatsDTO getStats() {
        long totalArticles = articleRepository.count();
        long publishedArticles = articleRepository.countByStatus(com.ninesun.blog.entity.Article.ArticleStatus.PUBLISHED);
        long draftArticles = articleRepository.countByStatus(com.ninesun.blog.entity.Article.ArticleStatus.DRAFT);
        long totalCategories = categoryRepository.count();
        long totalTags = tagRepository.count();
        long totalComments = commentRepository.count();
        long pendingComments = commentRepository.countByStatus(com.ninesun.blog.entity.Comment.CommentStatus.PENDING);
        long approvedComments = commentRepository.countByStatus(com.ninesun.blog.entity.Comment.CommentStatus.APPROVED);
        long totalUsers = userRepository.count();
        long adminCount = userRepository.countByRole(User.UserRole.ADMIN);
        long totalViews = articleRepository.sumViewCount();
        long totalLikes = likeRepository.count();
        
        return StatsDTO.of(
                totalArticles, publishedArticles, draftArticles,
                totalCategories, totalTags,
                totalComments, pendingComments, approvedComments,
                totalUsers, adminCount,
                totalViews, totalLikes
        );
    }
    
    public DetailedStatsDTO getDetailedStats() {
        // 基础统计
        StatsDTO basicStats = getStats();
        
        // 热门文章
        List<DetailedStatsDTO.PopularArticleDTO> popularArticles = articleRepository.findTopByViewCount(5).stream()
                .map(a -> new DetailedStatsDTO.PopularArticleDTO(
                        a.getId(), a.getTitle(), a.getSlug(),
                        a.getViewCount(), a.getLikeCount(), a.getCommentCount()
                ))
                .collect(Collectors.toList());
        
        // 最近文章
        List<DetailedStatsDTO.RecentArticleDTO> recentArticles = articleRepository.findRecentArticles(5).stream()
                .map(a -> new DetailedStatsDTO.RecentArticleDTO(
                        a.getId(), a.getTitle(), a.getSlug(),
                        a.getStatus().name(),
                        a.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
        
        // 分类统计
        List<DetailedStatsDTO.CategoryStatsDTO> categoryStats = articleRepository.countArticlesByCategory().stream()
                .map(row -> new DetailedStatsDTO.CategoryStatsDTO(
                        (Long) row[0], (String) row[1], (String) row[2], (Long) row[3]
                ))
                .collect(Collectors.toList());
        
        // 标签统计
        List<DetailedStatsDTO.TagStatsDTO> tagStats = articleRepository.countArticlesByTag().stream()
                .map(row -> new DetailedStatsDTO.TagStatsDTO(
                        (Long) row[0], (String) row[1], (String) row[2], (Long) row[3]
                ))
                .collect(Collectors.toList());
        
        return DetailedStatsDTO.of(
                basicStats.totalArticles(), basicStats.publishedArticles(), basicStats.draftArticles(),
                basicStats.totalCategories(), basicStats.totalTags(),
                basicStats.totalComments(), basicStats.pendingComments(), basicStats.approvedComments(),
                basicStats.totalUsers(), basicStats.adminCount(),
                basicStats.totalViews(), basicStats.totalLikes(),
                popularArticles, recentArticles, categoryStats, tagStats
        );
    }
    
    // ==================== Site Settings ====================
    
    public SiteSettingsDTO getSiteSettings() {
        return new SiteSettingsDTO(
                (String) siteSettings.getOrDefault("siteName", "NineSun Blog"),
                (String) siteSettings.getOrDefault("siteDescription", ""),
                (String) siteSettings.getOrDefault("siteKeywords", ""),
                (String) siteSettings.getOrDefault("footerText", ""),
                (String) siteSettings.getOrDefault("socialGithub", ""),
                (String) siteSettings.getOrDefault("socialTwitter", ""),
                (String) siteSettings.getOrDefault("socialEmail", ""),
                (Boolean) siteSettings.getOrDefault("allowGuestComment", true),
                (Boolean) siteSettings.getOrDefault("requireCommentApproval", true)
        );
    }
    
    @Transactional
    public SiteSettingsDTO updateSiteSettings(SiteSettingsDTO settings) {
        siteSettings.put("siteName", settings.siteName());
        siteSettings.put("siteDescription", settings.siteDescription());
        siteSettings.put("siteKeywords", settings.siteKeywords());
        siteSettings.put("footerText", settings.footerText());
        siteSettings.put("socialGithub", settings.socialGithub());
        siteSettings.put("socialTwitter", settings.socialTwitter());
        siteSettings.put("socialEmail", settings.socialEmail());
        siteSettings.put("allowGuestComment", settings.allowGuestComment());
        siteSettings.put("requireCommentApproval", settings.requireCommentApproval());
        return getSiteSettings();
    }
}
