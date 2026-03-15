package com.ninesun.blog.service;

import com.ninesun.blog.entity.Attachment;
import com.ninesun.blog.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {
    
    private final AttachmentRepository attachmentRepository;
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    // 允许的文件扩展名
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "pdf", "zip", "rar", "7z",
        "doc", "docx", "xls", "xlsx", "ppt", "pptx",
        "txt", "md", "csv",
        "jpg", "jpeg", "png", "gif", "webp", "svg"
    );
    
    // 最大文件大小 20MB
    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024;
    
    /**
     * 上传附件
     */
    @Transactional
    public Attachment uploadAttachment(Long articleId, MultipartFile file) throws IOException {
        // 验证文件
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("文件大小不能超过 20MB");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("文件名不能为空");
        }
        
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("不支持的文件格式: " + extension);
        }
        
        // 生成存储文件名
        String storedFilename = UUID.randomUUID().toString() + "." + extension;
        
        // 创建附件目录
        Path attachmentDir = Paths.get(uploadDir, "attachments");
        if (!Files.exists(attachmentDir)) {
            Files.createDirectories(attachmentDir);
        }
        
        // 保存文件
        Path filePath = attachmentDir.resolve(storedFilename);
        file.transferTo(filePath.toFile());
        
        // 创建附件记录
        Attachment attachment = Attachment.builder()
            .articleId(articleId)
            .filename(originalFilename)
            .storedFilename(storedFilename)
            .filePath(filePath.toString())
            .fileSize(file.getSize())
            .contentType(file.getContentType())
            .downloadCount(0)
            .build();
        
        return attachmentRepository.save(attachment);
    }
    
    /**
     * 获取文章的所有附件
     */
    public List<Attachment> getAttachmentsByArticleId(Long articleId) {
        return attachmentRepository.findByArticleIdOrderByCreatedAtDesc(articleId);
    }
    
    /**
     * 下载附件
     */
    @Transactional
    public Resource downloadAttachment(Long id) throws MalformedURLException {
        Attachment attachment = attachmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("附件不存在"));
        
        Path filePath = Paths.get(attachment.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        
        if (!resource.exists()) {
            throw new IllegalArgumentException("文件不存在");
        }
        
        // 增加下载次数
        attachment.setDownloadCount(attachment.getDownloadCount() + 1);
        attachmentRepository.save(attachment);
        
        return resource;
    }
    
    /**
     * 获取附件信息
     */
    public Attachment getAttachment(Long id) {
        return attachmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("附件不存在"));
    }
    
    /**
     * 删除附件
     */
    @Transactional
    public void deleteAttachment(Long id) throws IOException {
        Attachment attachment = attachmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("附件不存在"));
        
        // 删除物理文件
        Path filePath = Paths.get(attachment.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
        
        // 删除数据库记录
        attachmentRepository.delete(attachment);
    }
    
    /**
     * 删除文章的所有附件
     */
    @Transactional
    public void deleteAttachmentsByArticleId(Long articleId) throws IOException {
        List<Attachment> attachments = attachmentRepository.findByArticleIdOrderByCreatedAtDesc(articleId);
        
        for (Attachment attachment : attachments) {
            Path filePath = Paths.get(attachment.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        }
        
        attachmentRepository.deleteByArticleId(articleId);
    }
    
    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            return filename.substring(lastDot + 1);
        }
        return "";
    }
}
