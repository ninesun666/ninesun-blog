package com.ninesun.blog.dto;

public record CountryVisitDTO(
    String countryCode,
    String country,
    long count
) {}
