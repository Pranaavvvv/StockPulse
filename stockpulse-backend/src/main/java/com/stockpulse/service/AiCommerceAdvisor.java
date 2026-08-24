package com.stockpulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockpulse.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service("AI")
public class AiCommerceAdvisor implements CommerceAdvisor {

    private static final Logger log = LoggerFactory.getLogger(AiCommerceAdvisor.class);

    private final LlmGateway llmGateway;
    private final CommerceAdvisor ruleBasedAdvisor;
    private final ObjectMapper objectMapper;

    public AiCommerceAdvisor(LlmGateway llmGateway, @Qualifier("RULE") CommerceAdvisor ruleBasedAdvisor, ObjectMapper objectMapper) {
        this.llmGateway = llmGateway;
        this.ruleBasedAdvisor = ruleBasedAdvisor;
        this.objectMapper = objectMapper;
    }

    @Override
    public PricingSuggestion generatePricingSuggestion(Product p, TriggerReason trigger) {
        if (!llmGateway.hasApiKey()) {
            log.warn("No LLM_API_KEY found. Falling back to Rule-Based Strategy for Pricing.");
            return ruleBasedAdvisor.generatePricingSuggestion(p, trigger);
        }

        String prompt = String.format("""
            You are an expert commerce advisor.
            Product: %s (SKU: %s, Category: %s)
            Current Price: %s
            Stock Level: %d (Reorder Threshold: %d)
            Demand Velocity: %s per day
            Trigger Reason: %s
            
            Based on the Trigger Reason (e.g. if INVENTORY_LOW, weigh clearance vs margin protection), suggest a new price.
            Respond strictly in JSON format with exactly these keys:
            {
               "recommendedPrice": 99.99,
               "direction": "INCREASE" | "DECREASE" | "HOLD",
               "confidence": 0.95,
               "reasoning": "Clear explanation of the strategy"
            }
            """, p.getName(), p.getSku(), p.getCategory(), p.getCurrentPrice(), p.getStockLevel(), p.getReorderThreshold(), p.getDemandVelocity(), trigger);

        try {
            // Using CompletableFuture to enforce timeout as part of resiliency
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> llmGateway.callLLM(prompt));
            String rawResponse = future.get(5, TimeUnit.SECONDS);
            
            return parseAndValidatePricing(rawResponse, p, trigger);
        } catch (Exception e) {
            log.error("LLM call failed or timed out. Falling back to Rule-Based Strategy.", e);
            return ruleBasedAdvisor.generatePricingSuggestion(p, trigger);
        }
    }

    @Override
    public ReorderSuggestion generateReorderSuggestion(Product p, TriggerReason trigger) {
        if (!llmGateway.hasApiKey()) {
            log.warn("No LLM_API_KEY found. Falling back to Rule-Based Strategy for Reorder.");
            return ruleBasedAdvisor.generateReorderSuggestion(p, trigger);
        }

        String prompt = String.format("""
            You are an expert supply chain advisor.
            Product: %s (SKU: %s, Category: %s)
            Current Stock: %d
            Reorder Threshold: %d
            Demand Velocity: %s per day
            Trigger Reason: %s
            
            Consider lead times and supplier batches to determine the best reorder quantity.
            Respond strictly in JSON format with exactly these keys:
            {
               "recommendedQuantity": 50,
               "confidence": 0.95,
               "reasoning": "Clear explanation of the strategy"
            }
            """, p.getName(), p.getSku(), p.getCategory(), p.getStockLevel(), p.getReorderThreshold(), p.getDemandVelocity(), trigger);

        try {
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> llmGateway.callLLM(prompt));
            String rawResponse = future.get(5, TimeUnit.SECONDS);
            
            return parseAndValidateReorder(rawResponse, p, trigger);
        } catch (Exception e) {
            log.error("LLM call failed or timed out. Falling back to Rule-Based Strategy.", e);
            return ruleBasedAdvisor.generateReorderSuggestion(p, trigger);
        }
    }

    private PricingSuggestion parseAndValidatePricing(String rawResponse, Product p, TriggerReason trigger) throws Exception {
        // Strip markdown backticks if present
        String json = rawResponse.replaceAll("```json", "").replaceAll("```", "").trim();
        JsonNode node = objectMapper.readTree(json);
        
        BigDecimal recommendedPrice = new BigDecimal(node.get("recommendedPrice").asText());
        String reasoning = node.get("reasoning").asText();
        
        // Bounds validation: > 0 and within +/- 50%
        BigDecimal lowerBound = p.getCurrentPrice().multiply(BigDecimal.valueOf(0.5));
        BigDecimal upperBound = p.getCurrentPrice().multiply(BigDecimal.valueOf(1.5));
        
        if (recommendedPrice.compareTo(BigDecimal.ZERO) <= 0 || 
            recommendedPrice.compareTo(lowerBound) < 0 || 
            recommendedPrice.compareTo(upperBound) > 0) {
            throw new IllegalArgumentException("Recommended price " + recommendedPrice + " is out of acceptable bounds (+/- 50%).");
        }
        
        // Margin Floor Guardrail
        if (p.getMarginFloor() != null && recommendedPrice.compareTo(p.getMarginFloor()) < 0) {
            recommendedPrice = p.getMarginFloor();
            reasoning += " (System Overridden: Adjusted to protect margin floor of $" + p.getMarginFloor() + ")";
        }
        
        PricingSuggestion suggestion = new PricingSuggestion();
        suggestion.setProduct(p);
        suggestion.setCurrentPrice(p.getCurrentPrice());
        suggestion.setRecommendedPrice(recommendedPrice.setScale(2, RoundingMode.HALF_UP));
        suggestion.setDirection(SuggestionDirection.valueOf(node.get("direction").asText()));
        suggestion.setConfidence(node.get("confidence").asDouble());
        suggestion.setReasoning(reasoning);
        suggestion.setStatus(SuggestionStatus.PENDING);
        suggestion.setTriggerReason(trigger);
        
        return suggestion;
    }

    private ReorderSuggestion parseAndValidateReorder(String rawResponse, Product p, TriggerReason trigger) throws Exception {
        String json = rawResponse.replaceAll("```json", "").replaceAll("```", "").trim();
        JsonNode node = objectMapper.readTree(json);
        
        int quantity = node.get("recommendedQuantity").asInt();
        
        // Bounds validation
        if (quantity <= 0) {
            throw new IllegalArgumentException("Recommended quantity must be > 0.");
        }
        
        ReorderSuggestion suggestion = new ReorderSuggestion();
        suggestion.setProduct(p);
        suggestion.setCurrentStock(p.getStockLevel());
        suggestion.setRecommendedQuantity(quantity);
        suggestion.setConfidence(node.get("confidence").asDouble());
        suggestion.setReasoning(node.get("reasoning").asText());
        suggestion.setStatus(SuggestionStatus.PENDING);
        suggestion.setTriggerReason(trigger);
        
        return suggestion;
    }
}
