package com.stockpulse.repository;

import com.stockpulse.domain.PricingSuggestion;
import com.stockpulse.domain.SuggestionStatus;
import com.stockpulse.domain.TriggerReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PricingSuggestionRepository extends JpaRepository<PricingSuggestion, Long> {
    List<PricingSuggestion> findByProductIdAndStatusAndTriggerReason(Long productId, SuggestionStatus status, TriggerReason triggerReason);
    List<PricingSuggestion> findByStatus(SuggestionStatus status);
    boolean existsByProductIdAndStatus(Long productId, SuggestionStatus status);
}
