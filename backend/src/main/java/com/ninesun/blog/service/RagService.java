package com.ninesun.blog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ninesun.blog.dto.ArticleDTO;
import com.ninesun.blog.entity.Article;
import com.ninesun.blog.repository.ArticleEmbeddingCustomRepository;
import com.ninesun.blog.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagService {
    
    private final EmbeddingService embeddingService;
    private final ArticleEmbeddingCustomRepository embeddingRepository;
    private final ArticleRepository articleRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    
    @Value("${openai.api-key:}")
    private String apiKey;
    
    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;
    
    @Value("${openai.chat-model:glm-5}")
    private String chatModel;
    
    @Value("${rag.max-context-articles:5}")
    private int maxContextArticles;
    
    @Value("${rag.max-context-length:4000}")
    private int maxContextLength;
    
    private static final String SYSTEM_PROMPT = """
        你是 Ninesun Blog 的 AI 助手。你的职责是基于博客文章内容回答用户问题。
        
        遵循以下规则：
        1. 只基于提供的博客内容回答问题
        2. 如果内容中没有相关信息，诚实地说明
        3. 回答要简洁、准确、有帮助
        4. 可以引用具体的文章标题
        5. 用中文回答
        6. 如果用户问的是博客外的问题，可以友好地告知你主要帮助解答博客相关内容
        """;
    
    /**
     * RAG 问答
     */
    public Map<String, Object> chat(String query, String conversationHistory) {
        log.debug("====== [AI Chat Flow] START ======");
        log.debug("[AI Chat Flow] 1. Request Received. Query: '{}'", query);
        log.debug("[AI Chat Flow] 2. History Length: {} chars", conversationHistory != null ? conversationHistory.length() : 0);
        
        Map<String, Object> result = new HashMap<>();
        
        if (apiKey == null || apiKey.isEmpty()) {
            result.put("success", false);
            result.put("error", "AI 服务未配置");
            log.debug("[AI Chat Flow] FAIL: AI Service not configured (API Key is missing).");
            return result;
        }
        
        try {
            // 1. 生成查询的 embedding
            log.debug("[AI Chat Flow] 3. Generating embedding for the query...");
            float[] queryEmbedding = embeddingService.generateEmbedding(query);
            if (queryEmbedding.length == 0) {
                result.put("success", false);
                result.put("error", "无法处理查询");
                log.debug("[AI Chat Flow] FAIL: Empty embedding returned for query.");
                return result;
            }
            log.debug("[AI Chat Flow] 4. Query embedding generated successfully. Vector dimension: {}", queryEmbedding.length);
            
            // 2. 向量搜索相似文章
            log.debug("[AI Chat Flow] 5. Starting vector similarity search to find related articles...");
            String queryVector = embeddingService.embeddingToString(queryEmbedding);
            List<Object[]> similarArticles = embeddingRepository.findSimilarArticles(queryVector, maxContextArticles);
            log.debug("[AI Chat Flow] 6. Vector search completed. Found {} raw related articles.", similarArticles.size());
            
            // 3. 获取相关文章内容
            log.debug("[AI Chat Flow] 7. Building context from found articles...");
            List<Map<String, Object>> context = buildContext(similarArticles);
            
            // 4. 构建 prompt 并调用 LLM
            log.debug("[AI Chat Flow] 9. Preparing to call LLM...");
            String response = callLLM(query, context, conversationHistory);
            log.debug("[AI Chat Flow] 10. LLM API Call completed.");
            
            result.put("success", true);
            result.put("response", response);
            result.put("sources", context.stream()
                .map(c -> Map.of(
                    "id", c.get("id"),
                    "title", c.get("title"),
                    "slug", c.get("slug")
                ))
                .collect(Collectors.toList()));
            
            log.debug("====== [AI Chat Flow] SUCCESS ======");
            return result;
            
        } catch (Exception e) {
            log.error("RAG chat error: {}", e.getMessage());
            result.put("success", false);
            result.put("error", "处理请求时出错: " + e.getMessage());
            log.debug("====== [AI Chat Flow] ERROR: {} ======", e.getMessage());
            return result;
        }
    }
    
    /**
     * 构建上下文
     */
    private List<Map<String, Object>> buildContext(List<Object[]> similarArticles) {
        List<Map<String, Object>> context = new ArrayList<>();
        int totalLength = 0;
        
        for (Object[] row : similarArticles) {
            Long articleId = ((Number) row[0]).longValue();
            double distance = ((Number) row[1]).doubleValue();
            
            // 只取距离小于 0.5 的结果（相似度足够高）
            if (distance > 0.5) {
                log.debug("[AI Chat Flow - Context] Ignored Article ID {} due to distance {} > 0.5 limit", articleId, distance);
                continue;
            }
            
            Optional<Article> articleOpt = articleRepository.findById(articleId);
            if (articleOpt.isEmpty()) {
                log.debug("[AI Chat Flow - Context] Article ID {} not found in database", articleId);
                continue;
            }
            
            Article article = articleOpt.get();
            log.debug("[AI Chat Flow - Context] Selected Article ID {}, Title: '{}', Distance: {}", article.getId(), article.getTitle(), distance);
            
            String content = String.format(
                "【文章标题】%s\n【文章内容】%s",
                article.getTitle(),
                truncateText(article.getContent(), 1000)
            );
            
            if (totalLength + content.length() > maxContextLength) {
                log.debug("[AI Chat Flow - Context] Context length limit reached ({} > {}). Stopping inclusion.", totalLength + content.length(), maxContextLength);
                break;
            }
            
            totalLength += content.length();
            context.add(Map.of(
                "id", article.getId(),
                "title", article.getTitle(),
                "slug", article.getSlug(),
                "content", content,
                "distance", distance
            ));
        }
        
        return context;
    }
    
    /**
     * 调用 LLM
     */
    private String callLLM(String query, List<Map<String, Object>> context, String history) {
        try {
            WebClient webClient = webClientBuilder.build();
            
            // 构建消息
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
            
            // 添加历史对话
            if (history != null && !history.isEmpty()) {
                // 简单处理历史，实际应该解析 JSON
                messages.add(Map.of("role", "system", "content", "之前的对话：\n" + history));
            }
            
            // 添加上下文
            if (!context.isEmpty()) {
                StringBuilder contextBuilder = new StringBuilder("以下是相关的博客文章内容：\n\n");
                for (Map<String, Object> article : context) {
                    contextBuilder.append(article.get("content")).append("\n\n---\n\n");
                }
                messages.add(Map.of("role", "system", "content", contextBuilder.toString()));
            }
            
            // 添加用户问题
            messages.add(Map.of("role", "user", "content", query));
            
            String messagesJson = objectMapper.writeValueAsString(messages);
            log.debug("[AI Chat Flow - LLM] Constructed LLM Request Messages:\n{}", messagesJson);
            
            String requestBody = String.format(
                "{\"model\": \"%s\", \"messages\": %s, \"temperature\": 0.7, \"max_tokens\": 1000}",
                chatModel,
                messagesJson
            );
            
            log.debug("[AI Chat Flow - LLM] Sending Request (URL: {}, Model: {})...", baseUrl + "/chat/completions", chatModel);
            
            String response = webClient.post()
                .uri(baseUrl + "/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            log.debug("[AI Chat Flow - LLM] Raw LLM Response Processed. Payload size: {}", response != null ? response.length() : 0);
            
            JsonNode root = objectMapper.readTree(response);
            String finalContent = root.path("choices").get(0).path("message").path("content").asText();
            log.debug("[AI Chat Flow - LLM] Extracted Response Content: \n{}", finalContent);
            
            return finalContent;
            
        } catch (Exception e) {
            log.error("Error calling LLM: {}", e.getMessage());
            log.debug("[AI Chat Flow - LLM] LLM Exception trace: ", e);
            return "抱歉，处理您的请求时出现了问题。";
        }
    }
    
    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }
}
