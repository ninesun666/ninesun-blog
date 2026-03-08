package com.ninesun.blog.controller;

import com.ninesun.blog.dto.ChatRequest;
import com.ninesun.blog.service.EmbeddingService;
import com.ninesun.blog.service.RagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {
    
    private final RagService ragService;
    private final EmbeddingService embeddingService;
    
    /**
     * AI 聊天接口
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@Valid @RequestBody ChatRequest request) {
        Map<String, Object> result = ragService.chat(request.getMessage(), request.getHistory());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 批量生成文章 embeddings（管理员接口）
     */
    @PostMapping("/embeddings/generate")
    public ResponseEntity<Map<String, Object>> generateEmbeddings() {
        int count = embeddingService.generateAllEmbeddings();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "已生成 " + count + " 篇文章的向量索引");
        return ResponseEntity.ok(result);
    }
    
    /**
     * 为单篇文章生成 embedding
     */
    @PostMapping("/embeddings/generate/{articleId}")
    public ResponseEntity<Map<String, Object>> generateEmbedding(@PathVariable Long articleId) {
        embeddingService.generateAndStoreEmbedding(articleId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "向量生成任务已提交");
        return ResponseEntity.ok(result);
    }
    
    /**
     * 检查 AI 服务状态
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("available", ragService != null);
        return ResponseEntity.ok(status);
    }
}
