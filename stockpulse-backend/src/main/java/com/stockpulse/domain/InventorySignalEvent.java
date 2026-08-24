package com.stockpulse.domain;

import org.springframework.context.ApplicationEvent;

public class InventorySignalEvent extends ApplicationEvent {

    private final Product product;
    private final TriggerReason triggerReason;

    public InventorySignalEvent(Object source, Product product, TriggerReason triggerReason) {
        super(source);
        this.product = product;
        this.triggerReason = triggerReason;
    }

    public Product getProduct() {
        return product;
    }

    public TriggerReason getTriggerReason() {
        return triggerReason;
    }
}
