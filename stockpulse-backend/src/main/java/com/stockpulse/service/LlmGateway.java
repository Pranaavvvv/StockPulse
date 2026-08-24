package com.stockpulse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class LlmGateway {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public LlmGateway(
            @Value("${llm.api-key:}") String apiKey,
            @Value("${llm.model:gemini-1.5-flash}") String model,
            @Value("${llm.base-url:https://generativelanguage.googleapis.com}") String baseUrl) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public String callLLM(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing LLM API Key");
        }

        // Gemini REST API Payload
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "response_mime_type", "application/json"
                )
        );

        String uri = "/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        try {
            Map<String, Object> response = restClient.post()
                    .uri(uri)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            return extractText(response);
        } catch (Exception e) {
            throw new RuntimeException("LLM call failed", e);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse LLM response format", e);
        }
    }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.isBlank();
    }
}
