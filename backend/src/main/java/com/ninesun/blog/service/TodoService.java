package com.ninesun.blog.service;

import com.ninesun.blog.dto.TodoCreateRequest;
import com.ninesun.blog.dto.TodoDTO;
import com.ninesun.blog.dto.TodoUpdateRequest;
import com.ninesun.blog.entity.Todo;
import com.ninesun.blog.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TodoService {
    
    private final TodoRepository todoRepository;
    
    public List<TodoDTO> getTodosByDate(LocalDate date) {
        return todoRepository.findByTodoDateOrderByCreatedAtAsc(date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<TodoDTO> getTodosByDateRange(LocalDate startDate, LocalDate endDate) {
        return todoRepository.findByTodoDateBetweenOrderByTodoDateAscCreatedAtAsc(startDate, endDate).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public Map<LocalDate, Map<String, Integer>> getTodoStatsByMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Object[]> counts = todoRepository.countByDateRange(startDate, endDate);
        List<Object[]> completedCounts = todoRepository.countCompletedByDateRange(startDate, endDate);
        
        Map<LocalDate, Integer> totalMap = new HashMap<>();
        Map<LocalDate, Integer> completedMap = new HashMap<>();
        
        for (Object[] row : counts) {
            totalMap.put((LocalDate) row[0], ((Number) row[1]).intValue());
        }
        
        for (Object[] row : completedCounts) {
            completedMap.put((LocalDate) row[0], ((Number) row[1]).intValue());
        }
        
        Map<LocalDate, Map<String, Integer>> result = new HashMap<>();
        for (LocalDate date : totalMap.keySet()) {
            Map<String, Integer> stats = new HashMap<>();
            stats.put("total", totalMap.get(date));
            stats.put("completed", completedMap.getOrDefault(date, 0));
            result.put(date, stats);
        }
        
        return result;
    }
    
    public TodoDTO getTodoById(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("待办不存在: " + id));
        return toDTO(todo);
    }
    
    @Transactional
    public TodoDTO createTodo(TodoCreateRequest request) {
        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setTodoDate(request.getTodoDate());
        todo.setTimeSlot(request.getTimeSlot() != null ? request.getTimeSlot() : 1);
        todo.setCompleted(false);
        
        Todo saved = todoRepository.save(todo);
        return toDTO(saved);
    }
    
    @Transactional
    public TodoDTO updateTodo(Long id, TodoUpdateRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("待办不存在: " + id));
        
        if (request.getTitle() != null) {
            todo.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            todo.setDescription(request.getDescription());
        }
        if (request.getTodoDate() != null) {
            todo.setTodoDate(request.getTodoDate());
        }
        if (request.getTimeSlot() != null) {
            todo.setTimeSlot(request.getTimeSlot());
        }
        
        Todo saved = todoRepository.save(todo);
        return toDTO(saved);
    }
    
    @Transactional
    public TodoDTO toggleComplete(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("待办不存在: " + id));
        
        boolean newCompleted = !todo.getCompleted();
        todo.setCompleted(newCompleted);
        todo.setCompletedAt(newCompleted ? LocalDateTime.now() : null);
        
        Todo saved = todoRepository.save(todo);
        return toDTO(saved);
    }
    
    @Transactional
    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new RuntimeException("待办不存在: " + id);
        }
        todoRepository.deleteById(id);
    }
    
    private TodoDTO toDTO(Todo todo) {
        return TodoDTO.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .description(todo.getDescription())
                .todoDate(todo.getTodoDate())
                .timeSlot(todo.getTimeSlot())
                .completed(todo.getCompleted())
                .completedAt(todo.getCompletedAt())
                .createdAt(todo.getCreatedAt())
                .updatedAt(todo.getUpdatedAt())
                .build();
    }
}
