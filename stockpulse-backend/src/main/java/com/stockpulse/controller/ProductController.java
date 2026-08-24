package com.stockpulse.controller;

import com.stockpulse.domain.Category;
import com.stockpulse.domain.Product;
import com.stockpulse.domain.ProductStatus;
import com.stockpulse.domain.TriggerReason;
import com.stockpulse.repository.ProductRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*") // For frontend
public class ProductController {

    private final ProductRepository productRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ProductController(ProductRepository productRepository, ApplicationEventPublisher eventPublisher) {
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    public List<Product> getProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) Category category) {
        
        if (status != null && category != null) {
            return productRepository.findByStatusAndCategory(status, category);
        } else if (status != null) {
            return productRepository.findByStatus(status);
        } else if (category != null) {
            return productRepository.findByCategory(category);
        }
        return productRepository.findAll();
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable Long id, @RequestBody DTOs.UpdateStockRequest request) {
        return productRepository.findById(id).map(product -> {
            product.setStockLevel(request.getNewStockLevel());
            Product saved = productRepository.save(product);
            
            TriggerReason reason = saved.getStockLevel() < saved.getReorderThreshold() ? TriggerReason.INVENTORY_LOW : TriggerReason.MANUAL;
            eventPublisher.publishEvent(new com.stockpulse.domain.InventorySignalEvent(this, saved, reason));
            
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/orders")
    public ResponseEntity<Product> simulateOrder(@PathVariable Long id, @RequestBody DTOs.OrderRequest request) {
        return productRepository.findById(id).map(product -> {
            int qty = request.getQuantity() != null ? request.getQuantity() : 1;
            product.setStockLevel(Math.max(0, product.getStockLevel() - qty));
            product.setDemandVelocity(product.getDemandVelocity() + (qty * 0.1));
            Product saved = productRepository.save(product);
            
            TriggerReason reason = saved.getStockLevel() < saved.getReorderThreshold() ? TriggerReason.INVENTORY_LOW : TriggerReason.DEMAND_SPIKE;
            eventPublisher.publishEvent(new com.stockpulse.domain.InventorySignalEvent(this, saved, reason));
            
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/suggest-pricing")
    public ResponseEntity<Void> suggestPricing(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            eventPublisher.publishEvent(new com.stockpulse.domain.InventorySignalEvent(this, product, TriggerReason.MANUAL));
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/suggest-reorder")
    public ResponseEntity<Void> suggestReorder(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            eventPublisher.publishEvent(new com.stockpulse.domain.InventorySignalEvent(this, product, TriggerReason.MANUAL));
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/suggest-pricing/stream")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamPricingSuggestion(@PathVariable Long id) {
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(60000L);
        
        CompletableFuture.runAsync(() -> {
            try {
                // For demonstration, simulating streaming of reasoning chunks
                String[] chunks = {
                    "Analyzing product data...\n",
                    "Stock is below threshold.\n",
                    "Demand velocity is steady.\n",
                    "Recommending a 5% price increase to preserve margins.\n",
                    "Finalizing JSON payload..."
                };
                
                for (String chunk : chunks) {
                    emitter.send(chunk);
                    Thread.sleep(500);
                }
                
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
}
