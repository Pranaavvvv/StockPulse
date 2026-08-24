package com.stockpulse.controller;

import com.stockpulse.domain.PricingSuggestion;
import com.stockpulse.domain.Product;
import com.stockpulse.domain.ProductStatus;
import com.stockpulse.domain.SuggestionStatus;
import com.stockpulse.domain.PriceHistory;
import com.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import com.stockpulse.repository.ReorderSuggestionRepository;
import com.stockpulse.repository.PriceHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/pricing-suggestions")
@CrossOrigin(origins = "*")
public class PricingSuggestionController {

    private final PricingSuggestionRepository suggestionRepository;
    private final ProductRepository productRepository;
    private final ReorderSuggestionRepository reorderRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public PricingSuggestionController(PricingSuggestionRepository suggestionRepository, ProductRepository productRepository, ReorderSuggestionRepository reorderRepository, PriceHistoryRepository priceHistoryRepository) {
        this.suggestionRepository = suggestionRepository;
        this.productRepository = productRepository;
        this.reorderRepository = reorderRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @GetMapping
    public java.util.List<PricingSuggestion> getPendingSuggestions() {
        return suggestionRepository.findByStatus(SuggestionStatus.PENDING);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PricingSuggestion> updateSuggestion(
            @PathVariable Long id,
            @RequestBody DTOs.UpdateSuggestionRequest request) {
        
        return suggestionRepository.findById(id).map(suggestion -> {
            suggestion.setStatus(request.getStatus());
            
            Product product = suggestion.getProduct();
            if (request.getStatus() == SuggestionStatus.ACCEPTED) {
                product.setCurrentPrice(suggestion.getRecommendedPrice());
                priceHistoryRepository.save(new PriceHistory(product, product.getCurrentPrice(), LocalDateTime.now()));
            }
            
            // Check if there are any other pending suggestions for this product
            boolean hasPendingPricing = suggestionRepository.existsByProductIdAndStatusAndIdNot(product.getId(), SuggestionStatus.PENDING, suggestion.getId());
            boolean hasPendingReorder = reorderRepository.existsByProductIdAndStatus(product.getId(), SuggestionStatus.PENDING);
            
            if (!hasPendingPricing && !hasPendingReorder) {
                product.setStatus(ProductStatus.ACTIVE);
            }
            
            productRepository.save(product);
            
            return ResponseEntity.ok(suggestionRepository.save(suggestion));
        }).orElse(ResponseEntity.notFound().build());
    }
}
