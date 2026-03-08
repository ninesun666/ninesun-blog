package com.ninesun.blog.repository;

import com.ninesun.blog.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    Optional<Article> findBySlug(String slug);
    
    Page<Article> findByStatus(Article.ArticleStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.category.slug = :slug AND a.status = :status")
    Page<Article> findByCategorySlugAndStatus(@Param("slug") String slug, @Param("status") Article.ArticleStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Article a JOIN a.tags t WHERE t.slug = :slug AND a.status = :status")
    Page<Article> findByTagSlugAndStatus(@Param("slug") String slug, @Param("status") Article.ArticleStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.tags WHERE a.id = :id")
    Optional<Article> findByIdWithTags(@Param("id") Long id);
    
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.category LEFT JOIN FETCH a.tags WHERE a.slug = :slug")
    Optional<Article> findBySlugWithCategoryAndTags(@Param("slug") String slug);
    
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.category LEFT JOIN FETCH a.tags WHERE a.id = :id")
    Optional<Article> findByIdWithCategoryAndTags(@Param("id") Long id);
    
    @Query("SELECT COUNT(a) FROM Article a WHERE a.status = :status")
    long countByStatus(@Param("status") Article.ArticleStatus status);
    
    @Query(value = "SELECT * FROM articles WHERE status = 'PUBLISHED' ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<Article> findTopPublished(@Param("limit") int limit);
    
    @Query("SELECT COALESCE(SUM(a.viewCount), 0) FROM Article a")
    long sumViewCount();
    
    // 热门文章（按浏览量排序）
    @Query("SELECT a FROM Article a WHERE a.status = 'PUBLISHED' ORDER BY a.viewCount DESC LIMIT :limit")
    List<Article> findTopByViewCount(@Param("limit") int limit);
    
    // 最近文章（按创建时间排序）
    @Query("SELECT a FROM Article a ORDER BY a.createdAt DESC LIMIT :limit")
    List<Article> findRecentArticles(@Param("limit") int limit);
    
    // 按分类统计文章数
    @Query("SELECT c.id, c.name, c.slug, COUNT(a) FROM Category c LEFT JOIN c.articles a GROUP BY c.id, c.name, c.slug ORDER BY COUNT(a) DESC")
    List<Object[]> countArticlesByCategory();
    
    // 按标签统计文章数
    @Query("SELECT t.id, t.name, t.slug, COUNT(a) FROM Tag t LEFT JOIN t.articles a GROUP BY t.id, t.name, t.slug ORDER BY COUNT(a) DESC")
    List<Object[]> countArticlesByTag();
    
    // 按分类ID统计已发布文章数
    @Query("SELECT COUNT(a) FROM Article a WHERE a.category.id = :categoryId AND a.status = 'PUBLISHED'")
    long countByCategoryIdAndPublished(@Param("categoryId") Long categoryId);
    
    // 按标签ID统计已发布文章数
    @Query("SELECT COUNT(a) FROM Article a JOIN a.tags t WHERE t.id = :tagId AND a.status = 'PUBLISHED'")
    long countByTagIdAndPublished(@Param("tagId") Long tagId);
    
    // 按状态字符串查询（用于向量化）
    @Query("SELECT a FROM Article a WHERE a.status = :status")
    List<Article> findByStatus(@Param("status") String status);
}
