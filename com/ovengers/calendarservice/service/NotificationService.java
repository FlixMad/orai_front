public List<Notification> getNotificationsForUser(String userId) {
    log.info("=== 사용자별 알림 조회 서비스 시작 ===");
    log.info("조회 대상 사용자 ID: {}", userId);
    
    List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    log.info("조회된 알림 수: {}", notifications.size());
    log.debug("조회된 알림 목록: {}", notifications);
    
    log.info("=== 사용자별 알림 조회 서비스 완료 ===");
    return notifications;
} 