package com.neurofleetx.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String gender;
    private String role;
    private String phone;
    private String city;
    private String aadhar;
    private String license;
    private String company;
    private String adminRegNo;
}
