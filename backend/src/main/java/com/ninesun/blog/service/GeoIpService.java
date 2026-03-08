package com.ninesun.blog.service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.InetAddress;
import java.util.Optional;

@Slf4j
@Service
public class GeoIpService {
    
    @Value("${geoip.database.path:}")
    private String databasePath;
    
    private DatabaseReader databaseReader;
    
    @PostConstruct
    public void init() {
        if (databasePath != null && !databasePath.isEmpty()) {
            File database = new File(databasePath);
            if (database.exists()) {
                try {
                    databaseReader = new DatabaseReader.Builder(database).build();
                    log.info("GeoIP database loaded successfully from: {}", databasePath);
                } catch (IOException e) {
                    log.warn("Failed to load GeoIP database: {}", e.getMessage());
                }
            } else {
                log.warn("GeoIP database file not found: {}", databasePath);
            }
        }
    }
    
    public Optional<GeoLocation> getLocation(String ipAddress) {
        if (databaseReader == null) {
            return Optional.empty();
        }
        
        try {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            
            // 跳过本地IP
            if (inetAddress.isLoopbackAddress() || inetAddress.isSiteLocalAddress()) {
                return Optional.of(new GeoLocation("Local", "CN", "Local", null, null));
            }
            
            CityResponse response = databaseReader.city(inetAddress);
            
            String country = response.getCountry().getName();
            String countryCode = response.getCountry().getIsoCode();
            String city = response.getCity().getName();
            BigDecimal latitude = response.getLocation().getLatitude() != null 
                ? BigDecimal.valueOf(response.getLocation().getLatitude()) : null;
            BigDecimal longitude = response.getLocation().getLongitude() != null 
                ? BigDecimal.valueOf(response.getLocation().getLongitude()) : null;
            
            return Optional.of(new GeoLocation(country, countryCode, city, latitude, longitude));
        } catch (IOException | GeoIp2Exception e) {
            log.debug("Failed to resolve IP location: {} - {}", ipAddress, e.getMessage());
            return Optional.empty();
        }
    }
    
    public record GeoLocation(
        String country,
        String countryCode,
        String city,
        BigDecimal latitude,
        BigDecimal longitude
    ) {}
}
