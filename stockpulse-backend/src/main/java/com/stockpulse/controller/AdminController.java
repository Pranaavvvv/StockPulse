package com.stockpulse.controller;

import com.stockpulse.service.AdvisorRegistry;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdvisorRegistry advisorRegistry;

    public AdminController(AdvisorRegistry advisorRegistry) {
        this.advisorRegistry = advisorRegistry;
    }

    @PostMapping("/strategy")
    public ResponseEntity<String> setStrategy(@RequestParam String name) {
        try {
            advisorRegistry.setStrategy(name);
            return ResponseEntity.ok("Strategy set to " + name);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
