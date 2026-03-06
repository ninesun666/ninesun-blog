package com.ninesun.blog.repository;

import com.ninesun.blog.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByArticleIdAndStatusOrderByCreatedAtDesc(Long articleId, Comment.CommentStatus status);
    
    List<Comment> findByStatusOrderByCreatedAtDesc(Comment.CommentStatus status);
    
    List<Comment> findAllByOrderByCreatedAtDesc();
    
    long countByArticleIdAndStatus(Long articleId, Comment.CommentStatus status);
    
    long countByStatus(Comment.CommentStatus status);
}