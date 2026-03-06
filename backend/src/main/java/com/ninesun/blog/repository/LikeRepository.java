package com.ninesun.blog.repository;

import com.ninesun.blog.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    long countByArticleId(Long articleId);
    
    Optional<Like> findByArticleIdAndIp(Long articleId, String ip);
    
    boolean existsByArticleIdAndIp(Long articleId, String ip);
}