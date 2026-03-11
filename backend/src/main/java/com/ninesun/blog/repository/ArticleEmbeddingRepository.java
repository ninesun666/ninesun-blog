package com.ninesun.blog.repository;

import com.ninesun.blog.entity.ArticleEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ArticleEmbedding 基本 CRUD 操作
 * 向量搜索使用 ArticleEmbeddingCustomRepository (JdbcTemplate)
 */
@Repository
public interface ArticleEmbeddingRepository extends JpaRepository<ArticleEmbedding, Long> {
    
    Optional<ArticleEmbedding> findByArticleId(Long articleId);
    
    void deleteByArticleId(Long articleId);
    
    boolean existsByArticleId(Long articleId);
}
