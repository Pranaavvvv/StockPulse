package com.stockpulse.service;

import com.stockpulse.domain.*;
import com.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.repository.ProductRepository;
import com.stockpulse.repository.ReorderSuggestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class InventoryProcessingService {

    private static final Logger log = LoggerFactory.getLogger(InventoryProcessingService.class);

    private final AdvisorRegistry advisorRegistry;
    private final PricingSuggestionRepository pricingRepo;
    private final ReorderSuggestionRepository reorderRepo;
    private final ProductRepository productRepo;

    public InventoryProcessingService(AdvisorRegistry advisorRegistry, PricingSuggestionRepository pricingRepo, ReorderSuggestionRepository reorderRepo, ProductRepository productRepo) {
        this.advisorRegistry = advisorRegistry;
        this.pricingRepo = pricingRepo;
        this.reorderRepo = reorderRepo;
        this.productRepo = productRepo;
    }

    @Transactional
    public void processSignal(Long productId, TriggerReason trigger) {
        // Fetch product with a pessimistic write lock to serialize concurrent access
        Product p = productRepo.findByIdWithLock(productId).orElse(null);
        if (p == null) {
            log.warn("Product {} not found during signal processing.", productId);
            return;
        }

        // Idempotency Check: if a PENDING suggestion already exists for this trigger, ignore.
        List<PricingSuggestion> existingPricing = pricingRepo.findByProductIdAndStatusAndTriggerReason(p.getId(), SuggestionStatus.PENDING, trigger);
        if (!existingPricing.isEmpty()) {
            log.info("PENDING pricing suggestion already exists for product {} and trigger {}. Aborting.", p.getId(), trigger);
            return;
        }

        List<ReorderSuggestion> existingReorder = reorderRepo.findByProductIdAndStatusAndTriggerReason(p.getId(), SuggestionStatus.PENDING, trigger);
        if (!existingReorder.isEmpty()) {
            log.info("PENDING reorder suggestion already exists for product {} and trigger {}. Aborting.", p.getId(), trigger);
            return;
        }

        CommerceAdvisor advisor = advisorRegistry.getCurrentAdvisor();

        // Execute them concurrently
        CompletableFuture<PricingSuggestion> pricingFuture = CompletableFuture.supplyAsync(() -> 
            advisor.generatePricingSuggestion(p, trigger)
        );

        CompletableFuture<ReorderSuggestion> reorderFuture = CompletableFuture.supplyAsync(() -> 
            advisor.generateReorderSuggestion(p, trigger)
        );

        CompletableFuture.allOf(pricingFuture, reorderFuture).join();

        try {
            PricingSuggestion pSuggestion = pricingFuture.get();
            
            // High-Confidence Auto-Apply (Sprint 3 Teaser)
            java.math.BigDecimal current = pSuggestion.getCurrentPrice();
            java.math.BigDecimal proposed = pSuggestion.getRecommendedPrice();
            java.math.BigDecimal diff = current.subtract(proposed).abs();
            java.math.BigDecimal fivePercent = current.multiply(java.math.BigDecimal.valueOf(0.05));
            
            if (pSuggestion.getConfidence() != null && pSuggestion.getConfidence() > 0.95 && diff.compareTo(fivePercent) <= 0) {
                pSuggestion.setStatus(SuggestionStatus.ACCEPTED);
                pSuggestion.setReasoning(pSuggestion.getReasoning() + " [AUTO-APPLIED: High Confidence & Low Variance]");
                p.setCurrentPrice(proposed);
            } else {
                p.setStatus(ProductStatus.PRICE_REVIEW_PENDING);
            }
            
            pricingRepo.save(pSuggestion);

            ReorderSuggestion rSuggestion = reorderFuture.get();
            reorderRepo.save(rSuggestion);
            
            productRepo.save(p);

            log.info("Generated and saved suggestions for product {}", p.getId());
        } catch (Exception e) {
            log.error("Failed to generate suggestions", e);
        }
    }
}
