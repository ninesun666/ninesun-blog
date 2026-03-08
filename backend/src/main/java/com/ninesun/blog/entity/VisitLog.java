package com.ninesun.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "visit_logs", indexes = {
    @Index(name = "idx_visit_logs_created_at", columnList = "createdAt"),
    @Index(name = "idx_visit_logs_country_code", columnList = "countryCode")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;
    
    @Column(name = "country", length = 100)
    private String country;
    
    @Column(name = "country_code", length = 10)
    private String countryCode;
    
    @Column(name = "city", length = 100)
    private String city;
    
    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;
    
    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "path", length = 500)
    private String path;
    
    @Column(name = "article_id")
    private Long articleId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
