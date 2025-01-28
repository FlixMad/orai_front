import styled from "styled-components";
import { API_BASE_URL, ETC } from "../../configs/host-config";
import { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-config";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${ETC}/api/notifications`
        );
        setNotifications(response.data.result);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Container>
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
