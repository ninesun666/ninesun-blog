package com.ninesun.blog.controller;

import com.ninesun.blog.service.SeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seo")
@RequiredArgsConstructor
public class SeoController {

    private final SeoService seoService;

    /**
     * 生成 sitemap.xml
     */
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getSitemap() {
        String sitemap = seoService.generateSitemap();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(sitemap);
    }

    /**
     * 生成 robots.txt
     */
    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getRobots() {
        String robots = seoService.generateRobots();
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(robots);
    }
}
