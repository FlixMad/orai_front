import styled from "styled-components";

const Notifications = () => {
  return (
    <Container>
      <NotificationList>
        <NotificationItem>
          <Icon src="/images/icons/vacation.png" alt="휴가" />
          <Content>
            <Title>휴가 신청이 승인되었습니다</Title>
            <Message>3월 15일 휴가 신청이 승인되었습니다.</Message>
            <Time>1시간 전</Time>
          </Content>
        </NotificationItem>
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
