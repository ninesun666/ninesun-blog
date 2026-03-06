package com.ninesun.blog.service;

import com.ninesun.blog.dto.SiteSettingsDTO;
import com.ninesun.blog.entity.Article;
import com.ninesun.blog.entity.Category;
import com.ninesun.blog.entity.Tag;
import com.ninesun.blog.repository.ArticleRepository;
import com.ninesun.blog.repository.CategoryRepository;
import com.ninesun.blog.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeoService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserService userService;

    @Value("${app.site-url:http://localhost:8999}")
    private String siteUrl;

    private static final DateTimeFormatter W3C_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 生成 sitemap.xml
     */
    public String generateSitemap() {
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // 首页
        sb.append(createUrlEntry(siteUrl + "/", "1.0", "daily"));

        // 文章列表页
        sb.append(createUrlEntry(siteUrl + "/articles", "0.9", "daily"));

        // 已发布的文章
        List<Article> articles = articleRepository.findTopPublished(1000);
        for (Article article : articles) {
            String lastmod = article.getUpdatedAt() != null 
                    ? article.getUpdatedAt().format(W3C_DATE_FORMAT)
                    : article.getCreatedAt().format(W3C_DATE_FORMAT);
            sb.append(createUrlEntry(
                    siteUrl + "/article/" + article.getSlug(),
                    "0.8",
                    lastmod
            ));
        }

        // 分类页
        List<Category> categories = categoryRepository.findAll();
        for (Category category : categories) {
            sb.append(createUrlEntry(
                    siteUrl + "/category/" + category.getSlug(),
                    "0.7",
                    "weekly"
            ));
        }

        // 标签页
        List<Tag> tags = tagRepository.findAll();
        for (Tag tag : tags) {
            sb.append(createUrlEntry(
                    siteUrl + "/tag/" + tag.getSlug(),
                    "0.6",
                    "weekly"
            ));
        }

        sb.append("</urlset>");
        return sb.toString();
    }

    /**
     * 生成 robots.txt
     */
    public String generateRobots() {
        StringBuilder sb = new StringBuilder();
        sb.append("User-agent: *\n");
        sb.append("Allow: /\n");
        sb.append("Disallow: /admin/\n");
        sb.append("Disallow: /login\n");
        sb.append("\n");
        sb.append("Sitemap: ").append(siteUrl).append("/api/seo/sitemap.xml\n");
        return sb.toString();
    }

    private String createUrlEntry(String loc, String priority, String changefreq) {
        return String.format(
                "  <url>\n" +
                "    <loc>%s</loc>\n" +
                "    <priority>%s</priority>\n" +
                "    <changefreq>%s</changefreq>\n" +
                "  </url>\n",
                loc, priority, changefreq
        );
    }
}
