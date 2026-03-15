package com.ninesun.blog.controller;

import com.ninesun.blog.entity.Attachment;
import com.ninesun.blog.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AttachmentController {
    
    private final AttachmentService attachmentService;
    
    /**
     * 上传附件 (管理员)
     */
    @PostMapping("/articles/{articleId}/attachments")
    public ResponseEntity<Attachment> uploadAttachment(
            @PathVariable Long articleId,
            @RequestParam("file") MultipartFile file) throws IOException {
        Attachment attachment = attachmentService.uploadAttachment(articleId, file);
        return ResponseEntity.ok(attachment);
    }
    
    /**
     * 获取文章的附件列表 (公开)
     */
    @GetMapping("/articles/{articleId}/attachments")
    public ResponseEntity<List<Attachment>> getAttachments(@PathVariable Long articleId) {
        List<Attachment> attachments = attachmentService.getAttachmentsByArticleId(articleId);
        return ResponseEntity.ok(attachments);
    }
    
    /**
     * 下载附件 (需登录)
     */
    @GetMapping("/attachments/{id}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) {
        try {
            Attachment attachment = attachmentService.getAttachment(id);
            Resource resource = attachmentService.downloadAttachment(id);
            
            // 编码文件名，支持中文
            String encodedFilename = URLEncoder.encode(attachment.getFilename(), StandardCharsets.UTF_8)
                .replace("+", "%20");
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType() != null 
                    ? attachment.getContentType() 
                    : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename*=UTF-8''" + encodedFilename)
                .body(resource);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 删除附件 (管理员)
     */
    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<Map<String, String>> deleteAttachment(@PathVariable Long id) {
        try {
            attachmentService.deleteAttachment(id);
            return ResponseEntity.ok(Map.of("message", "删除成功"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "删除失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取附件信息
     */
    @GetMapping("/attachments/{id}")
    public ResponseEntity<Attachment> getAttachment(@PathVariable Long id) {
        Attachment attachment = attachmentService.getAttachment(id);
        return ResponseEntity.ok(attachment);
    }
}
