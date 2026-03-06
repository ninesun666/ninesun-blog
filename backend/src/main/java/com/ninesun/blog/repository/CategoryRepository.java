package com.ninesun.blog.repository;

import com.ninesun.blog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    @Query("SELECT c FROM Category c ORDER BY c.sortOrder ASC")
    List<Category> findAllOrderBySortOrder();
    
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.articles WHERE c.id = :id")
    Optional<Category> findByIdWithArticles(Long id);
}
