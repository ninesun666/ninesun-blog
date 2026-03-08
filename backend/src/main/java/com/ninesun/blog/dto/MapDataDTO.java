package com.ninesun.blog.dto;

import java.math.BigDecimal;

public record MapDataDTO(
    String name,
    String countryCode,
    long value,
    BigDecimal latitude,
    BigDecimal longitude
) {}
