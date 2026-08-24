package com.stockpulse.service;

import com.stockpulse.domain.*;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service("RULE")
public class RuleBasedAdvisor implements CommerceAdvisor {

    @Override
    public PricingSuggestion generatePricingSuggestion(Product p, TriggerReason trigger) {
        BigDecimal newPrice = p.getCurrentPrice();
        String reasoning = "Holding price.";
        SuggestionDirection direction = SuggestionDirection.HOLD;

        if (p.getStockLevel() < p.getReorderThreshold()) {
            // Increase by 10%
            newPrice = p.getCurrentPrice().multiply(BigDecimal.valueOf(1.10)).setScale(2, RoundingMode.HALF_UP);
            direction = SuggestionDirection.INCREASE;
            reasoning = "Stock below threshold; increasing price by 10% to protect inventory.";
        } else if (p.getDemandVelocity() > getCategoryAverageVelocity(p.getCategory()) * 2) {
            // Increase by 5%
            newPrice = p.getCurrentPrice().multiply(BigDecimal.valueOf(1.05)).setScale(2, RoundingMode.HALF_UP);
            direction = SuggestionDirection.INCREASE;
            reasoning = "Demand velocity is 2x category average; increasing price by 5%.";
        }

        PricingSuggestion suggestion = new PricingSuggestion();
        suggestion.setProduct(p);
        suggestion.setCurrentPrice(p.getCurrentPrice());
        suggestion.setRecommendedPrice(newPrice);
        suggestion.setDirection(direction);
        suggestion.setConfidence(0.9);
        suggestion.setReasoning(reasoning);
        suggestion.setStatus(SuggestionStatus.PENDING);
        suggestion.setTriggerReason(trigger);

        return suggestion;
    }

    @Override
    public ReorderSuggestion generateReorderSuggestion(Product p, TriggerReason trigger) {
        int qty = Math.max(1, (p.getReorderThreshold() * 3) - p.getStockLevel());
        
        ReorderSuggestion suggestion = new ReorderSuggestion();
        suggestion.setProduct(p);
        suggestion.setCurrentStock(p.getStockLevel());
        suggestion.setRecommendedQuantity(qty);
        suggestion.setConfidence(0.85);
        suggestion.setReasoning("Rule-based logic: ordering up to 3x threshold minus current stock.");
        suggestion.setStatus(SuggestionStatus.PENDING);
        suggestion.setTriggerReason(trigger);

        return suggestion;
    }

    private double getCategoryAverageVelocity(Category category) {
        // Mocked average velocity for rule based logic
        return switch (category) {
            case ELECTRONICS -> 2.0;
            case APPAREL -> 5.0;
            case HOME -> 1.5;
        };
    }
}
