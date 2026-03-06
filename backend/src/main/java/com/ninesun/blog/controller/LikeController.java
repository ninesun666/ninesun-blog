package com.ninesun.blog.controller;

import com.ninesun.blog.dto.LikeDTO;
import com.ninesun.blog.service.LikeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @GetMapping("/article/{articleId}/count")
    public ResponseEntity<LikeDTO> getLikeCount(
            @PathVariable Long articleId,
            HttpServletRequest request) {
        return ResponseEntity.ok(likeService.getLikeInfo(articleId, request));
    }

    @PostMapping("/article/{articleId}/toggle")
    public ResponseEntity<LikeDTO> toggleLike(
            @PathVariable Long articleId,
            HttpServletRequest request) {
        return ResponseEntity.ok(likeService.toggleLike(articleId, request));
    }
}
