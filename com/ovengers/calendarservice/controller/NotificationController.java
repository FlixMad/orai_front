package com.ovengers.calendarservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/")
    public ResponseEntity<List<Notification>> getNotifications() {
        log.info("=== 알림 조회 API 호출 시작 ===");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof TokenUserInfo)) {
            log.warn("인증되지 않은 사용자의 접근 시도");
            return ResponseEntity.status(401).build();
        }

        TokenUserInfo userInfo = (TokenUserInfo) authentication.getPrincipal();
        log.info("인증된 사용자 ID: {}", userInfo.getId());
        
        List<Notification> notifications = notificationService.getNotificationsForUser(userInfo.getId());
        log.info("조회된 알림 개수: {}", notifications.size());
        log.debug("조회된 알림 상세: {}", notifications);
        
        log.info("=== 알림 조회 API 호출 완료 ===");
        return ResponseEntity.ok(notifications);
    }
} 