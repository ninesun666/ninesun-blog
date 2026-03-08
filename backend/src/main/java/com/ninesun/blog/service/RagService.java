package com.ninesun.blog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ninesun.blog.dto.ArticleDTO;
import com.ninesun.blog.entity.Article;
import com.ninesun.blog.repository.ArticleEmbeddingRepository;
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
    private final ArticleEmbeddingRepository embeddingRepository;
    private final ArticleRepository articleRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    
    @Value("${openai.api-key:}")
    private String apiKey;
    
    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;
    
    @Value("${openai.chat-model:gpt-4o-mini}")
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
        Map<String, Object> result = new HashMap<>();
        
        if (apiKey == null || apiKey.isEmpty()) {
            result.put("success", false);
            result.put("error", "AI 服务未配置");
            return result;
        }
        
        try {
            // 1. 生成查询的 embedding
            float[] queryEmbedding = embeddingService.generateEmbedding(query);
            if (queryEmbedding.length == 0) {
                result.put("success", false);
                result.put("error", "无法处理查询");
                return result;
            }
            
            // 2. 向量搜索相似文章
            String queryVector = embeddingService.embeddingToString(queryEmbedding);
            List<Object[]> similarArticles = embeddingRepository.findSimilarArticles(queryVector, maxContextArticles);
            
            // 3. 获取相关文章内容
            List<Map<String, Object>> context = buildContext(similarArticles);
            
            // 4. 构建 prompt 并调用 LLM
            String response = callLLM(query, context, conversationHistory);
            
            result.put("success", true);
            result.put("response", response);
            result.put("sources", context.stream()
                .map(c -> Map.of(
                    "id", c.get("id"),
                    "title", c.get("title"),
                    "slug", c.get("slug")
                ))
                .collect(Collectors.toList()));
            
            return result;
            
        } catch (Exception e) {
            log.error("RAG chat error: {}", e.getMessage());
            result.put("success", false);
            result.put("error", "处理请求时出错: " + e.getMessage());
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
                continue;
            }
            
            Optional<Article> articleOpt = articleRepository.findById(articleId);
            if (articleOpt.isEmpty()) continue;
            
            Article article = articleOpt.get();
            
            String content = String.format(
                "【文章标题】%s\n【文章内容】%s",
                article.getTitle(),
                truncateText(article.getContent(), 1000)
            );
            
            if (totalLength + content.length() > maxContextLength) break;
            
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
            String requestBody = String.format(
                "{\"model\": \"%s\", \"messages\": %s, \"temperature\": 0.7, \"max_tokens\": 1000}",
                chatModel,
                messagesJson
            );
            
            String response = webClient.post()
                .uri(baseUrl + "/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();
            
        } catch (Exception e) {
            log.error("Error calling LLM: {}", e.getMessage());
            return "抱歉，处理您的请求时出现了问题。";
        }
    }
    
    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }
}
