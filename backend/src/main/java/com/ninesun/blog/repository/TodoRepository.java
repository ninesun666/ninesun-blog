package com.ninesun.blog.repository;

import com.ninesun.blog.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    
    List<Todo> findByTodoDateOrderByCreatedAtAsc(LocalDate todoDate);
    
    List<Todo> findByTodoDateBetweenOrderByTodoDateAscCreatedAtAsc(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t.todoDate, COUNT(t) FROM Todo t WHERE t.todoDate BETWEEN :startDate AND :endDate GROUP BY t.todoDate")
    List<Object[]> countByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t.todoDate, COUNT(t) FROM Todo t WHERE t.todoDate BETWEEN :startDate AND :endDate AND t.completed = true GROUP BY t.todoDate")
    List<Object[]> countCompletedByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    void deleteById(Long id);
}
