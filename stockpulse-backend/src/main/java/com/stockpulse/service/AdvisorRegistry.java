package com.stockpulse.service;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class AdvisorRegistry {

    private final Map<String, CommerceAdvisor> advisors;
    private final AtomicReference<String> currentStrategy = new AtomicReference<>("RULE"); // default

    public AdvisorRegistry(Map<String, CommerceAdvisor> advisors) {
        this.advisors = advisors;
    }

    public void setStrategy(String strategy) {
        if (advisors.containsKey(strategy)) {
            currentStrategy.set(strategy);
        } else {
            throw new IllegalArgumentException("Unknown strategy: " + strategy);
        }
    }

    public String getCurrentStrategyName() {
        return currentStrategy.get();
    }

    public CommerceAdvisor getCurrentAdvisor() {
        CommerceAdvisor advisor = advisors.get(currentStrategy.get());
        if (advisor == null) {
            return advisors.get("RULE"); // Safe fallback
        }
        return advisor;
    }
}
