package com.ninesun.blog.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileUploadService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.site-url:http://localhost:8999}")
    private String siteUrl;

    public String uploadImage(MultipartFile file) throws IOException {
        log.info("开始上传文件: {}, 大小: {} bytes, 类型: {}", 
            file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        if (file.isEmpty()) {
            log.error("文件为空");
            throw new IllegalArgumentException("文件不能为空");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.error("文件类型不支持: {}", contentType);
            throw new IllegalArgumentException("只支持图片文件");
        }

        // 检查文件类型
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        if (!isValidImageExtension(extension)) {
            log.error("不支持的图片格式: {}", extension);
            throw new IllegalArgumentException("不支持的图片格式: " + extension);
        }

        // 创建上传目录
        Path uploadPath = Paths.get(uploadDir);
        log.info("上传目录: {} (绝对路径: {})", uploadPath, uploadPath.toAbsolutePath());
        
        if (!Files.exists(uploadPath)) {
            log.info("创建上传目录: {}", uploadPath.toAbsolutePath());
            try {
                Files.createDirectories(uploadPath);
            } catch (IOException e) {
                log.error("创建目录失败: {}", e.getMessage(), e);
                throw e;
            }
        }

        // 检查目录权限
        if (!Files.isWritable(uploadPath)) {
            log.error("目录不可写: {}", uploadPath.toAbsolutePath());
            throw new IOException("上传目录不可写: " + uploadPath.toAbsolutePath());
        }

        // 生成唯一文件名
        String newFilename = UUID.randomUUID().toString() + "." + extension;
        Path filePath = uploadPath.resolve(newFilename);
        log.info("目标文件路径: {}", filePath.toAbsolutePath());

        // 保存文件
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("文件保存成功: {}", filePath.toAbsolutePath());
        } catch (IOException e) {
            log.error("文件保存失败: {}", e.getMessage(), e);
            throw e;
        }

        String url = "/api/files/" + newFilename;
        log.info("返回文件URL: {}", url);
        return url;
    }

    public byte[] getFile(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        log.info("读取文件: {}, 绝对路径: {}", filePath, filePath.toAbsolutePath());
        if (!Files.exists(filePath)) {
            log.error("文件不存在: {}", filePath.toAbsolutePath());
            throw new IOException("文件不存在: " + filename);
        }
        log.info("文件存在，正在读取: {}", filePath.toAbsolutePath());
        return Files.readAllBytes(filePath);
    }

    public String getContentType(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        return Files.probeContentType(filePath);
    }

    public boolean deleteFile(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        return Files.deleteIfExists(filePath);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isValidImageExtension(String extension) {
        return extension.equals("jpg") || extension.equals("jpeg") 
            || extension.equals("png") || extension.equals("gif")
            || extension.equals("webp") || extension.equals("svg");
    }
}
