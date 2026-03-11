package com.ninesun.blog.dto;

public record RecentVisitDTO(
    String ipAddress,
    String country,
    String city,
    String path,
    String userAgent,
    String createdAt,
    Boolean isAdmin
) {}
