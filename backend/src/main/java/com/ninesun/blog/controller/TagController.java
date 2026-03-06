package com.ninesun.blog.controller;

import com.ninesun.blog.dto.TagCreateRequest;
import com.ninesun.blog.dto.TagDTO;
import com.ninesun.blog.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {
    
    private final TagService tagService;
    
    @GetMapping
    public ResponseEntity<List<TagDTO>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }
    
    @GetMapping("/{slug}")
    public ResponseEntity<TagDTO> getTag(@PathVariable String slug) {
        return ResponseEntity.ok(tagService.getTagBySlug(slug));
    }
    
    @PostMapping
    public ResponseEntity<TagDTO> createTag(@Valid @RequestBody TagCreateRequest request) {
        TagDTO tag = tagService.createTag(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tag);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TagDTO> updateTag(
        @PathVariable Long id,
        @Valid @RequestBody TagCreateRequest request
    ) {
        TagDTO tag = tagService.updateTag(id, request);
        return ResponseEntity.ok(tag);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
