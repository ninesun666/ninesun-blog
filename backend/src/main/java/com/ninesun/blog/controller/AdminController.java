package com.ninesun.blog.controller;

import com.ninesun.blog.dto.*;
import com.ninesun.blog.entity.Comment;
import com.ninesun.blog.entity.User;
import com.ninesun.blog.service.ArticleService;
import com.ninesun.blog.service.CategoryService;
import com.ninesun.blog.service.CommentService;
import com.ninesun.blog.service.TagService;
import com.ninesun.blog.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final TagService tagService;
    private final CommentService commentService;
    private final UserService userService;

    // ==================== Dashboard Stats ====================
    
    @GetMapping("/stats")
    public ResponseEntity<StatsDTO> getStats() {
        return ResponseEntity.ok(userService.getStats());
    }
    
    @GetMapping("/stats/detailed")
    public ResponseEntity<DetailedStatsDTO> getDetailedStats() {
        return ResponseEntity.ok(userService.getDetailedStats());
    }

    // ==================== Article Management ====================
    
    @GetMapping("/articles")
    public ResponseEntity<PageResponse<ArticleDTO>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(articleService.getAllArticles(page, size, status));
    }

    // ==================== Comment Management ====================
    
    @GetMapping("/comments")
    public ResponseEntity<List<CommentDTO>> getAllComments() {
        return ResponseEntity.ok(commentService.getAllComments());
    }

    @GetMapping("/comments/pending")
    public ResponseEntity<List<CommentDTO>> getPendingComments() {
        return ResponseEntity.ok(commentService.getPendingComments());
    }

    @GetMapping("/comments/status/{status}")
    public ResponseEntity<List<CommentDTO>> getCommentsByStatus(@PathVariable String status) {
        Comment.CommentStatus commentStatus = Comment.CommentStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(commentService.getCommentsByStatus(commentStatus));
    }

    @PostMapping("/comments/{id}/approve")
    public ResponseEntity<CommentDTO> approveComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.approveComment(id));
    }

    @PostMapping("/comments/{id}/reject")
    public ResponseEntity<CommentDTO> rejectComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.rejectComment(id));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/comments/batch-approve")
    public ResponseEntity<List<CommentDTO>> batchApproveComments(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(commentService.batchApproveComments(ids));
    }

    @PostMapping("/comments/batch-reject")
    public ResponseEntity<List<CommentDTO>> batchRejectComments(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(commentService.batchRejectComments(ids));
    }

    // ==================== User Management ====================
    
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User.UserRole role = User.UserRole.valueOf(body.get("role"));
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Site Settings ====================
    
    @GetMapping("/settings")
    public ResponseEntity<SiteSettingsDTO> getSiteSettings() {
        return ResponseEntity.ok(userService.getSiteSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<SiteSettingsDTO> updateSiteSettings(@Valid @RequestBody SiteSettingsDTO settings) {
        return ResponseEntity.ok(userService.updateSiteSettings(settings));
    }
}
