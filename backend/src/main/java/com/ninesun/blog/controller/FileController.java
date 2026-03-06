package com.ninesun.blog.controller;

import com.ninesun.blog.service.FileUploadService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileUploadService fileUploadService;

    public FileController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileUploadService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            response.put("success", "true");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("success", "false");
            return ResponseEntity.badRequest().body(error);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "文件上传失败: " + e.getMessage());
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
