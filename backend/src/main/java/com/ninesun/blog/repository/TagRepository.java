package com.ninesun.blog.repository;

import com.ninesun.blog.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    
    Optional<Tag> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    List<Tag> findAllByOrderByNameAsc();
}
