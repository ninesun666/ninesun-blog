package com.ninesun.blog.repository;

import com.ninesun.blog.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    
    /**
     * 根据文章ID获取所有附件
     */
    List<Attachment> findByArticleIdOrderByCreatedAtDesc(Long articleId);
    
    /**
     * 根据文章ID删除所有附件
     */
    void deleteByArticleId(Long articleId);
    
    /**
     * 统计文章附件数量
     */
    long countByArticleId(Long articleId);
}
