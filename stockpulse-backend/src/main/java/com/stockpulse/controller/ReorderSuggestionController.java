package com.stockpulse.controller;

import com.stockpulse.domain.ReorderSuggestion;
import com.stockpulse.domain.Product;
import com.stockpulse.domain.ProductStatus;
import com.stockpulse.domain.SuggestionStatus;
import com.stockpulse.repository.ReorderSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import com.stockpulse.repository.PricingSuggestionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reorder-suggestions")
@CrossOrigin(origins = "*")
public class ReorderSuggestionController {

    private final ReorderSuggestionRepository suggestionRepository;
    private final ProductRepository productRepository;
    private final PricingSuggestionRepository pricingRepository;

    public ReorderSuggestionController(ReorderSuggestionRepository suggestionRepository, ProductRepository productRepository, PricingSuggestionRepository pricingRepository) {
        this.suggestionRepository = suggestionRepository;
        this.productRepository = productRepository;
        this.pricingRepository = pricingRepository;
    }

    @GetMapping
    public java.util.List<ReorderSuggestion> getPendingSuggestions() {
        return suggestionRepository.findByStatus(SuggestionStatus.PENDING);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ReorderSuggestion> updateSuggestion(
            @PathVariable Long id,
            @RequestBody DTOs.UpdateSuggestionRequest request) {
        
        return suggestionRepository.findById(id).map(suggestion -> {
            suggestion.setStatus(request.getStatus());
            
            Product product = suggestion.getProduct();
            if (request.getStatus() == SuggestionStatus.ACCEPTED) {
                product.setStockLevel(product.getStockLevel() + suggestion.getRecommendedQuantity());
            }
            
            // Check if there are any other pending suggestions for this product
            boolean hasPendingPricing = pricingRepository.existsByProductIdAndStatus(product.getId(), SuggestionStatus.PENDING);
            boolean hasPendingReorder = suggestionRepository.existsByProductIdAndStatus(product.getId(), SuggestionStatus.PENDING);
            
            if (!hasPendingPricing && !hasPendingReorder) {
                product.setStatus(ProductStatus.ACTIVE);
            }
            
            productRepository.save(product);
            
            return ResponseEntity.ok(suggestionRepository.save(suggestion));
        }).orElse(ResponseEntity.notFound().build());
    }
}
