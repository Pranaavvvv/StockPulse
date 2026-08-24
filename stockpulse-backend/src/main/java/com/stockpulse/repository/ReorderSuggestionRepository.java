package com.stockpulse.repository;

import com.stockpulse.domain.ReorderSuggestion;
import com.stockpulse.domain.SuggestionStatus;
import com.stockpulse.domain.TriggerReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReorderSuggestionRepository extends JpaRepository<ReorderSuggestion, Long> {
    List<ReorderSuggestion> findByProductIdAndStatusAndTriggerReason(Long productId, SuggestionStatus status, TriggerReason triggerReason);
    List<ReorderSuggestion> findByStatus(SuggestionStatus status);
    boolean existsByProductIdAndStatus(Long productId, SuggestionStatus status);
    boolean existsByProductIdAndStatusAndIdNot(Long productId, SuggestionStatus status, Long id);
}
