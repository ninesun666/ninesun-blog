package com.ninesun.blog.service;

import com.ninesun.blog.dto.TagCreateRequest;
import com.ninesun.blog.dto.TagDTO;
import com.ninesun.blog.entity.Tag;
import com.ninesun.blog.repository.TagRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {
    
    private final TagRepository tagRepository;
    
    public List<TagDTO> getAllTags() {
        return tagRepository.findAllByOrderByNameAsc().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    public TagDTO getTagBySlug(String slug) {
        Tag tag = tagRepository.findBySlug(slug)
            .orElseThrow(() -> new EntityNotFoundException("标签不存在: " + slug));
        return toDTO(tag);
    }
    
    @Transactional
    public TagDTO createTag(TagCreateRequest request) {
        Tag tag = new Tag();
        tag.setName(request.name());
        tag.setSlug(generateSlug(request.slug(), request.name()));
        
        return toDTO(tagRepository.save(tag));
    }
    
    @Transactional
    public TagDTO updateTag(Long id, TagCreateRequest request) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("标签不存在: " + id));
        
        if (request.name() != null) {
            tag.setName(request.name());
        }
        if (request.slug() != null) {
            tag.setSlug(request.slug());
        }
        
        return toDTO(tagRepository.save(tag));
    }
    
    @Transactional
    public void deleteTag(Long id) {
        tagRepository.deleteById(id);
    }
    
    private String generateSlug(String slug, String name) {
        if (StringUtils.hasText(slug)) {
            return slug;
        }
        return name.toLowerCase()
            .replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "-")
            .replaceAll("^-|-$", "");
    }
    
    private TagDTO toDTO(Tag tag) {
        long articleCount = tag.getArticles() != null ? tag.getArticles().size() : 0;
        
        return new TagDTO(
            tag.getId(),
            tag.getName(),
            tag.getSlug(),
            articleCount,
            tag.getCreatedAt()
        );
    }
}
