import styled from "styled-components";

const CreateChatRoom = () => {
  return (
    <Container>
      <EmptyStateImage src="/images/icons/chat-plus.png" alt="새 채팅방" />
      <Title>새로운 채팅방 만들기</Title>
      <Description>
        새로운 채팅방을 만들어 팀원들과 대화를 시작해보세요.
      </Description>
      <CreateButton>
        <img src="/images/icons/plus-circle.png" alt="생성" />
        채팅방 만들기
      </CreateButton>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: white;
`;

const EmptyStateImage = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  opacity: 0.7;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text1};
  margin-bottom: 12px;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 32px;
  text-align: center;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.secondary1};
    transform: translateY(-1px);
  }
`;

export default CreateChatRoom;
