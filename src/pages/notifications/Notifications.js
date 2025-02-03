import styled from "styled-components";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, CALENDAR } from "../../configs/host-config";
import axiosInstance from "../../configs/axios-config";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      console.log("=== 알림 데이터 요청 시작 ===");

      // 오늘 날짜 가져오기 (yyyy-MM-dd 형식)
      const today = new Date().toISOString().split("T")[0];

      try {
        const response = await axiosInstance.post(
          `${API_BASE_URL}${CALENDAR}/api/notifications?date=${today}`
        );
        console.log("서버 응답 데이터:", response.data);

        // 알림 데이터가 존재하면 상태 업데이트
        setNotifications(response.data.titles || []);
        console.log("알림 상태 업데이트 완료");
      } catch (err) {
        console.error("알림 데이터 요청 실패:", err);
        setError("알림을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }

      console.log("=== 알림 데이터 요청 종료 ===");
    };

    fetchNotifications();
  }, []);

  console.log("현재 알림 상태:", {
    notifications,
    loading,
    error,
  });

  return (
    <Container>
      <h2>오늘의 알림</h2>
      {loading && <p>알림을 불러오는 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {notifications.length > 0 ? (
        <NotificationList>
          {notifications.map((title, index) => (
            <NotificationItem key={index}>
              <Icon src="/images/icons/notification.png" alt="알림" />
              <Content>
                <Title>{title}</Title>
                <Message>오늘 일정이 있습니다.</Message>
                <Time>{new Date().toLocaleTimeString()}</Time>
              </Content>
            </NotificationItem>
          ))}
        </NotificationList>
      ) : (
        !loading && <p>오늘 알림이 없습니다.</p>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
  height: 100%;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Icon = styled.img`
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background2};
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text1};
`;

const Message = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 8px;
`;

const Time = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text2};
`;

export default Notifications;
