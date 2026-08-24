package com.stockpulse.service;

import com.stockpulse.domain.PricingSuggestion;
import com.stockpulse.domain.Product;
import com.stockpulse.domain.ReorderSuggestion;
import com.stockpulse.domain.TriggerReason;

public interface CommerceAdvisor {
    PricingSuggestion generatePricingSuggestion(Product p, TriggerReason trigger);
    ReorderSuggestion generateReorderSuggestion(Product p, TriggerReason trigger);
}
