package com.ninesun.blog.service;

import com.ninesun.blog.dto.TwitterAccountDTO;
import com.ninesun.blog.entity.SocialAccountToken;
import com.ninesun.blog.repository.SocialAccountTokenRepository;
import com.ninesun.blog.util.AesEncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Twitter OAuth 服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TwitterOAuthService {
    
    private static final String AUTH_URL = "https://twitter.com/i/oauth2/authorize";
    private static final String TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
    private static final String USER_URL = "https://api.twitter.com/2/users/me";
    
    private static final String REDIS_PREFIX = "twitter:oauth:";
    private static final long STATE_EXPIRE_HOURS = 1;
    
    @Value("${twitter.client-id:}")
    private String clientId;
    
    @Value("${twitter.client-secret:}")
    private String clientSecret;
    
    @Value("${app.site-url:}")
    private String siteUrl;
    
    private final StringRedisTemplate redisTemplate;
    private final SocialAccountTokenRepository tokenRepository;
    private final AesEncryptionUtil aesEncryptionUtil;
    private final WebClient webClient;
    
    /**
     * 生成 OAuth 授权 URL
     */
    public String generateAuthUrl() {
        if (clientId == null || clientId.isEmpty()) {
            throw new IllegalStateException("Twitter Client ID not configured");
        }
        
        String redirectUri = siteUrl + "/api/twitter/callback";
        String state = UUID.randomUUID().toString();
        String codeVerifier = generateCodeVerifier();
        String codeChallenge = generateCodeChallenge(codeVerifier);
        
        // 存储到 Redis
        redisTemplate.opsForValue().set(
            REDIS_PREFIX + "verifier:" + state,
            codeVerifier,
            STATE_EXPIRE_HOURS,
            TimeUnit.HOURS
        );
        
        return UriComponentsBuilder.fromHttpUrl(AUTH_URL)
            .queryParam("response_type", "code")
            .queryParam("client_id", clientId)
            .queryParam("redirect_uri", redirectUri)
            .queryParam("scope", "tweet.write tweet.read users.read offline.access")
            .queryParam("state", state)
            .queryParam("code_challenge", codeChallenge)
            .queryParam("code_challenge_method", "S256")
            .build()
            .toUriString();
    }
    
    /**
     * 处理 OAuth 回调
     */
    @Transactional
    public void handleCallback(String code, String state, Long userId) {
        // 获取 code_verifier
        String verifierKey = REDIS_PREFIX + "verifier:" + state;
        String codeVerifier = redisTemplate.opsForValue().get(verifierKey);
        if (codeVerifier == null) {
            throw new IllegalStateException("Invalid or expired OAuth state");
        }
        redisTemplate.delete(verifierKey);
        
        // 换取 token
        String redirectUri = siteUrl + "/api/twitter/callback";
        
        Map<String, Object> tokenResponse = webClient.post()
            .uri(TOKEN_URL)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body(BodyInserters.fromFormData("code", code)
                .with("grant_type", "authorization_code")
                .with("client_id", clientId)
                .with("redirect_uri", redirectUri)
                .with("code_verifier", codeVerifier))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
        
        if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
            throw new RuntimeException("Failed to get access token from Twitter");
        }
        
        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");
        
        // 获取用户信息
        Map<String, Object> userResponse = webClient.get()
            .uri(USER_URL + "?user.fields=username,id")
            .header("Authorization", "Bearer " + accessToken)
            .retrieve()
            .bodyToMono(Map.class)
            .block();
        
        if (userResponse == null || !userResponse.containsKey("data")) {
            throw new RuntimeException("Failed to get user info from Twitter");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> userData = (Map<String, Object>) userResponse.get("data");
        String twitterUserId = String.valueOf(userData.get("id"));
        String twitterUsername = (String) userData.get("username");
        
        // 删除旧的 token
        tokenRepository.deleteByUserIdAndPlatform(userId, SocialAccountToken.TWITTER);
        
        // 存储新 token
        SocialAccountToken token = SocialAccountToken.builder()
            .userId(userId)
            .platform(SocialAccountToken.TWITTER)
            .platformUserId(twitterUserId)
            .platformUsername(twitterUsername)
            .accessToken(aesEncryptionUtil.encrypt(accessToken))
            .refreshToken(refreshToken != null ? aesEncryptionUtil.encrypt(refreshToken) : null)
            .expiresAt(LocalDateTime.now().plusSeconds(expiresIn != null ? expiresIn : 7200))
            .isActive(true)
            .build();
        
        tokenRepository.save(token);
        log.info("Twitter account connected: @{} (userId: {})", twitterUsername, userId);
    }
    
    /**
     * 获取已绑定的 Twitter 账号信息
     */
    public TwitterAccountDTO getConnectedAccount(Long userId) {
        return tokenRepository.findByUserIdAndPlatform(userId, SocialAccountToken.TWITTER)
            .filter(SocialAccountToken::getIsActive)
            .map(token -> new TwitterAccountDTO(
                true,
                token.getPlatformUsername(),
                token.getPlatformUserId(),
                token.getCreatedAt()
            ))
            .orElse(TwitterAccountDTO.notConnected());
    }
    
    /**
     * 解绑 Twitter 账号
     */
    @Transactional
    public void disconnect(Long userId) {
        tokenRepository.deleteByUserIdAndPlatform(userId, SocialAccountToken.TWITTER);
        log.info("Twitter account disconnected for userId: {}", userId);
    }
    
    /**
     * 获取有效的 access token
     */
    public String getValidAccessToken(Long userId) {
        SocialAccountToken token = tokenRepository
            .findByUserIdAndPlatform(userId, SocialAccountToken.TWITTER)
            .filter(SocialAccountToken::getIsActive)
            .orElseThrow(() -> new IllegalStateException("Twitter account not connected"));
        
        // 检查是否过期
        if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(LocalDateTime.now().plusMinutes(5))) {
            // 需要刷新
            return refreshAndGetToken(token);
        }
        
        token.setLastUsedAt(LocalDateTime.now());
        tokenRepository.save(token);
        
        return aesEncryptionUtil.decrypt(token.getAccessToken());
    }
    
    /**
     * 刷新 token
     */
    private String refreshAndGetToken(SocialAccountToken token) {
        if (token.getRefreshToken() == null) {
            token.setIsActive(false);
            tokenRepository.save(token);
            throw new IllegalStateException("Twitter token expired and no refresh token available");
        }
        
        String refreshToken = aesEncryptionUtil.decrypt(token.getRefreshToken());
        
        Map<String, Object> response = webClient.post()
            .uri(TOKEN_URL)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body(BodyInserters.fromFormData("refresh_token", refreshToken)
                .with("grant_type", "refresh_token")
                .with("client_id", clientId))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
        
        if (response == null || !response.containsKey("access_token")) {
            token.setIsActive(false);
            tokenRepository.save(token);
            throw new RuntimeException("Failed to refresh Twitter token");
        }
        
        String newAccessToken = (String) response.get("access_token");
        String newRefreshToken = (String) response.get("refresh_token");
        Integer expiresIn = (Integer) response.get("expires_in");
        
        token.setAccessToken(aesEncryptionUtil.encrypt(newAccessToken));
        if (newRefreshToken != null) {
            token.setRefreshToken(aesEncryptionUtil.encrypt(newRefreshToken));
        }
        token.setExpiresAt(LocalDateTime.now().plusSeconds(expiresIn != null ? expiresIn : 7200));
        token.setLastUsedAt(LocalDateTime.now());
        tokenRepository.save(token);
        
        log.info("Twitter token refreshed for userId: {}", token.getUserId());
        return newAccessToken;
    }
    
    /**
     * 检查是否已连接 Twitter
     */
    public boolean isConnected(Long userId) {
        return tokenRepository.existsByUserIdAndPlatformAndIsActiveTrue(userId, SocialAccountToken.TWITTER);
    }
    
    /**
     * 生成 code_verifier (43-128 字符)
     */
    private String generateCodeVerifier() {
        byte[] bytes = new byte[32];
        new java.security.SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    
    /**
     * 生成 code_challenge (S256)
     */
    private String generateCodeChallenge(String codeVerifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate code challenge", e);
        }
    }
}
