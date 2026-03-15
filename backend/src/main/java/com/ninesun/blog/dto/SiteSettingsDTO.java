package com.ninesun.blog.dto;

public record SiteSettingsDTO(
        String siteName,
        String siteDescription,
        String siteKeywords,
        String footerText,
        String socialGithub,
        String socialTwitter,
        String socialEmail,
        boolean allowGuestComment,
        boolean requireCommentApproval,
        boolean autoSyncToTwitter,
        String twitterSyncFormat
) {
}
