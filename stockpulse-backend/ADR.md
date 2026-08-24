# Architecture Decision Records (ADR)

## 1. Where does commerce logic live?
**Context**: As the system grows, pricing, inventory alerts, supplier PO generation, and LLM integrations can easily bloat a single service class. We need a clear boundary for commerce decisions.
**Options**:
1. Put all logic inside `ProductService`.
2. Create a dedicated `CommerceAdvisor` component that strictly handles decision generation without touching database persistence or event publishing.
**Decision**: We chose Option 2 (dedicated `CommerceAdvisor` interface). The `InventoryEventListener` handles the database state and persistence (the "Agentic Loop"), while the `CommerceAdvisor` is a pure function-like component that takes context and returns suggestions.
**Tradeoffs**: This introduces slight indirection (the listener has to pass entities to the advisor and save the results), but it perfectly isolates the AI and rule-based logic for easier testing and prevents the advisor from accumulating side-effects.

## 2. Unified AI call vs separate pricing/reorder calls?
**Context**: We need AI recommendations for both pricing and reordering when a trigger occurs. 
**Options**: 
1. Use one large prompt that returns a combined JSON object containing both pricing and reorder logic.
2. Use two separate prompts (one for pricing, one for reorder) executed concurrently.
**Decision**: We chose **Split Contracts (Option 2)**. The `generatePricingSuggestion` and `generateReorderSuggestion` are strictly separated and executed concurrently via `CompletableFuture`.
**Tradeoffs**: We incur the cost of two network calls to the LLM (higher latency and token cost), but we gain massive architectural resilience. If the pricing LLM hallucinates an invalid price or times out, it gracefully falls back to the `RuleBasedAdvisor` for pricing *without* destroying the perfectly valid reorder suggestion. It also allows us to give hyper-focused context to the AI (e.g. margin protection for pricing vs supplier lead time for reordering).

## 3. How does runtime strategy switching work?
**Context**: We need to switch between the Rule-Based strategy and the AI-Powered strategy dynamically without a JVM restart.
**Options**:
1. A database configuration flag queried on every request.
2. An `AdvisorRegistry` bean holding a `Map<String, CommerceAdvisor>` and an `AtomicReference` for the active strategy.
**Decision**: We chose the `AdvisorRegistry` (Option 2).
**Tradeoffs**: It's incredibly fast (in-memory atomic reference) and allows seamless addition of a `CompetitorAwareStrategy` in Sprint 2 simply by registering a new bean. However, changes are strictly in-memory and will revert to the default ("RULE") upon JVM restart.

## 4. LLM failure handling
**Context**: LLMs are unpredictable. They can time out, return malformed JSON, or suggest absurd prices.
**Options**:
1. Bubble up the exception and drop the suggestion.
2. Catch the exception and use a deterministic fallback.
**Decision**: We wrapped the LLM execution in a `try-catch` block with a strict timeout (`future.get(5, TimeUnit.SECONDS)`). We strictly validate bounds. If any validation fails, or if the API key is missing, it silently delegates to the `RuleBasedAdvisor`. We dynamically append `(System Fallback due to AI Timeout/Key Missing)` to the reasoning and penalize the confidence score by 10%.
**Tradeoffs**: Safe deterministic action is infinitely better than a dropped alert. Adding the fallback tag ensures merchandisers understand *why* a suggestion might seem generic, maintaining trust in the AI's actual outputs. 

## 5. Agentic loop trigger and decoupling
**Context**: When an order simulates a demand spike, we need to generate suggestions without blocking the HTTP response.
**Options**:
1. Synchronously call the advisor before returning `ResponseEntity`.
2. Schedule a cron job to poll for low stock.
3. Publish a Spring `ApplicationEvent` handled by an `@Async` listener.
**Decision**: Option 3 (`@Async` event listener). The listener delegates to a `@Transactional` `InventoryProcessingService` that fetches the `Product` using a Pessimistic Write Lock (`@Lock(LockModeType.PESSIMISTIC_WRITE)`).
**Tradeoffs**: Fully decouples the core order flow from heavy LLM execution. The pessimistic lock prevents idempotency race conditions (where concurrent order spikes could queue duplicate AI calls), guaranteeing that only one thread evaluates the pending status for a given product at a time.

## 6. Extensibility and exclusions
**Context**: We need to build the foundation for Sprint 2 (Competitor pricing and margin floors).
**Options**: We added `costPrice` and `marginFloor` fields to the `Product` entity.
**Decision**: These fields are nullable and ready for the `CompetitorAwareStrategy` to utilize. We explicitly **excluded** automated Purchase Order (PO) generation and auto-applying prices (except for high-confidence edge cases).
**Tradeoffs**: The loop generally requires human intervention (the Checkpoint). We prioritized the core event-driven loop and strategy registry over building a full storefront.

## 7. Sprint 2 & 3 Forward-Compatibility (MVP Features)
**Context**: To prove the architecture is truly ready for future sprints, we implemented three key guardrails and extensions ahead of schedule.
**Decision**: 
1. **CompetitorAwareAdvisor**: We created a third strategy (`COMPETITOR`) that simulates scraping competitor prices and matching them. It proves the `AdvisorRegistry` allows hot-swapping logic via `POST /admin/strategy?name=COMPETITOR` without a JVM restart.
2. **Margin Floor Guardrails**: The `AiCommerceAdvisor` strictly validates that LLM suggestions never dip below the `marginFloor`. If it does, the system overrides the price to the floor and notes it in the reasoning block.
3. **High-Confidence Auto-Apply**: In the `InventoryEventListener`, if the AI's confidence is `> 0.95` AND the variance is `< 5%`, the suggestion bypasses the human checkpoint queue, gets marked `ACCEPTED`, and updates the live price instantly. This proves Sprint 3 Automation viability.

## 8. Event Sourcing / Price History Ledger
**Context**: Accepting pricing suggestions previously overwrote the `currentPrice` on the product without preserving historical changes, making accurate price history charts impossible.
**Decision**: We introduced a `PriceHistory` domain entity to act as an immutable ledger. Whenever a pricing suggestion is `ACCEPTED`, the `PricingSuggestionController` writes a new entry into the `price_history` table with the updated price and timestamp.
**Tradeoffs**: Adds a slight write overhead during the approval process, but guarantees absolute data fidelity and auditability for price fluctuations over time, which is essential for a commerce platform.
