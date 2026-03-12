package com.neurofleetx.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/manager")
public class ManagerController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome Fleet Manager";
    }
}
