package com.ninesun.blog.repository;

import com.ninesun.blog.entity.VisitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitLogRepository extends JpaRepository<VisitLog, Long> {
    
    /**
     * 按国家统计访问量
     */
    @Query("SELECT v.countryCode, v.country, COUNT(v) as count FROM VisitLog v " +
           "WHERE v.countryCode IS NOT NULL " +
           "GROUP BY v.countryCode, v.country " +
           "ORDER BY count DESC")
    List<Object[]> countByCountry();
    
    /**
     * 按国家统计指定时间段内的访问量
     */
    @Query("SELECT v.countryCode, v.country, COUNT(v) as count FROM VisitLog v " +
           "WHERE v.countryCode IS NOT NULL AND v.createdAt >= :startTime " +
           "GROUP BY v.countryCode, v.country " +
           "ORDER BY count DESC")
    List<Object[]> countByCountrySince(@Param("startTime") LocalDateTime startTime);
    
    /**
     * 统计指定时间段内的总访问量
     */
    @Query("SELECT COUNT(v) FROM VisitLog v WHERE v.createdAt >= :startTime")
    long countSince(@Param("startTime") LocalDateTime startTime);
    
    /**
     * 统计独立IP数
     */
    @Query("SELECT COUNT(DISTINCT v.ipAddress) FROM VisitLog v WHERE v.createdAt >= :startTime")
    long countUniqueIpSince(@Param("startTime") LocalDateTime startTime);
    
    /**
     * 获取最近访问记录
     */
    List<VisitLog> findTop100ByOrderByCreatedAtDesc();
    
    /**
     * 获取指定时间段的访问记录
     */
    List<VisitLog> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime startTime);
}
