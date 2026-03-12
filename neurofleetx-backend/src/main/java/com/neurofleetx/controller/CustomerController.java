package com.neurofleetx.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer")
public class CustomerController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome Customer";
    }
}