package com.ninesun.blog.controller;

import com.ninesun.blog.dto.CountryVisitDTO;
import com.ninesun.blog.dto.MapDataDTO;
import com.ninesun.blog.dto.RecentVisitDTO;
import com.ninesun.blog.dto.VisitStatsDTO;
import com.ninesun.blog.service.VisitLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/visits")
@RequiredArgsConstructor
public class VisitController {
    
    private final VisitLogService visitLogService;
    
    @GetMapping("/stats")
    public ResponseEntity<VisitStatsDTO> getStats() {
        return ResponseEntity.ok(visitLogService.getStats());
    }
    
    @GetMapping("/countries")
    public ResponseEntity<List<CountryVisitDTO>> getCountryStats() {
        return ResponseEntity.ok(visitLogService.getCountryStats());
    }
    
    @GetMapping("/map")
    public ResponseEntity<List<MapDataDTO>> getMapData() {
        return ResponseEntity.ok(visitLogService.getMapData());
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<RecentVisitDTO>> getRecentVisits() {
        return ResponseEntity.ok(visitLogService.getRecentVisits());
    }
}
