package com.backend.backendjar.controller;

import com.backend.backendjar.dto.FoodSalesReportDTO;
import com.backend.backendjar.dto.MonthlySalesReportDTO;
import com.backend.backendjar.dto.TableUsageReportDTO;
import com.backend.backendjar.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {
    
    private final ReportService reportService;
    
    @GetMapping("/top-selling-foods")
    public ResponseEntity<List<FoodSalesReportDTO>> getTopSellingFoods() {
        return ResponseEntity.ok(reportService.getTopSellingFoods());
    }
    
    @GetMapping("/least-selling-foods")
    public ResponseEntity<List<FoodSalesReportDTO>> getLeastSellingFoods() {
        return ResponseEntity.ok(reportService.getLeastSellingFoods());
    }
    
    @GetMapping("/monthly-sales")
    public ResponseEntity<List<MonthlySalesReportDTO>> getMonthlySales() {
        return ResponseEntity.ok(reportService.getMonthlySales());
    }
    
    @GetMapping("/table-usage")
    public ResponseEntity<List<TableUsageReportDTO>> getTableUsage() {
        return ResponseEntity.ok(reportService.getTableUsage());
    }
}