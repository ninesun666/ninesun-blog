package com.ninesun.blog.service;

import com.ninesun.blog.dto.ArticleCreateRequest;
import com.ninesun.blog.dto.ArticleDTO;
import com.ninesun.blog.dto.ArticleListDTO;
import com.ninesun.blog.dto.ArticleUpdateRequest;
import com.ninesun.blog.dto.PageResponse;
import com.ninesun.blog.entity.Article;
import com.ninesun.blog.entity.Category;
import com.ninesun.blog.entity.Tag;
import com.ninesun.blog.repository.ArticleRepository;
import com.ninesun.blog.repository.CategoryRepository;
import com.ninesun.blog.repository.TagRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {
    
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final EmbeddingService embeddingService;
    
    public PageResponse<ArticleDTO> getPublishedArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Article> articles = articleRepository.findByStatus(Article.ArticleStatus.PUBLISHED, pageable);
        return PageResponse.of(articles.map(this::toDTO));
    }
    
    public PageResponse<ArticleDTO> getAllArticles(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Article> articles;
        
        if (status != null && !status.isEmpty()) {
            Article.ArticleStatus articleStatus = Article.ArticleStatus.valueOf(status.toUpperCase());
            articles = articleRepository.findByStatus(articleStatus, pageable);
        } else {
            articles = articleRepository.findAll(pageable);
        }
        
        return PageResponse.of(articles.map(this::toDTO));
    }
    
    public PageResponse<ArticleDTO> getArticlesByCategory(String categorySlug, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Article> articles = articleRepository.findByCategorySlugAndStatus(categorySlug, Article.ArticleStatus.PUBLISHED, pageable);
        return PageResponse.of(articles.map(this::toDTO));
    }
    
    public PageResponse<ArticleDTO> getArticlesByTag(String tagSlug, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Article> articles = articleRepository.findByTagSlugAndStatus(tagSlug, Article.ArticleStatus.PUBLISHED, pageable);
        return PageResponse.of(articles.map(this::toDTO));
    }
    
    /**
     * 获取所有已发布文章列表（用于侧边栏目录）
     */
    public List<ArticleListDTO> getAllPublishedArticles() {
        return articleRepository.findAllPublishedWithCategory().stream()
                .map(this::toListDTO)
                .collect(Collectors.toList());
    }
    
    private ArticleListDTO toListDTO(Article article) {
        return ArticleListDTO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .categoryId(article.getCategory() != null ? article.getCategory().getId() : null)
                .categoryName(article.getCategory() != null ? article.getCategory().getName() : null)
                .categorySlug(article.getCategory() != null ? article.getCategory().getSlug() : null)
                .createdAt(article.getCreatedAt().toLocalDate())
                .build();
    }
    
    public ArticleDTO getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlugWithCategoryAndTags(slug)
            .orElseThrow(() -> new EntityNotFoundException("文章不存在: " + slug));
        return toDTO(article);
    }
    
    public ArticleDTO getArticleById(Long id) {
        Article article = articleRepository.findByIdWithCategoryAndTags(id)
            .orElseThrow(() -> new EntityNotFoundException("文章不存在: " + id));
        return toDTO(article);
    }
    
    @Transactional
    public ArticleDTO createArticle(ArticleCreateRequest request) {
        Article article = new Article();
        article.setTitle(request.title());
        article.setSlug(generateSlug(request.slug(), request.title()));
        article.setSummary(request.summary());
        article.setContent(request.content());
        article.setCoverImage(request.coverImage());
        article.setStatus(StringUtils.hasText(request.status()) ? 
            Article.ArticleStatus.valueOf(request.status()) : Article.ArticleStatus.DRAFT);
        article.setAllowComment(request.allowComment() != null ? request.allowComment() : true);
        
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("分类不存在: " + request.categoryId()));
            article.setCategory(category);
        }
        
        if (request.tagIds() != null && !request.tagIds().isEmpty()) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.tagIds()));
            article.setTags(tags);
        }
        
        Article saved = articleRepository.save(article);
        
        // 异步生成向量
        if (saved.getStatus() == Article.ArticleStatus.PUBLISHED) {
            embeddingService.generateAndStoreEmbedding(saved.getId());
        }
        
        return toDTO(saved);
    }
    
    @Transactional
    public ArticleDTO updateArticle(Long id, ArticleUpdateRequest request) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("文章不存在: " + id));
        
        if (request.title() != null) {
            article.setTitle(request.title());
        }
        if (request.slug() != null) {
            article.setSlug(request.slug());
        }
        if (request.summary() != null) {
            article.setSummary(request.summary());
        }
        if (request.content() != null) {
            article.setContent(request.content());
        }
        if (request.coverImage() != null) {
            article.setCoverImage(request.coverImage());
        }
        if (request.status() != null) {
            article.setStatus(Article.ArticleStatus.valueOf(request.status()));
        }
        if (request.allowComment() != null) {
            article.setAllowComment(request.allowComment());
        }
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("分类不存在: " + request.categoryId()));
            article.setCategory(category);
        }
        if (request.tagIds() != null) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.tagIds()));
            article.setTags(tags);
        }
        
        Article saved = articleRepository.save(article);
        
        // 异步更新向量
        if (saved.getStatus() == Article.ArticleStatus.PUBLISHED) {
            embeddingService.generateAndStoreEmbedding(saved.getId());
        }
        
        return toDTO(saved);
    }
    
    @Transactional
    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }
    
    @Transactional
    public void incrementViewCount(Long id) {
        articleRepository.findById(id).ifPresent(article -> {
            article.setViewCount(article.getViewCount() + 1);
            articleRepository.save(article);
        });
    }
    
    private String generateSlug(String slug, String title) {
        if (StringUtils.hasText(slug)) {
            return slug;
        }
        return title.toLowerCase()
            .replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "-")
            .replaceAll("^-|-$", "");
    }
    
    private ArticleDTO toDTO(Article article) {
        ArticleDTO.CategoryDTO categoryDTO = article.getCategory() != null ?
            new ArticleDTO.CategoryDTO(
                article.getCategory().getId(),
                article.getCategory().getName(),
                article.getCategory().getSlug()
            ) : null;
        
        Set<ArticleDTO.TagDTO> tagDTOs = article.getTags() != null ?
            article.getTags().stream()
                .map(t -> new ArticleDTO.TagDTO(t.getId(), t.getName(), t.getSlug()))
                .collect(Collectors.toSet()) :
            Set.of();
        
        return new ArticleDTO(
            article.getId(),
            article.getTitle(),
            article.getSlug(),
            article.getSummary(),
            article.getContent(),
            article.getCoverImage(),
            categoryDTO,
            tagDTOs,
            article.getViewCount(),
            article.getLikeCount(),
            article.getCommentCount(),
            article.getStatus().name(),
            article.getAllowComment(),
            article.getCreatedAt(),
            article.getUpdatedAt()
        );
    }
}
