package com.werewolf.gameplay.gateway;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class InternalWsClient {

    private static final int MAX_ATTEMPTS = 3;
    private static final long INITIAL_BACKOFF_MS = 250L;

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String internalToken;

    public InternalWsClient(
            @Value("${gateway.internal.base-url:http://localhost:3001}") String baseUrl,
            @Value("${gateway.internal.token:}") String internalToken) {
        this.restTemplate = new RestTemplate();
        this.baseUrl = baseUrl;
        this.internalToken = internalToken;
    }

    // gửi event "role_assigned" và đóng gói dữ liệu "role" vào 1 Map
    public boolean sendRoleAssigned(String roomId, String guestId, String role) {
        return sendPrivate(roomId, guestId, "role_assigned", Map.of("role", role));
    }

    public boolean sendPrivate(String roomId, String guestId, String event, Map<String, Object> data) {
        long backoffMs = INITIAL_BACKOFF_MS;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            boolean delivered = trySend(roomId, guestId, event, data);
            if (delivered) {
                return true;
            }
            if (attempt < MAX_ATTEMPTS) {
                sleep(backoffMs);
                backoffMs *= 2;
            }
        }
        return false;
    }

    // k3. http request , payload là {roomId, guestId, event, data}
    private boolean trySend(String roomId, String guestId, String event, Map<String, Object> data) {
        String url = baseUrl + "/internal/ws/private";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (internalToken != null && !internalToken.isBlank()) {
            headers.set("x-internal-token", internalToken);
        }

        Map<String, Object> body = Map.of(
                "roomId", roomId,
                "guestId", guestId,
                "event", event,
                "data", data);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
            // Req xong, check xem GW trả về delivered: true hay không, nếu GW báo nhận
            // thành công thì trả về true
            Object delivered = response.getBody() != null ? response.getBody().get("delivered") : null;
            if (delivered instanceof Boolean deliveredFlag) {
                return deliveredFlag;
            }
            log.warn("Internal WS response missing delivered flag for roomId={}, guestId={}", roomId, guestId);
            return false;
        } catch (RestClientException ex) {
            log.warn("Failed to send internal WS for roomId={}, guestId={}: {}", roomId, guestId, ex.getMessage());
            return false;
        }
    }

    private void sleep(long backoffMs) {
        try {
            Thread.sleep(backoffMs);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
