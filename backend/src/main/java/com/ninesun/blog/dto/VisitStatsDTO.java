package com.ninesun.blog.dto;

public record VisitStatsDTO(
    long totalVisits,
    long todayVisits,
    long weekVisits,
    long monthVisits,
    long uniqueVisitors,
    long todayUniqueVisitors
) {}
