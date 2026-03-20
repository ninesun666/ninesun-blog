package com.ninesun.blog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ninesun.blog.entity.Article;
import com.ninesun.blog.entity.ArticleEmbedding;
import com.ninesun.blog.repository.ArticleEmbeddingRepository;
import com.ninesun.blog.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingService {
    
    private final ArticleEmbeddingRepository embeddingRepository;
    private final ArticleRepository articleRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final ModelProviderService modelProviderService;
    
    // 备用配置（当数据库没有配置时使用）
    @Value("${openai.api-key:}")
    private String fallbackApiKey;
    
    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String fallbackBaseUrl;
    
    @Value("${openai.embedding-model:text-embedding-3-small}")
    private String fallbackEmbeddingModel;
    
    private static final int MAX_CONTENT_LENGTH = 8000;
    
    /**
     * 为文章生成并存储 embedding
     */
    @Async
    @Transactional
    public void generateAndStoreEmbedding(Long articleId) {
        ActiveModelConfig config = getEmbeddingConfig();
        if (config == null || config.getApiKey() == null || config.getApiKey().isEmpty()) {
            log.warn("Embedding model not configured, skipping embedding generation");
            return;
        }
        
        try {
            Optional<Article> articleOpt = articleRepository.findById(articleId);
            if (articleOpt.isEmpty()) {
                log.warn("Article not found: {}", articleId);
                return;
            }
            
            Article article = articleOpt.get();
            String content = buildContentForEmbedding(article);
            String contentHash = hashContent(content);
            
            // 检查是否需要更新
            Optional<ArticleEmbedding> existing = embeddingRepository.findByArticleId(articleId);
            if (existing.isPresent() && contentHash.equals(existing.get().getContentHash())) {
                log.debug("Embedding up-to-date for article: {}", articleId);
                return;
            }
            
            // 生成 embedding
            float[] embedding = generateEmbedding(content);
            if (embedding == null || embedding.length == 0) {
                log.error("Failed to generate embedding for article: {}", articleId);
                return;
            }
            
            // 存储或更新
            ArticleEmbedding embeddingEntity = existing
                .map(e -> {
                    e.setEmbedding(embedding);
                    e.setContentHash(contentHash);
                    return e;
                })
                .orElse(ArticleEmbedding.builder()
                    .articleId(articleId)
                    .embedding(embedding)
                    .contentHash(contentHash)
                    .build());
            
            embeddingRepository.save(embeddingEntity);
            log.info("Embedding saved for article: {}", articleId);
            
        } catch (Exception e) {
            log.error("Error generating embedding for article {}: {}", articleId, e.getMessage());
        }
    }
    
    /**
     * 批量生成所有文章的 embedding
     */
    @Transactional
    public int generateAllEmbeddings() {
        ActiveModelConfig config = getEmbeddingConfig();
        if (config == null || config.getApiKey() == null || config.getApiKey().isEmpty()) {
            log.warn("Embedding model not configured");
            return 0;
        }
        
        List<Article> articles = articleRepository.findByStatus(Article.ArticleStatus.PUBLISHED);
        int count = 0;
        
        for (Article article : articles) {
            try {
                generateAndStoreEmbeddingSync(article.getId());
                count++;
                // 避免触发 API 限流
                Thread.sleep(100);
            } catch (Exception e) {
                log.error("Error processing article {}: {}", article.getId(), e.getMessage());
            }
        }
        
        log.info("Generated embeddings for {} articles", count);
        return count;
    }
    
    /**
     * 同步生成 embedding（用于批量处理）
     */
    @Transactional
    public void generateAndStoreEmbeddingSync(Long articleId) {
        ActiveModelConfig config = getEmbeddingConfig();
        if (config == null || config.getApiKey() == null || config.getApiKey().isEmpty()) {
            return;
        }
        
        Optional<Article> articleOpt = articleRepository.findById(articleId);
        if (articleOpt.isEmpty()) {
            return;
        }
        
        Article article = articleOpt.get();
        String content = buildContentForEmbedding(article);
        String contentHash = hashContent(content);
        
        Optional<ArticleEmbedding> existing = embeddingRepository.findByArticleId(articleId);
        if (existing.isPresent() && contentHash.equals(existing.get().getContentHash())) {
            return;
        }
        
        float[] embedding = generateEmbedding(content);
        if (embedding == null || embedding.length == 0) {
            return;
        }
        
        ArticleEmbedding embeddingEntity = existing
            .map(e -> {
                e.setEmbedding(embedding);
                e.setContentHash(contentHash);
                return e;
            })
            .orElse(ArticleEmbedding.builder()
                .articleId(articleId)
                .embedding(embedding)
                .contentHash(contentHash)
                .build());
        
        embeddingRepository.save(embeddingEntity);
    }
    
    /**
     * 生成文本的 embedding
     */
    public float[] generateEmbedding(String text) {
        ActiveModelConfig config = getEmbeddingConfig();
        if (config == null || config.getApiKey() == null || config.getApiKey().isEmpty()) {
            log.warn("Embedding model not configured");
            return new float[0];
        }
        
        try {
            String truncatedText = truncateText(text, MAX_CONTENT_LENGTH);
            
            WebClient webClient = webClientBuilder.build();
            String requestBody = String.format(
                "{\"model\": \"%s\", \"input\": %s}",
                config.getModelName(),
                objectMapper.writeValueAsString(truncatedText)
            );
            
            String response = webClient.post()
                .uri(config.getBaseUrl() + "/embeddings")
                .header("Authorization", "Bearer " + config.getApiKey())
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            JsonNode root = objectMapper.readTree(response);
            JsonNode embeddingNode = root.path("data").get(0).path("embedding");
            
            float[] embedding = new float[embeddingNode.size()];
            for (int i = 0; i < embeddingNode.size(); i++) {
                embedding[i] = (float) embeddingNode.get(i).asDouble();
            }
            
            return embedding;
            
        } catch (Exception e) {
            log.error("Error calling embedding API: {}", e.getMessage());
            return new float[0];
        }
    }
    
    /**
     * 获取当前配置的 embedding 模型
     */
    private ActiveModelConfig getEmbeddingConfig() {
        try {
            return modelProviderService.getActiveEmbeddingConfig();
        } catch (Exception e) {
            log.warn("Failed to get embedding config from database, using fallback: {}", e.getMessage());
            // 使用备用配置
            if (fallbackApiKey != null && !fallbackApiKey.isEmpty()) {
                return ActiveModelConfig.builder()
                        .provider("openai")
                        .providerName("OpenAI")
                        .modelName(fallbackEmbeddingModel)
                        .displayName("Fallback Embedding")
                        .apiKey(fallbackApiKey)
                        .baseUrl(fallbackBaseUrl)
                        .build();
            }
            return null;
        }
    }
    
    /**
     * 将 float[] 转换为 PostgreSQL vector 格式的字符串
     */
    public String embeddingToString(float[] embedding) {
        if (embedding == null || embedding.length == 0) {
            return "[]";
        }
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(String.format("%.8f", embedding[i]));
        }
        sb.append("]");
        return sb.toString();
    }
    
    /**
     * 删除文章的 embedding
     */
    @Transactional
    public void deleteEmbedding(Long articleId) {
        embeddingRepository.deleteByArticleId(articleId);
    }
    
    private String buildContentForEmbedding(Article article) {
        StringBuilder sb = new StringBuilder();
        sb.append("标题: ").append(article.getTitle()).append("\n\n");
        if (article.getSummary() != null && !article.getSummary().isEmpty()) {
            sb.append("摘要: ").append(article.getSummary()).append("\n\n");
        }
        sb.append(article.getContent());
        return sb.toString();
    }
    
    private String hashContent(String content) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(content.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return String.valueOf(content.hashCode());
        }
    }
    
    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }
}
