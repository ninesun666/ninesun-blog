package com.ninesun.blog.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodoUpdateRequest {
    @Size(max = 200, message = "标题长度不能超过200字符")
    private String title;
    
    private String description;
    
    private LocalDate todoDate;
}
