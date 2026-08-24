package com.stockpulse.service;

import com.stockpulse.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service("COMPETITOR")
public class CompetitorAwareAdvisor implements CommerceAdvisor {

    @Override
    public PricingSuggestion generatePricingSuggestion(Product p, TriggerReason trigger) {
        // Mock scraping competitor data
        BigDecimal competitorPrice = p.getCurrentPrice().multiply(BigDecimal.valueOf(0.9)).setScale(2, RoundingMode.HALF_UP);
        
        BigDecimal recommendedPrice = competitorPrice;
        String reasoning = "Scraped competitor Amazon is selling at $" + competitorPrice + ". Matching price to remain competitive.";
        
        // Apply Margin Floor Guardrail (same as AI)
        if (p.getMarginFloor() != null && recommendedPrice.compareTo(p.getMarginFloor()) < 0) {
            recommendedPrice = p.getMarginFloor();
            reasoning += " (System Overridden: Adjusted to protect margin floor of $" + p.getMarginFloor() + ")";
        }

        PricingSuggestion suggestion = new PricingSuggestion();
        suggestion.setProduct(p);
        suggestion.setCurrentPrice(p.getCurrentPrice());
        suggestion.setRecommendedPrice(recommendedPrice);
        suggestion.setDirection(SuggestionDirection.DECREASE);
        suggestion.setConfidence(0.99); // High confidence because we matched competitor
        suggestion.setReasoning(reasoning);
        suggestion.setStatus(SuggestionStatus.PENDING);
        suggestion.setTriggerReason(trigger);
        
        return suggestion;
    }

    @Override
    public ReorderSuggestion generateReorderSuggestion(Product p, TriggerReason trigger) {
        // Just return a basic reorder for this strategy
        ReorderSuggestion suggestion = new ReorderSuggestion();
        suggestion.setProduct(p);
        suggestion.setCurrentStock(p.getStockLevel());
        suggestion.setRecommendedQuantity((p.getReorderThreshold() * 3) - p.getStockLevel());
        suggestion.setConfidence(0.85);
        suggestion.setReasoning("Standard reorder formula applied in Competitor Strategy.");
        suggestion.setStatus(SuggestionStatus.PENDING);
        suggestion.setTriggerReason(trigger);
        
        return suggestion;
    }
}
