package com.ninesun.blog.service;

import com.ninesun.blog.dto.TwitterSyncResultDTO;
import com.ninesun.blog.entity.Article;
import com.ninesun.blog.entity.ArticleSocialPost;
import com.ninesun.blog.entity.SiteSettings;
import com.ninesun.blog.repository.ArticleRepository;
import com.ninesun.blog.repository.ArticleSocialPostRepository;
import com.ninesun.blog.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Twitter 发推服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TwitterPostService {
    
    private static final String TWEET_URL = "https://api.twitter.com/2/tweets";
    private static final int MAX_TWEET_LENGTH = 280;
    
    @Value("${app.site-url:}")
    private String siteUrl;
    
    private final TwitterOAuthService twitterOAuthService;
    private final ArticleRepository articleRepository;
    private final ArticleSocialPostRepository socialPostRepository;
    private final SiteSettingsRepository siteSettingsRepository;
    private final WebClient webClient;
    
    /**
     * 同步文章到 Twitter
     */
    @Transactional
    public TwitterSyncResultDTO syncArticle(Long articleId, Long userId, String customText) {
        // 检查是否已同步
        if (socialPostRepository.existsByArticleIdAndPlatformAndPostStatus(
                articleId, SocialAccountToken.TWITTER, ArticleSocialPost.STATUS_SUCCESS)) {
            return TwitterSyncResultDTO.failure("文章已同步到 Twitter");
        }
        
        // 获取文章
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new RuntimeException("文章不存在: " + articleId));
        
        // 获取 access token
        String accessToken;
        try {
            accessToken = twitterOAuthService.getValidAccessToken(userId);
        } catch (Exception e) {
            log.error("Failed to get Twitter access token", e);
            return TwitterSyncResultDTO.failure("Twitter 账号未连接或 Token 已过期");
        }
        
        // 构建推文内容
        String content = buildTweetContent(article, customText);
        
        // 发推
        try {
            Map<String, Object> response = webClient.post()
                .uri(TWEET_URL)
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .body(BodyInserters.fromValue(Map.of("text", content)))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            
            if (response == null || !response.containsKey("data")) {
                log.error("Twitter API response: {}", response);
                return TwitterSyncResultDTO.failure("Twitter API 返回异常");
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            String tweetId = (String) data.get("id");
            String tweetUrl = "https://x.com/i/status/" + tweetId;
            
            // 记录同步结果
            ArticleSocialPost socialPost = ArticleSocialPost.builder()
                .articleId(articleId)
                .platform(SocialAccountToken.TWITTER)
                .platformPostId(tweetId)
                .postUrl(tweetUrl)
                .postContent(content)
                .postStatus(ArticleSocialPost.STATUS_SUCCESS)
                .postedAt(LocalDateTime.now())
                .build();
            socialPostRepository.save(socialPost);
            
            log.info("Article {} synced to Twitter: {}", articleId, tweetUrl);
            return TwitterSyncResultDTO.success(
                tweetId,
                tweetUrl,
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            );
            
        } catch (Exception e) {
            log.error("Failed to post tweet", e);
            
            // 记录失败
            ArticleSocialPost socialPost = ArticleSocialPost.builder()
                .articleId(articleId)
                .platform(SocialAccountToken.TWITTER)
                .postContent(content)
                .postStatus(ArticleSocialPost.STATUS_FAILED)
                .errorMessage(e.getMessage())
                .build();
            socialPostRepository.save(socialPost);
            
            return TwitterSyncResultDTO.failure("发推失败: " + e.getMessage());
        }
    }
    
    /**
     * 异步同步文章
     */
    @Async
    public void syncArticleAsync(Long articleId, Long userId) {
        try {
            syncArticle(articleId, userId, null);
        } catch (Exception e) {
            log.error("Async Twitter sync failed for article {}", articleId, e);
        }
    }
    
    /**
     * 构建推文内容
     */
    private String buildTweetContent(Article article, String customText) {
        if (customText != null && !customText.isEmpty()) {
            return truncate(customText);
        }
        
        // 获取同步模板
        String template = "📝 新文章: {title}\n{url}";
        SiteSettings settings = siteSettingsRepository.findById(1L).orElse(null);
        if (settings != null && settings.getTwitterSyncFormat() != null) {
            template = settings.getTwitterSyncFormat();
        }
        
        String url = siteUrl + "/articles/" + article.getSlug();
        String content = template
            .replace("{title}", article.getTitle())
            .replace("{url}", url)
            .replace("{summary}", article.getSummary() != null ? article.getSummary() : "");
        
        return truncate(content);
    }
    
    /**
     * 截断内容到 280 字符
     */
    private String truncate(String content) {
        if (content.length() <= MAX_TWEET_LENGTH) {
            return content;
        }
        return content.substring(0, MAX_TWEET_LENGTH - 3) + "...";
    }
}
