package com.ninesun.blog.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 使用 JdbcTemplate 进行向量相似度搜索
 * 避免 JPA 对 pgvector 类型支持不好的问题
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class ArticleEmbeddingCustomRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    /**
     * 向量相似度搜索（余弦距离）
     * 返回 [articleId, distance] 数组
     */
    public List<Object[]> findSimilarArticles(String queryVector, int limit) {
        String sql = """
            SELECT ae.article_id, ae.embedding <=> CAST(? AS vector) AS distance
            FROM article_embeddings ae
            ORDER BY ae.embedding <=> CAST(? AS vector)
            LIMIT ?
            """;
        
        return jdbcTemplate.query(sql, 
            (rs, rowNum) -> new Object[]{
                rs.getLong("article_id"),
                rs.getDouble("distance")
            },
            queryVector, queryVector, limit
        );
    }
    
    /**
     * 向量相似度搜索，返回完整信息
     * 返回 [id, articleId, contentHash, embedding, createdAt, updatedAt, distance] 数组
     */
    public List<Object[]> findSimilarWithDistance(String queryVector, int limit) {
        String sql = """
            SELECT ae.id, ae.article_id, ae.content_hash, ae.embedding, ae.created_at, ae.updated_at,
                   ae.embedding <=> CAST(? AS vector) AS distance
            FROM article_embeddings ae
            ORDER BY ae.embedding <=> CAST(? AS vector)
            LIMIT ?
            """;
        
        return jdbcTemplate.query(sql,
            (rs, rowNum) -> new Object[]{
                rs.getLong("id"),
                rs.getLong("article_id"),
                rs.getString("content_hash"),
                rs.getString("embedding"),
                rs.getTimestamp("created_at"),
                rs.getTimestamp("updated_at"),
                rs.getDouble("distance")
            },
            queryVector, queryVector, limit
        );
    }
}
