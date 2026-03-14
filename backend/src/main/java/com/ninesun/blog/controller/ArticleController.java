package com.ninesun.blog.controller;

import com.ninesun.blog.dto.ArticleCreateRequest;
import com.ninesun.blog.dto.ArticleDTO;
import com.ninesun.blog.dto.ArticleListDTO;
import com.ninesun.blog.dto.ArticleUpdateRequest;
import com.ninesun.blog.dto.PageResponse;
import com.ninesun.blog.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {
    
    private final ArticleService articleService;
    
    @GetMapping
    public ResponseEntity<PageResponse<ArticleDTO>> getArticles(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(articleService.getPublishedArticles(page, size));
    }
    
    /**
     * 获取所有已发布文章列表（用于侧边栏目录）
     */
    @GetMapping("/all")
    public ResponseEntity<List<ArticleListDTO>> getAllArticles() {
        return ResponseEntity.ok(articleService.getAllPublishedArticles());
    }
    
    @GetMapping("/category/{slug}")
    public ResponseEntity<PageResponse<ArticleDTO>> getArticlesByCategory(
        @PathVariable String slug,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(articleService.getArticlesByCategory(slug, page, size));
    }
    
    @GetMapping("/tag/{slug}")
    public ResponseEntity<PageResponse<ArticleDTO>> getArticlesByTag(
        @PathVariable String slug,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(articleService.getArticlesByTag(slug, page, size));
    }
    
    @GetMapping("/{slug}")
    public ResponseEntity<ArticleDTO> getArticle(@PathVariable String slug) {
        ArticleDTO article = articleService.getArticleBySlug(slug);
        return ResponseEntity.ok(article);
    }
    
    @GetMapping("/id/{id}")
    public ResponseEntity<ArticleDTO> getArticleById(@PathVariable Long id) {
        ArticleDTO article = articleService.getArticleById(id);
        return ResponseEntity.ok(article);
    }
    
    @PostMapping
    public ResponseEntity<ArticleDTO> createArticle(@Valid @RequestBody ArticleCreateRequest request) {
        ArticleDTO article = articleService.createArticle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(article);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ArticleDTO> updateArticle(
        @PathVariable Long id,
        @Valid @RequestBody ArticleUpdateRequest request
    ) {
        ArticleDTO article = articleService.updateArticle(id, request);
        return ResponseEntity.ok(article);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long id) {
        articleService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }
}
