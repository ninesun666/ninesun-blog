package com.ninesun.blog.dto;

/**
 * Twitter 同步结果 DTO
 */
public record TwitterSyncResultDTO(
    boolean success,
    String tweetId,
    String tweetUrl,
    String postedAt,
    String errorMessage
) {
    public static TwitterSyncResultDTO success(String tweetId, String tweetUrl, String postedAt) {
        return new TwitterSyncResultDTO(true, tweetId, tweetUrl, postedAt, null);
    }
    
    public static TwitterSyncResultDTO failure(String errorMessage) {
        return new TwitterSyncResultDTO(false, null, null, null, errorMessage);
    }
}
