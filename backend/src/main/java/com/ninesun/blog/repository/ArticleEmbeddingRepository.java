package com.ninesun.blog.repository;

import com.ninesun.blog.entity.ArticleEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleEmbeddingRepository extends JpaRepository<ArticleEmbedding, Long> {
    
    Optional<ArticleEmbedding> findByArticleId(Long articleId);
    
    void deleteByArticleId(Long articleId);
    
    boolean existsByArticleId(Long articleId);
    
    /**
     * 向量相似度搜索（余弦距离）
     * 使用 pgvector 的 <=> 操作符（余弦距离）
     * 注意：使用位置参数避免 JPA 解析 ::vector 时的问题
     */
    @Query(value = """
        SELECT ae.article_id, ae.embedding <=> CAST(?1 AS vector) AS distance
        FROM article_embeddings ae
        ORDER BY ae.embedding <=> CAST(?1 AS vector)
        LIMIT ?2
        """, nativeQuery = true)
    List<Object[]> findSimilarArticles(String queryVector, int limit);
    
    /**
     * 向量相似度搜索，返回完整信息
     */
    @Query(value = """
        SELECT ae.id, ae.article_id, ae.content_hash, ae.embedding, ae.created_at, ae.updated_at,
               ae.embedding <=> CAST(?1 AS vector) AS distance
        FROM article_embeddings ae
        ORDER BY ae.embedding <=> CAST(?1 AS vector)
        LIMIT ?2
        """, nativeQuery = true)
    List<Object[]> findSimilarWithDistance(String queryVector, int limit);
}
