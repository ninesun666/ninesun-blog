package com.ninesun.blog.controller;

import com.ninesun.blog.dto.CommentCreateRequest;
import com.ninesun.blog.dto.CommentDTO;
import com.ninesun.blog.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<CommentDTO>> getArticleComments(@PathVariable Long articleId) {
        return ResponseEntity.ok(commentService.getApprovedCommentsByArticle(articleId));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @Valid @RequestBody CommentCreateRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(commentService.createComment(request, httpRequest));
    }

    // Admin endpoints
    @GetMapping("/pending")
    public ResponseEntity<List<CommentDTO>> getPendingComments() {
        return ResponseEntity.ok(commentService.getPendingComments());
    }

    @GetMapping("/all")
    public ResponseEntity<List<CommentDTO>> getAllComments() {
        return ResponseEntity.ok(commentService.getAllComments());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<CommentDTO> approveComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.approveComment(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<CommentDTO> rejectComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.rejectComment(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
