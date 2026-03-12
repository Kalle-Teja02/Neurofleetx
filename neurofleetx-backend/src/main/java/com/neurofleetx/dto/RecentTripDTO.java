package com.neurofleetx.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentTripDTO {
    private Long tripId;
    private String driverName;
    private String status;
    private Double revenue;
}
