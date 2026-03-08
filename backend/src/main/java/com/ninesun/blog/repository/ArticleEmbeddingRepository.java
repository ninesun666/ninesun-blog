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
     */
    @Query(value = """
        SELECT ae.article_id, ae.embedding <=> :queryVector AS distance
        FROM article_embeddings ae
        ORDER BY ae.embedding <=> :queryVector
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findSimilarArticles(@Param("queryVector") String queryVector, @Param("limit") int limit);
    
    /**
     * 向量相似度搜索，返回完整信息
     */
    @Query(value = """
        SELECT ae.id, ae.article_id, ae.content_hash, ae.embedding, ae.created_at, ae.updated_at,
               ae.embedding <=> :queryVector AS distance
        FROM article_embeddings ae
        ORDER BY ae.embedding <=> :queryVector
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findSimilarWithDistance(@Param("queryVector") String queryVector, @Param("limit") int limit);
}
