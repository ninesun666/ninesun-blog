package com.ninesun.blog.controller;

import com.ninesun.blog.dto.TodoCreateRequest;
import com.ninesun.blog.dto.TodoDTO;
import com.ninesun.blog.dto.TodoUpdateRequest;
import com.ninesun.blog.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {
    
    private final TodoService todoService;
    
    @GetMapping
    public ResponseEntity<List<TodoDTO>> getTodos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (date != null) {
            return ResponseEntity.ok(todoService.getTodosByDate(date));
        } else if (startDate != null && endDate != null) {
            return ResponseEntity.ok(todoService.getTodosByDateRange(startDate, endDate));
        } else {
            return ResponseEntity.ok(todoService.getTodosByDate(LocalDate.now()));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<LocalDate, Map<String, Integer>>> getStats(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(todoService.getTodoStatsByMonth(year, month));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TodoDTO> getTodo(@PathVariable Long id) {
        return ResponseEntity.ok(todoService.getTodoById(id));
    }
    
    @PostMapping
    public ResponseEntity<TodoDTO> createTodo(@Valid @RequestBody TodoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(todoService.createTodo(request));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TodoDTO> updateTodo(@PathVariable Long id, @Valid @RequestBody TodoUpdateRequest request) {
        return ResponseEntity.ok(todoService.updateTodo(id, request));
    }
    
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TodoDTO> toggleComplete(@PathVariable Long id) {
        return ResponseEntity.ok(todoService.toggleComplete(id));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
}
