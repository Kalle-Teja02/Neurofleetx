package com.neurofleetx.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FleetDashboardResponse {
    private Double totalRevenue;
    private Long activeTrips;
    private Long totalVehicles;
    private Long activeDrivers;
    private Double averageTripRevenue;
    private String topDriverName;
    private Map<String, Double> monthlyRevenue;
    private List<RecentTripDTO> recentTrips;
    private String motivationalMessage;
}
