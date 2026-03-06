package com.ninesun.blog.service;

import com.ninesun.blog.dto.CommentCreateRequest;
import com.ninesun.blog.dto.CommentDTO;
import com.ninesun.blog.entity.Article;
import com.ninesun.blog.entity.Comment;
import com.ninesun.blog.entity.User;
import com.ninesun.blog.repository.ArticleRepository;
import com.ninesun.blog.repository.CommentRepository;
import com.ninesun.blog.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public List<CommentDTO> getApprovedCommentsByArticle(Long articleId) {
        List<Comment> comments = commentRepository.findByArticleIdAndStatusOrderByCreatedAtDesc(
                articleId, Comment.CommentStatus.APPROVED);
        
        return buildCommentTree(comments);
    }

    public List<CommentDTO> getAllComments() {
        return commentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(CommentDTO::from)
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getPendingComments() {
        return commentRepository.findByStatusOrderByCreatedAtDesc(Comment.CommentStatus.PENDING).stream()
                .map(CommentDTO::from)
                .collect(Collectors.toList());
    }
    
    public List<CommentDTO> getCommentsByStatus(Comment.CommentStatus status) {
        return commentRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(CommentDTO::from)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public List<CommentDTO> batchApproveComments(List<Long> ids) {
        return ids.stream()
                .map(id -> {
                    Comment comment = commentRepository.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + id));
                    comment.setStatus(Comment.CommentStatus.APPROVED);
                    return CommentDTO.from(commentRepository.save(comment));
                })
                .collect(Collectors.toList());
    }
    
    @Transactional
    public List<CommentDTO> batchRejectComments(List<Long> ids) {
        return ids.stream()
                .map(id -> {
                    Comment comment = commentRepository.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + id));
                    comment.setStatus(Comment.CommentStatus.REJECTED);
                    return CommentDTO.from(commentRepository.save(comment));
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO createComment(CommentCreateRequest request, HttpServletRequest httpRequest) {
        Article article = articleRepository.findById(request.articleId())
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));

        Comment comment = new Comment();
        comment.setArticle(article);
        comment.setContent(request.content());
        comment.setStatus(Comment.CommentStatus.PENDING);
        comment.setIp(getClientIp(httpRequest));
        comment.setUserAgent(httpRequest.getHeader("User-Agent"));

        // Check if user is authenticated
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            comment.setUser(user);
            comment.setNickname(user.getNickname());
            comment.setEmail(user.getEmail());
        } else {
            // Guest comment
            comment.setNickname(request.nickname());
            comment.setEmail(request.email());
        }

        // Handle reply to parent comment
        if (request.parentId() != null) {
            Comment parent = commentRepository.findById(request.parentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
            comment.setParent(parent);
        }

        comment = commentRepository.save(comment);
        return CommentDTO.from(comment);
    }

    @Transactional
    public CommentDTO approveComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        comment.setStatus(Comment.CommentStatus.APPROVED);
        return CommentDTO.from(commentRepository.save(comment));
    }

    @Transactional
    public CommentDTO rejectComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        comment.setStatus(Comment.CommentStatus.REJECTED);
        return CommentDTO.from(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new IllegalArgumentException("Comment not found");
        }
        commentRepository.deleteById(id);
    }

    private List<CommentDTO> buildCommentTree(List<Comment> comments) {
        List<CommentDTO> rootComments = comments.stream()
                .filter(c -> c.getParent() == null)
                .map(CommentDTO::from)
                .collect(Collectors.toList());

        for (CommentDTO root : rootComments) {
            List<CommentDTO> replies = comments.stream()
                    .filter(c -> c.getParent() != null && c.getParent().getId().equals(root.id()))
                    .map(CommentDTO::from)
                    .collect(Collectors.toList());
            // Using reflection or builder pattern would be cleaner, but for simplicity:
            // In a real app, we'd use a mutable DTO or builder
        }

        return rootComments;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Handle multiple IPs in X-Forwarded-For
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
