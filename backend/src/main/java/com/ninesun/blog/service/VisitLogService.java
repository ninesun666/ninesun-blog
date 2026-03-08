package com.ninesun.blog.service;

import com.ninesun.blog.dto.CountryVisitDTO;
import com.ninesun.blog.dto.MapDataDTO;
import com.ninesun.blog.dto.RecentVisitDTO;
import com.ninesun.blog.dto.VisitStatsDTO;
import com.ninesun.blog.entity.VisitLog;
import com.ninesun.blog.repository.VisitLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VisitLogService {
    
    private final VisitLogRepository visitLogRepository;
    private final GeoIpService geoIpService;
    
    // 国家代码到国家名的映射（用于缺失的情况）
    private static final Map<String, String> COUNTRY_NAMES = Map.ofEntries(
        Map.entry("CN", "中国"),
        Map.entry("US", "美国"),
        Map.entry("JP", "日本"),
        Map.entry("KR", "韩国"),
        Map.entry("GB", "英国"),
        Map.entry("DE", "德国"),
        Map.entry("FR", "法国"),
        Map.entry("CA", "加拿大"),
        Map.entry("AU", "澳大利亚"),
        Map.entry("SG", "新加坡"),
        Map.entry("HK", "香港"),
        Map.entry("TW", "台湾"),
        Map.entry("RU", "俄罗斯"),
        Map.entry("IN", "印度"),
        Map.entry("BR", "巴西"),
        Map.entry("IT", "意大利"),
        Map.entry("ES", "西班牙"),
        Map.entry("NL", "荷兰"),
        Map.entry("SE", "瑞典"),
        Map.entry("CH", "瑞士")
    );
    
    @Async
    @Transactional
    public void logVisit(String ipAddress, String userAgent, String path, Long articleId) {
        try {
            VisitLog.VisitLogBuilder builder = VisitLog.builder()
                .ipAddress(ipAddress)
                .userAgent(truncate(userAgent, 500))
                .path(truncate(path, 500))
                .articleId(articleId);
            
            // 解析IP地理位置
            geoIpService.getLocation(ipAddress).ifPresent(loc -> {
                builder.country(loc.country())
                       .countryCode(loc.countryCode())
                       .city(loc.city())
                       .latitude(loc.latitude())
                       .longitude(loc.longitude());
            });
            
            visitLogRepository.save(builder.build());
        } catch (Exception e) {
            log.error("Failed to log visit: {}", e.getMessage());
        }
    }
    
    public VisitStatsDTO getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime weekStart = LocalDate.now().minusWeeks(1).atStartOfDay();
        LocalDateTime monthStart = LocalDate.now().minusMonths(1).atStartOfDay();
        
        long totalVisits = visitLogRepository.count();
        long todayVisits = visitLogRepository.countSince(todayStart);
        long weekVisits = visitLogRepository.countSince(weekStart);
        long monthVisits = visitLogRepository.countSince(monthStart);
        long uniqueVisitors = visitLogRepository.countUniqueIpSince(LocalDateTime.MIN);
        long todayUniqueVisitors = visitLogRepository.countUniqueIpSince(todayStart);
        
        return new VisitStatsDTO(totalVisits, todayVisits, weekVisits, monthVisits, uniqueVisitors, todayUniqueVisitors);
    }
    
    public List<CountryVisitDTO> getCountryStats() {
        List<Object[]> results = visitLogRepository.countByCountry();
        return results.stream()
            .limit(20)
            .map(row -> {
                String countryCode = (String) row[0];
                String country = (String) row[1];
                long count = ((Number) row[2]).longValue();
                
                // 如果国家名为空，使用映射表
                if (country == null || country.isEmpty()) {
                    country = COUNTRY_NAMES.getOrDefault(countryCode, countryCode);
                }
                
                return new CountryVisitDTO(countryCode, country, count);
            })
            .collect(Collectors.toList());
    }
    
    public List<MapDataDTO> getMapData() {
        List<Object[]> results = visitLogRepository.countByCountry();
        return results.stream()
            .map(row -> {
                String countryCode = (String) row[0];
                String country = (String) row[1];
                long count = ((Number) row[2]).longValue();
                
                if (country == null || country.isEmpty()) {
                    country = COUNTRY_NAMES.getOrDefault(countryCode, countryCode);
                }
                
                // 获取国家中心坐标（简化处理，主要国家）
                BigDecimal[] coords = getCountryCoordinates(countryCode);
                
                return new MapDataDTO(country, countryCode, count, coords[0], coords[1]);
            })
            .collect(Collectors.toList());
    }
    
    public List<RecentVisitDTO> getRecentVisits() {
        List<VisitLog> logs = visitLogRepository.findTop100ByOrderByCreatedAtDesc();
        return logs.stream()
            .map(v -> new RecentVisitDTO(
                maskIp(v.getIpAddress()),
                v.getCountry() != null ? v.getCountry() : "Unknown",
                v.getCity() != null ? v.getCity() : "-",
                v.getPath(),
                truncate(v.getUserAgent(), 50),
                v.getCreatedAt() != null ? v.getCreatedAt().toString() : "-"
            ))
            .collect(Collectors.toList());
    }
    
    private String truncate(String str, int maxLength) {
        if (str == null) return null;
        return str.length() > maxLength ? str.substring(0, maxLength) : str;
    }
    
    private String maskIp(String ip) {
        if (ip == null) return "Unknown";
        // 遮蔽IP后两段
        String[] parts = ip.split("\\.");
        if (parts.length == 4) {
            return parts[0] + "." + parts[1] + ".*.*";
        }
        // IPv6处理
        if (ip.contains(":")) {
            String[] v6parts = ip.split(":");
            if (v6parts.length >= 4) {
                return v6parts[0] + ":" + v6parts[1] + ":****:****";
            }
        }
        return ip;
    }
    
    // 主要国家的中心坐标
    private BigDecimal[] getCountryCoordinates(String code) {
        return switch (code) {
            case "CN" -> new BigDecimal[]{BigDecimal.valueOf(35.86), BigDecimal.valueOf(104.19)};
            case "US" -> new BigDecimal[]{BigDecimal.valueOf(37.09), BigDecimal.valueOf(-95.71)};
            case "JP" -> new BigDecimal[]{BigDecimal.valueOf(36.20), BigDecimal.valueOf(138.25)};
            case "KR" -> new BigDecimal[]{BigDecimal.valueOf(35.91), BigDecimal.valueOf(127.77)};
            case "GB" -> new BigDecimal[]{BigDecimal.valueOf(55.38), BigDecimal.valueOf(-3.44)};
            case "DE" -> new BigDecimal[]{BigDecimal.valueOf(51.17), BigDecimal.valueOf(10.45)};
            case "FR" -> new BigDecimal[]{BigDecimal.valueOf(46.23), BigDecimal.valueOf(2.21)};
            case "CA" -> new BigDecimal[]{BigDecimal.valueOf(56.13), BigDecimal.valueOf(-106.35)};
            case "AU" -> new BigDecimal[]{BigDecimal.valueOf(-25.27), BigDecimal.valueOf(133.78)};
            case "SG" -> new BigDecimal[]{BigDecimal.valueOf(1.35), BigDecimal.valueOf(103.82)};
            case "HK" -> new BigDecimal[]{BigDecimal.valueOf(22.40), BigDecimal.valueOf(114.11)};
            case "TW" -> new BigDecimal[]{BigDecimal.valueOf(23.70), BigDecimal.valueOf(121.00)};
            case "RU" -> new BigDecimal[]{BigDecimal.valueOf(61.52), BigDecimal.valueOf(105.32)};
            case "IN" -> new BigDecimal[]{BigDecimal.valueOf(20.59), BigDecimal.valueOf(78.96)};
            case "BR" -> new BigDecimal[]{BigDecimal.valueOf(-14.24), BigDecimal.valueOf(-51.93)};
            default -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO};
        };
    }
}
