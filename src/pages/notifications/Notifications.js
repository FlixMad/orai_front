import styled from "styled-components";
import { API_BASE_URL, ETC } from "../../configs/host-config";
import { useEffect, useState, useContext } from "react";
import axiosInstance from "../../configs/axios-config";
import { fetchNotificationCount } from "../../utils/notificationUtils";
import { UserContext } from "../../context/UserContext";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { setNotificationCount } = useContext(UserContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${ETC}/api/notifications`
        );
        setNotifications(response.data.result);

        // 알림 개수 업데이트
        setNotificationCount(0);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
  }, [setNotificationCount]);

  return (
    <Container>
      {notifications.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🔔</EmptyIcon>
          <EmptyText>새로운 알림이 없습니다.</EmptyText>
        </EmptyState>
      ) : (
        <NotificationList>
          {notifications.map((notification, index) => (
            <NotificationItem key={index}>
              <Icon src={notification.icon} alt={notification.title} />
              <Content>
                <Title>{notification.title}</Title>
                <Message>{notification.message}</Message>
                <Time>{notification.time}</Time>
              </Content>
            </NotificationItem>
          ))}
        </NotificationList>
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text2};
`;

export default Notifications;
