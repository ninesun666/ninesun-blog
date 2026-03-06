package com.ninesun.blog.dto;

import java.time.LocalDateTime;

public record StatsDTO(
        long totalArticles,
        long publishedArticles,
        long draftArticles,
        long totalCategories,
        long totalTags,
        long totalComments,
        long pendingComments,
        long approvedComments,
        long totalUsers,
        long adminCount,
        long totalViews,
        long totalLikes,
        LocalDateTime lastUpdated
) {
    public static StatsDTO of(
            long totalArticles,
            long publishedArticles,
            long draftArticles,
            long totalCategories,
            long totalTags,
            long totalComments,
            long pendingComments,
            long approvedComments,
            long totalUsers,
            long adminCount,
            long totalViews,
            long totalLikes
    ) {
        return new StatsDTO(
                totalArticles, publishedArticles, draftArticles,
                totalCategories, totalTags,
                totalComments, pendingComments, approvedComments,
                totalUsers, adminCount,
                totalViews, totalLikes,
                LocalDateTime.now()
        );
    }
}
