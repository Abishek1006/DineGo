package com.backend.backendjar.service;

import com.backend.backendjar.dto.FoodSalesReportDTO;
import com.backend.backendjar.dto.MonthlySalesReportDTO;
import com.backend.backendjar.dto.TableUsageReportDTO;
import com.backend.backendjar.repository.DiningGroupRepository;
import com.backend.backendjar.repository.OrderItemRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final OrderItemRepository orderItemRepository;
    private final DiningGroupRepository diningGroupRepository;

    public List<FoodSalesReportDTO> getTopSellingFoods() {
        return orderItemRepository.findTopSellingFoods();
    }

    public List<FoodSalesReportDTO> getLeastSellingFoods() {
        return orderItemRepository.findLeastSellingFoods();
    }

    public List<MonthlySalesReportDTO> getMonthlySales() {
        return orderItemRepository.findMonthlySales();
    }

    public List<TableUsageReportDTO> getTableUsage() {
        return diningGroupRepository.findTableUsage();
    }
}