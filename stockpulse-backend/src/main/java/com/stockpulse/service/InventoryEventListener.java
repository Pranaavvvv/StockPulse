package com.stockpulse.service;

import com.stockpulse.domain.*;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class InventoryEventListener {

    private final InventoryProcessingService inventoryProcessingService;

    public InventoryEventListener(InventoryProcessingService inventoryProcessingService) {
        this.inventoryProcessingService = inventoryProcessingService;
    }

    @Async
    @EventListener
    public void handleInventorySignal(InventorySignalEvent event) {
        inventoryProcessingService.processSignal(event.getProduct().getId(), event.getTriggerReason());
    }
}
