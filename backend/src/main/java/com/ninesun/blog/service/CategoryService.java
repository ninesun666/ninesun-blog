package com.ninesun.blog.service;

import com.ninesun.blog.dto.CategoryCreateRequest;
import com.ninesun.blog.dto.CategoryDTO;
import com.ninesun.blog.entity.Category;
import com.ninesun.blog.repository.ArticleRepository;
import com.ninesun.blog.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllOrderBySortOrder().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    public CategoryDTO getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new EntityNotFoundException("分类不存在: " + slug));
        return toDTO(category);
    }
    
    @Transactional
    public CategoryDTO createCategory(CategoryCreateRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setSlug(generateSlug(request.slug(), request.name()));
        category.setDescription(request.description());
        category.setIcon(request.icon());
        category.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        
        return toDTO(categoryRepository.save(category));
    }
    
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryCreateRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("分类不存在: " + id));
        
        if (request.name() != null) {
            category.setName(request.name());
        }
        if (request.slug() != null) {
            category.setSlug(request.slug());
        }
        if (request.description() != null) {
            category.setDescription(request.description());
        }
        if (request.icon() != null) {
            category.setIcon(request.icon());
        }
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }
        
        return toDTO(categoryRepository.save(category));
    }
    
    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
    
    private String generateSlug(String slug, String name) {
        if (StringUtils.hasText(slug)) {
            return slug;
        }
        return name.toLowerCase()
            .replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "-")
            .replaceAll("^-|-$", "");
    }
    
    private CategoryDTO toDTO(Category category) {
        long articleCount = articleRepository.countByStatus(com.ninesun.blog.entity.Article.ArticleStatus.PUBLISHED);
        
        return new CategoryDTO(
            category.getId(),
            category.getName(),
            category.getSlug(),
            category.getDescription(),
            category.getIcon(),
            category.getSortOrder(),
            articleCount,
            category.getCreatedAt()
        );
    }
}
