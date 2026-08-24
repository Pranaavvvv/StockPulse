package com.stockpulse.controller;

import com.stockpulse.domain.SuggestionStatus;

public class DTOs {

    public static class UpdateStockRequest {
        private Integer newStockLevel;

        public Integer getNewStockLevel() { return newStockLevel; }
        public void setNewStockLevel(Integer newStockLevel) { this.newStockLevel = newStockLevel; }
    }

    public static class OrderRequest {
        private Integer quantity;

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class UpdateSuggestionRequest {
        private SuggestionStatus status;

        public SuggestionStatus getStatus() { return status; }
        public void setStatus(SuggestionStatus status) { this.status = status; }
    }
}
