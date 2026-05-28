package com.martzy.backend.controller;

import com.martzy.backend.model.CommissionRecord;
import com.martzy.backend.service.CommissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commissions")
public class CommissionController {
    private final CommissionService commissionService;

    public CommissionController(CommissionService commissionService) {
        this.commissionService = commissionService;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        List<CommissionRecord> all = commissionService.getAllCommissions();
        int fromIndex = Math.min(page * size, all.size());
        int toIndex = Math.min(fromIndex + size, all.size());
        List<CommissionRecord> pageList = all.subList(fromIndex, toIndex);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("commissions", pageList);
        resp.put("page", page);
        resp.put("size", size);
        resp.put("total", all.size());
        return ResponseEntity.ok().body(resp);
    }
}
