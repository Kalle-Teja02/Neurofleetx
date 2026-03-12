package com.neurofleetx.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/driver")
public class DriverController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome Driver";
    }
}
