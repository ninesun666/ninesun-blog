package com.ninesun.blog.controller;

import com.ninesun.blog.service.FileUploadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileUploadService fileUploadService;

    public FileController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        log.info("收到文件上传请求: {}, 大小: {}", file.getOriginalFilename(), file.getSize());
        try {
            String url = fileUploadService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            response.put("success", "true");
            log.info("文件上传成功: {}", url);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("文件上传失败(参数错误): {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("success", "false");
            return ResponseEntity.badRequest().body(error);
        } catch (IOException e) {
            log.error("文件上传失败(IO错误): {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "文件上传失败: " + e.getMessage());
            error.put("success", "false");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            log.error("文件上传失败(未知错误): {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "服务器内部错误: " + e.getMessage());
            error.put("success", "false");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            byte[] fileContent = fileUploadService.getFile(filename);
            String contentType = fileUploadService.getContentType(filename);
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setCacheControl("public, max-age=31536000");
            
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{filename}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String filename) {
        try {
            boolean deleted = fileUploadService.deleteFile(filename);
            Map<String, String> response = new HashMap<>();
            if (deleted) {
                response.put("success", "true");
                response.put("message", "文件已删除");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", "false");
                response.put("error", "文件不存在");
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "删除失败: " + e.getMessage());
            error.put("success", "false");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
